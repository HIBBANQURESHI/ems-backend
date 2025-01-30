import Attendance from '../models/Attendance.js'
import Employee from '../models/Employee.js'

const getAttendance = async (req, res) => {
    try {
        const date = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

        const attendance = await Attendance.find({ date }).populate('employeeId');


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
            { new: true }
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


export {getAttendance, updateAttendance, attendanceReport}