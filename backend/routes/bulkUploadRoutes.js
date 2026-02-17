const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const User = require('../models/User');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

/**
 * @desc    Bulk upload users from CSV
 * @route   POST /api/users/bulk-upload
 * @access  Private/Admin
 * 
 * Expected CSV format:
 * username,email,password,role,department,academicYear,semester
 */
router.post('/bulk-upload', protect, authorize('admin'), upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const users = [];
    const errors = [];
    let lineNumber = 0;

    try {
        // Read and parse CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    lineNumber++;

                    // Validate required fields
                    if (!row.username || !row.email || !row.password || !row.role) {
                        errors.push({
                            line: lineNumber,
                            error: 'Missing required fields',
                            data: row
                        });
                        return;
                    }

                    // Validate role
                    const validRoles = ['admin', 'hod', 'staff', 'student'];
                    if (!validRoles.includes(row.role.toLowerCase())) {
                        errors.push({
                            line: lineNumber,
                            error: 'Invalid role',
                            data: row
                        });
                        return;
                    }

                    users.push({
                        username: row.username.trim(),
                        email: row.email.trim(),
                        password: row.password.trim(),
                        role: row.role.toLowerCase().trim(),
                        department: row.department ? row.department.trim() : undefined,
                        academicYear: row.academicYear ? row.academicYear.trim() : undefined,
                        semester: row.semester ? row.semester.trim() : undefined
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Cleanup uploaded file
        fs.unlinkSync(filePath);

        // If there are validation errors, return them
        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation errors found',
                errors,
                successCount: 0,
                failedCount: errors.length
            });
        }

        // Bulk insert users
        const createdUsers = [];
        const failed = [];

        for (const userData of users) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({
                    $or: [{ email: userData.email }, { username: userData.username }]
                });

                if (existingUser) {
                    failed.push({
                        user: userData.username,
                        error: 'User with this email or username already exists'
                    });
                    continue;
                }

                const user = await User.create(userData);
                createdUsers.push({
                    username: user.username,
                    email: user.email,
                    role: user.role
                });
            } catch (error) {
                failed.push({
                    user: userData.username,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Bulk upload completed',
            successCount: createdUsers.length,
            failedCount: failed.length,
            created: createdUsers,
            failed
        });

    } catch (error) {
        // Cleanup file on error
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
