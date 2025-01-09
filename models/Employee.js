import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const employeeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true },
    dob: { type: Date },
    gender: { type: String },
    martialStatus: { type: String },
    designation: { type: String },
    department: { type: String },
    salary: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

employeeSchema.methods.getCurrentMonthAttendance = function () {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return this.attendance.filter((entry) => new Date(entry.date).getMonth() === firstDayOfMonth.getMonth());
};

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
