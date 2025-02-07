import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'
import mongoose from "mongoose";


const getAttendance = async (req, res) => {
    try {
        const date = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

        const attendance = await Attendance.find({ date }).populate({
            path: "employeeId",
            populate: [
                { path: "userId", select: "name" },  // Populate name
                { path: "department", select: "dep_name" } // Populate department
            ]
        });

        if (!attendance || attendance.length === 0) {
            return res.status(404).json({ success: false, message: "No attendance records found." });
        }

        res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.log('Error in getAttendance controller:', error); // Log the error details
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const {employeeId} = req.params
        const {status} = req.body
        const date = new Date().toISOString().split('T')[0]
        const employee = await Employee.findOne({employeeId})

        const attendance = await Attendance.findOneAndUpdate({employeeId: new mongoose.Types.ObjectId(employee._id), date}, {status}, {new: true, upsert: true})

        res.status(200).json({success: true, attendance})
    } catch(error) {
        res.status(500).json({success:false , message: error.message})
    }
};

const attendanceReport = async (req, res) => {
    try {
        const { date, limit = 5, skip = 0 } = req.query;
        const query = {};

        if (date) {
            query.date = date;
        }

        const attendanceData = await Attendance.find(query)
            .populate({
                path: "employeeId",
                populate: ["department", "userId"]
            })
            .sort({ date: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const groupData = attendanceData.reduce((result, record) => {
            if (!result[record.date]) {
                result[record.date] = [];
            }
            result[record.date].push({
                employeeId: record.employeeId.employeeId,
                employeeName: record.employeeId.userId.name,
                departmentName: record.employeeId.department.dep_name,
                status: record.status || "Not Marked"
            });
            return result;
        }, {});
        return res.status(200).json({ success: true, groupData, attendanceCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const getMonthlyAttendanceSummary = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;

        if (!employeeId || !month || !year) {
            return res.status(400).json({ success: false, message: "Employee ID, month, and year are required." });
        }
        if (month < 1 || month > 12) {
            return res.status(400).json({ success: false, message: "Invalid month." });
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); 
        const attendanceData = await Attendance.find({
            employeeId: new mongoose.Types.ObjectId(employeeId),
            date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] }
        });

        if (!attendanceData || attendanceData.length === 0) {
            return res.status(404).json({ success: false, message: "No attendance records found for this employee in the given month." });
        }

        // Calculate the total number of Present and Absent days
        const attendanceSummary = attendanceData.reduce((summary, record) => {
            if (record.status === "Present") {
                summary.present += 1;
            } else if (record.status === "Absent") {
                summary.absent += 1;
            }
            return summary;
        }, { present: 0, absent: 0 });

        res.status(200).json({
            success: true,
            attendanceSummary,
            totalDays: attendanceData.length,
        });
    } catch (error) {
        console.log('Error in getMonthlyAttendanceSummary controller:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export {getAttendance, updateAttendance, attendanceReport, getMonthlyAttendanceSummary} 