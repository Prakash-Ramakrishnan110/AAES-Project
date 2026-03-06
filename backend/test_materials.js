const mongoose = require('mongoose');

async function testFetch() {
    try {
        await mongoose.connect('mongodb://localhost:27017/aaes');

        const User = require('./models/User');
        const reqUser = await User.findOne({ username: 'prakash1935' });

        console.log("Prakash Dept:", reqUser.department, "Sem:", reqUser.semester);

        const Subject = require('./models/Subject');
        const studentSubjects = await Subject.find({
            department: reqUser.department,
            semester: reqUser.semester
        }).select('_id');

        const subjectIds = studentSubjects.map(s => s._id);
        console.log("Subject IDs:", subjectIds);

        const StudyMaterial = require('./models/StudyMaterial');
        let filters = { visible: true, subjectId: { $in: subjectIds } };

        const materials = await StudyMaterial.find(filters)
            .select('-extractedText')
            .populate('subjectId', 'name code semester')
            .populate('uploadedBy', 'fullName username')
            .sort({ createdAt: -1 });

        console.log('Materials returned:', materials.length);
        console.log(JSON.stringify(materials, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

testFetch();
