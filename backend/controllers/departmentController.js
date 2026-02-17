const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res) => {
    const { name, description } = req.body;

    const departmentExists = await Department.findOne({ name });

    if (departmentExists) {
        return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
        name,
        description
    });

    if (department) {
        res.status(201).json(department);
    } else {
        res.status(400).json({ message: 'Invalid department data' });
    }
};

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (Admin/HOD/Staff/Student)
const getDepartments = async (req, res) => {
    const departments = await Department.find({}).populate('hod', 'username email');
    res.json(departments);
};

// @desc    Update department (Assign HOD usually)
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
    const { name, description, hodId } = req.body;

    const department = await Department.findById(req.params.id);

    if (department) {
        department.name = name || department.name;
        department.description = description || department.description;

        if (hodId) {
            const hodUser = await User.findById(hodId);
            if (!hodUser || hodUser.role !== 'hod') {
                return res.status(400).json({ message: 'Invalid HOD user' });
            }
            department.hod = hodId;
        }

        const updatedDepartment = await department.save();
        res.json(updatedDepartment);
    } else {
        res.status(404).json({ message: 'Department not found' });
    }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
    const department = await Department.findById(req.params.id);

    if (department) {
        await department.deleteOne();
        res.json({ message: 'Department removed' });
    } else {
        res.status(404).json({ message: 'Department not found' });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
};
