import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', // Reference to the Employee model
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'leave'],
        required: true
    }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
