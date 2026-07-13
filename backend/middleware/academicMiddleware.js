const User = require('../models/User');

/**
 * Middleware to restrict modifications to past semesters.
 * Modules 2: Block POST, PUT, DELETE if targetSemester < user.semester
 */
const restrictToCurrentSemester = (req, res, next) => {
    // Only restrict mutation requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const { targetSemester } = req.body || req.query;
    
    // If no target semester specified, proceed (or handle as current)
    if (!targetSemester) {
        return next();
    }

    const userSemester = req.user?.semester ? parseInt(req.user.semester) : (parseInt(req.user?.batch) || 1);
    const requestedSemester = parseInt(targetSemester);

    if (requestedSemester && userSemester && requestedSemester < userSemester) {
        return res.status(403).json({
            message: 'Access Denied: Past semester data is in read-only mode.',
            isReadOnly: true
        });
    }

    next();
};

/**
 * RBAC Helper for Class Advisor logic
 */
const authorizeAdvisor = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'hod') {
        return next();
    }

    // A staff member is an advisor if they are assigned to any class in ClassAdvisor model
    // This will be checked in specific routes where the target student is known.
    next();
};

module.exports = {
    restrictToCurrentSemester,
    authorizeAdvisor
};
