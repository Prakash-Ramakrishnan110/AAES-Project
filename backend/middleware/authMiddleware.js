const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch fresh user data from database
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = user;
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req?.user?.role || 'Guest'} is not authorized into this route`
            });
        }
        next();
    };
};

// Check if the request is for a past semester and block write operations
const protectPastSemesters = (req, res, next) => {
    // Skip protection for GET requests (Read-Only allows viewing)
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    if (!req.user) {
        return next(); // Fail safe: proceed if user context isn't available to this middleware
    }

    // Safely extract requested semester with fallback
    const semesterFromQuery = req.query?.semester;
    const semesterFromBody = req.body?.semester;
    const requestedSemester = parseInt(semesterFromQuery || semesterFromBody);
    
    // Staff/Admin/HOD may not have a semester property on their User object
    const currentSemester = req.user?.semester ? parseInt(req.user.semester) : null;

    if (requestedSemester && currentSemester && requestedSemester < currentSemester) {
        return res.status(403).json({
            message: 'Read-Only Mode: Historical data from past semesters cannot be modified.',
            isReadOnly: true
        });
    }

    next();
};

module.exports = { protect, authorize, protectPastSemesters };
