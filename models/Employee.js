import mongoose from "mongoose";
import { Schema } from "mongoose";

const employeeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employeeId: { type: String, required: true, unique: true },
    dob: { type: Date },
    gender: { type: String },
    martialStatus: { type: String },
    designation: { type: String },
    department: { type: String },
    salary: { type: Number, required: true },
    attendance: [
        {
            date: { type: Date, required: true },
            status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
