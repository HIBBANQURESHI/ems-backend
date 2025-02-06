import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

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
        const { employeeId } = req.params;
        const { status } = req.body;
        const date = new Date().toISOString().split('T')[0];

        // Find employee by employeeId
        const employee = await Employee.findOne({ _id: employeeId });

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Update attendance for the specific employee on the current date
        const attendance = await Attendance.findOneAndUpdate(
            { employeeId: employee._id, date },
            { status },
            { new: true, upsert: true }
        );

        if (!attendance) {
            return res.status(404).json({ success: false, message: "Attendance record not found" });
        }

        res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.log(error); // Log the error for better debugging
        res.status(500).json({ success: false, message: error.message });
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

const getMonthlyAttendanceSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Month and year are required." });
        }

        // Get the first and last date of the given month
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(year, month, 0);

        // Fetch attendance records for the month
        const attendanceData = await Attendance.find({
            date: { $gte: startDate.toISOString().split('T')[0], $lte: endDate.toISOString().split('T')[0] }
        }).populate("employeeId");

        // Group attendance by employee
        const employeeAttendance = {};
        attendanceData.forEach(record => {
            const empId = record.employeeId._id;
            if (!employeeAttendance[empId]) {
                employeeAttendance[empId] = { 
                    name: record.employeeId.userId.name,
                    department: record.employeeId.department.dep_name,
                    presents: 0,
                    absents: 0,
                    sick: 0,
                    leave: 0
                };
            }
            employeeAttendance[empId][record.status.toLowerCase()]++;
        });

        return res.status(200).json({ success: true, data: Object.values(employeeAttendance) });

    } catch (error) {
        console.error("Error fetching monthly attendance:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export {getAttendance, updateAttendance, attendanceReport, getMonthlyAttendanceSummary}