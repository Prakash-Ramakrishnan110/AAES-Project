const WorkAssignment = require('../models/WorkAssignment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Assign work to a staff member
// @route   POST /api/work-assignments
// @access  Private/HOD
exports.assignWork = async (req, res) => {
    try {
        const { title, description, assignedToId, assigneeType, startDate, dueDate, priority, isBulk, studentIds } = req.body;
        const department = req.user.department?.toString().trim();

        const userId = req.user._id;
        
        const type = assigneeType || 'Staff';

        // Bulk Student Assignment Logic
        if (isBulk && type === 'Student' && Array.isArray(studentIds) && studentIds.length > 0) {
            
            // Generate base taskId

            const startCount = await WorkAssignment.countDocuments();
            
            const assignments = studentIds.map((studentId, index) => ({
                taskId: `TASK-${String(startCount + index + 1).padStart(4, '0')}`,
                title,
                description,
                department: department,
                assignedBy: userId,
                startDate,
                dueDate,
                priority,
                assigneeType: 'Student',
                assignedStudentId: studentId
            }));

            const createdTasks = await WorkAssignment.insertMany(assignments);

            // Notify all students

            const notifications = studentIds.map(studentId => ({
                user: studentId,
                title: `New Task Assigned: ${title}`,
                message: `You have been assigned a new task by the HOD. Due on ${new Date(dueDate).toLocaleDateString()}.`,
                type: 'Info',
                link: '/student/dashboard'
            }));
            await Notification.insertMany(notifications);

            return res.status(201).json({ 
                success: true, 
                message: `Successfully assigned task to ${studentIds.length} students.`,
                data: createdTasks 
            });
        }

        // Individual Assignment Logic (Existing)

        const targetUser = await User.findById(assignedToId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'Individual Assignee not found.' });
        }

        const userDept = targetUser.department?.toString().trim();
        const userRole = targetUser.role?.toLowerCase();

        const deptMatch = String(userDept).toLowerCase().trim() === String(department).toLowerCase().trim();
        const roleMatch = userRole === type.toLowerCase();

        if (!deptMatch || !roleMatch) {
            return res.status(403).json({
                success: false,
                message: `Cannot assign task: Assignee department (${userDept}) does not match your department (${department}), or the selected user is not a ${type}.`,
            });
        }

        const taskData = {
            title,
            description,
            department: department,
            assignedBy: userId,
            startDate,
            dueDate,
            priority,
            assigneeType: type
        };

        if (type === 'Staff') {
            taskData.assignedStaffId = assignedToId;
        } else {
            taskData.assignedStudentId = assignedToId;
        }

        const task = new WorkAssignment(taskData);
        await task.save();

        try {
            await Notification.create({
                user: assignedToId,
                title: `New Task Assigned: ${title}`,
                message: `You have been assigned a new task by the HOD. Due on ${new Date(dueDate).toLocaleDateString()}.`,
                type: 'Info',
                link: type === 'Staff' ? '/staff/my-work' : '/student/dashboard'
            });
        } catch (notifErr) {
            console.error('[DEBUG] Notification Error:', notifErr.message);
        }

        res.status(201).json({ success: true, message: 'Task assigned successfully.', data: task });
    } catch (error) {
        console.error('[DEBUG] assignWork CATCH ERROR:', error);
        res.status(500).json({ success: false, message: 'Server error assigning work.', error: error.message });
    }
};

// @desc    Get all work assignments for the department
// @route   GET /api/work-assignments/department
// @access  Private/HOD
exports.getDepartmentWork = async (req, res) => {
    try {
        const dept = req.user.department?.toString().trim();
        console.log('[DEBUG] getDepartmentWork - depth:', dept);

        const tasks = await WorkAssignment.find({ department: new RegExp(`^${dept}$`, 'i') })
            .populate({ path: 'assignedStaffId', select: 'fullName username email', options: { strictPopulate: false } })
            .populate({ path: 'assignedStudentId', select: 'fullName username email registerNumber', options: { strictPopulate: false } })
            .populate({ path: 'assignedBy', select: 'fullName username', options: { strictPopulate: false } })
            .sort({ dueDate: 1 })
            .lean();

        res.status(200).json({ success: true, data: tasks || [] });
    } catch (error) {
        console.error('[DEBUG] getDepartmentWork ERROR:', error);
        res.status(500).json({ success: false, message: 'Server error fetching department tasks.', error: error.message, stack: error.stack });
    }
};

// @desc    Get my assigned work
// @route   GET /api/work-assignments/me
// @access  Private/Staff
exports.getMyWork = async (req, res) => {
    try {
        const tasks = await WorkAssignment.find({ 
            $or: [
                { assignedStaffId: req.user._id },
                { assignedStudentId: req.user._id }
            ]
        })
            .populate('assignedBy', 'fullName username')
            .sort({ dueDate: 1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        console.error('Get my work error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching your tasks.' });
    }
};

// @desc    Update task status
// @route   PUT /api/work-assignments/:id/status
// @access  Private/Staff
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        let task = await WorkAssignment.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        // Verify it belongs to the logged in user (Staff or Student)
        const isAssignedStaff = task.assignedStaffId && task.assignedStaffId.toString() === req.user._id.toString();
        const isAssignedStudent = task.assignedStudentId && task.assignedStudentId.toString() === req.user._id.toString();

        if (!isAssignedStaff && !isAssignedStudent) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this task.' });
        }

        task.status = status;
        await task.save();

        // Optionally notify HOD if completed
        if (status === 'Completed') {
            await Notification.create({
                user: task.assignedBy, // The HOD
                title: `Task Completed: ${task.title}`,
                message: `${req.user.name} has completed their assigned task.`,
                type: 'Success',
                link: '/hod/work-assignments'
            });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ success: false, message: 'Server error updating task status.' });
    }
};
