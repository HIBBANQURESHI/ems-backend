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

        // Count total attendance per employee
        const attendanceCount = await Attendance.aggregate([
            {
                $group: {
                    _id: "$employeeId",
                    totalPresent: {
                        $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
                    },
                    totalAbsent: {
                        $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "employees",
                    localField: "_id",
                    foreignField: "_id",
                    as: "employee"
                }
            },
            {
                $unwind: "$employee"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "employee.userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    employeeId: "$employee.employeeId",
                    employeeName: "$user.name",
                    totalPresent: 1,
                    totalAbsent: 1
                }
            }
        ]);

        return res.status(200).json({ success: true, groupData, attendanceCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




export {getAttendance, updateAttendance, attendanceReport} 