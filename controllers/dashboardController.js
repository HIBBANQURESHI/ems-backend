import Department from "../models/Department.js";
import Employee from "../models/Employee.js"
import Leave from "../models/Leave.js";

const getSummary = async (req, res) => {
        try {
            const totalEmployees = await Employee.countDocuments() || 0;
            const totalDepartments = await Department.countDocuments() || 0;
    
            const totalSalaries = await Employee.aggregate([
                { $group: { _id: null, totalSalary: { $sum: "$salary" } } }
            ]);
            
            const totalSalary = totalSalaries.length > 0 ? totalSalaries[0].totalSalary : 0;  // ✅ Ensure it's not undefined
    
            const employeeAppliedForLeave = await Leave.distinct('employeeId') || [];
    
            const leaveStatus = await Leave.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]) || [];
    
            const leaveSummary = {
                appliedFor: employeeAppliedForLeave.length || 0,
                approved: leaveStatus.find(item => item._id === "Approved")?.count || 0,
                rejected: leaveStatus.find(item => item._id === "Rejected")?.count || 0,
                pending: leaveStatus.find(item => item._id === "Pending")?.count || 0,
            };
    
            return res.status(200).json({
                success: true,
                totalEmployees,
                totalDepartments,
                totalSalary,
                leaveSummary
            });
    
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ success: false, error: "Dashboard summary error" });
        }
    };  

export {getSummary}