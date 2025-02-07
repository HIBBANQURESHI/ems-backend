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
        const {date, limit = 5, skip = 0 } = req.query;
        const query = {};

        if(date) {
            query.date = date;
        }

        const attendanceData = await Attendance.find(query)
        .populate({
            path: "employeeId", 
            populate: [
                "department",
                "userId"
            ] 
        }).sort({date: -1}).skip(parseInt(skip)).limit(parseInt(limit))

        const groupData = attendanceData.reduce((result, record) => {
            if(!result[record.date]) {
                result[record.date] = []
            }
            result[record.date].push({
                employeeId: record.employeeId.employeeId,
                employeeName: record.employeeId.userId.name,
                departmentName: record.employeeId.department.dep_name,
                status: record.status || "Not Marked"
            })
            return result;
        }, {})
        return res.status(201).json({success: true, groupData})
    } catch(error) {
        res.status(500).json({success:false , message: error.message})
    }
};

const getMonthlySummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Convert to numbers and validate
        const numericMonth = Number(month);
        const numericYear = Number(year);
        
        if (isNaN(numericMonth) || isNaN(numericYear) || 
            numericMonth < 1 || numericMonth > 12 ||
            numericYear < 2000 || numericYear > 2100) {
            return res.status(400).json({ success: false, message: "Invalid month/year" });
        }

        const startDate = new Date(numericYear, numericMonth - 1, 1);
        const endDate = new Date(numericYear, numericMonth, 0);

        // Add console logs for debugging
        console.log(`Fetching summary for ${numericMonth}-${numericYear}`);
        console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        const summary = await Attendance.aggregate([
            {
                $match: {
                    date: {
                        $gte: startDate.toISOString().split('T')[0],
                        $lte: endDate.toISOString().split('T')[0]
                    }
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('Raw aggregation result:', summary);

        // Handle case for null status
        const result = summary.reduce((acc, curr) => {
            const status = curr._id || 'Not Marked';
            acc[status.toLowerCase()] = curr.count;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            summary: {
                present: result.present || 0,
                absent: result.absent || 0,
                sick: result.sick || 0,
                leave: result.leave || 0,
                notMarked: result['not marked'] || 0
            }
        });

    } catch (error) {
        console.error('Error in monthly summary:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getEmployeeTotals = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const totals = await Attendance.aggregate([
            {
                $match: { employeeId: mongoose.Types.ObjectId(employeeId) }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = totals.reduce((acc, curr) => {
            acc[curr._id.toLowerCase()] = curr.count;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            totals: {
                present: result.present || 0,
                absent: result.absent || 0,
                sick: result.sick || 0,
                leave: result.leave || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export {getAttendance, updateAttendance, attendanceReport, getMonthlySummary, getEmployeeTotals} 