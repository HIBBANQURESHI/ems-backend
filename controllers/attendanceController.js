import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'
import mongoose from "mongoose";


const getAttendance = async (req, res) => {
    try {
        const { date } = req.query;  // Get date from query params

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (date && !dateRegex.test(date)) {
            return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." });
        }

        // Use provided date or default to today
        const selectedDate = date || new Date().toISOString().split('T')[0];

        const attendance = await Attendance.find({ date: selectedDate }).populate({
            path: "employeeId",
            populate: [
                { path: "userId", select: "name" },
                { path: "department", select: "dep_name" }
            ]
        });

        // Return an empty array if no records exist
        res.status(200).json({ success: true, attendance: attendance || [] });
    } catch (error) {
        console.error('Error in getAttendance:', error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};


const updateAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { status, date } = req.body;
        const selectedDate = date || new Date().toISOString().split('T')[0];

        // Find the employee by employeeId
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
        }

        // Find or create the attendance record
        const attendance = await Attendance.findOneAndUpdate(
            { employeeId: employee._id, date: selectedDate },
            { status },
            { new: true, upsert: true } // Create a new record if it doesn't exist
        );

        res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error("Update Attendance Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const attendanceReport = async (req, res) => {
    try {
        const { date, limit = "5", skip = "0" } = req.query;

        // Ensure limit and skip are valid numbers
        const parsedLimit = parseInt(limit);
        const parsedSkip = parseInt(skip);

        if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
            return res.status(400).json({ success: false, message: "Invalid limit or skip value" });
        }

        const query = {};
        if (date) query.date = date;

        const attendanceData = await Attendance.find(query)
            .populate({
                path: "employeeId",
                populate: ["department", "userId"]
            })
            .sort({ date: -1 })
            .skip(parsedSkip)
            .limit(parsedLimit);

        if (!attendanceData.length) {
            return res.status(404).json({ success: false, message: "No attendance data found" });
        }

        const groupData = attendanceData.reduce((result, record) => {
            if (!result[record.date]) {
                result[record.date] = [];
            }
            result[record.date].push({
                employeeId: record.employeeId?.employeeId || "N/A",
                employeeName: record.employeeId?.userId?.name || "Unknown",
                departmentName: record.employeeId?.department?.dep_name || "Unknown",
                status: record.status || "Not Marked"
            });
            return result;
        }, {});

        return res.status(200).json({ success: true, groupData });
    } catch (error) {
        console.error("Attendance Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

const getMonthlySummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Validate inputs
        const numericMonth = parseInt(month);
        const numericYear = parseInt(year);
        
        if (isNaN(numericMonth) || isNaN(numericYear) || 
            numericMonth < 1 || numericMonth > 12 ||
            numericYear < 2000 || numericYear > 2100) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid month/year provided" 
            });
        }

        // Create date range (first to last day of month)
        const startDate = new Date(numericYear, numericMonth - 1, 1);
        const endDate = new Date(numericYear, numericMonth, 0);
        
        // Format dates to match database format (YYYY-MM-DD)
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        console.log(`Querying from ${start} to ${end}`);

        const aggregation = await Attendance.aggregate([
            {
                $match: {
                    date: { 
                        $gte: start, 
                        $lte: end 
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

        console.log('Aggregation result:', aggregation);

        // Transform results with default values
        const summary = aggregation.reduce((acc, curr) => {
            const status = curr._id?.toLowerCase() || 'not marked';
            acc[status] = curr.count;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            summary: {
                present: summary.present || 0,
                absent: summary.absent || 0,
                sick: summary.sick || 0,
                leave: summary.leave || 0,
                notMarked: summary['not marked'] || 0
            }
        });

    } catch (error) {
        console.error('Monthly summary error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

const getEmployeeTotals = async (req, res) => {
    try {
      const { employeeId } = req.params;
  
      // Find the employee by employeeId (not _id)
      const employee = await Employee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }
  
      // Aggregate attendance counts grouped by status
      const totals = await Attendance.aggregate([
        {
          $match: {
            employeeId: employee._id,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
  
      // Format the response, ensuring missing statuses are included with 0 count
      const result = {
        present: 0,
        absent: 0,
        sick: 0,
        leave: 0,
      };
  
      totals.forEach((record) => {
        const status = record._id?.toLowerCase();
        if (status) {
          result[status] = record.count;
        }
      });
  
      res.status(200).json({
        success: true,
        employeeId,
        totals: result,
      });
    } catch (error) {
      console.error("Employee totals error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
};

export {getAttendance, updateAttendance, attendanceReport, getMonthlySummary, getEmployeeTotals} 