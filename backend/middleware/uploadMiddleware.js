const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Generates a dynamic storage configuration for Multer.
 * This is now designed to be called within a middleware to ensure req.user exists.
 */
const getDynamicStorage = (subfolder = '') => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            // Construct a friendly identifier: fullName_registerNumber
            const namePart = req.user?.fullName ? req.user.fullName.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
            const regPart = req.user?.registerNumber || req.user?._id?.toString() || 'ID';
            const identifier = `${namePart}_${regPart}`.toLowerCase();
            
            // Allow subfolder to be passed as argument OR detected from body category
            const bodyCategory = req.body?.category ? req.body.category.toString().trim() : '';
            const finalSubfolder = subfolder || bodyCategory;

            const uploadBase = path.resolve(__dirname, '..', 'uploads');
            const targetDir = path.join(uploadBase, identifier, finalSubfolder);
            
            // Console log for real-time server monitoring
            console.log(`[Multer] Target: ${targetDir} (User: ${identifier}, Sub: ${finalSubfolder})`);
            
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            
            cb(null, targetDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
};

const checkDocumentFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png)|application\/pdf/.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only Images and PDFs are allowed'));
};

const checkImageFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only Images are allowed'));
};

/**
 * Middleware factory for documents
 */
const documentUpload = (req, res, next) => {
    const upload = multer({
        storage: getDynamicStorage(''), // Root of student folder
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => checkDocumentFileType(file, cb)
    }).single('file');

    upload(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
};

/**
 * Middleware factory for profile images
 */
const profileUpload = (req, res, next) => {
    const upload = multer({
        storage: getDynamicStorage(''), 
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => checkImageFileType(file, cb)
    }).single('profileImage');

    upload(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
};

/**
 * Middleware factory for generic dynamic uploads (e.g. assignments)
 */
const createDynamicUpload = (subfolder, fieldName = 'file') => {
    return (req, res, next) => {
        const upload = multer({
            storage: getDynamicStorage(subfolder),
            limits: { fileSize: 15 * 1024 * 1024 }
        }).single(fieldName);

        upload(req, res, (err) => {
            if (err) return res.status(400).json({ message: err.message });
            next();
        });
    };
};

module.exports = {
    documentUpload,
    profileUpload,
    createDynamicUpload,
    getDynamicStorage // Keep for routes that need it directly
};
