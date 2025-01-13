import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const salarySchema = new Schema({
  employeeId: { type: String, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 }, // Corrected field name
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true }, // Ensure this field is required
  payDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Salary = mongoose.model('Salary', salarySchema);

export default Salary;
