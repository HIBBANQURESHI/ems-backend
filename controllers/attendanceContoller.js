import Attendance from '../models/Attendance.js';
import Employee  from '../models/Employee.js';

export const markAttendance = async (req, res) => {
    console.log(req.body); // Log the request body to debug
    const { attendanceData } = req.body;

    try {
        for (const attendance of attendanceData) {
            const { empId, status } = attendance;

            // Validation: Ensure both employeeId and status are present
            if (!empId || !status) {
                return res.status(400).json({ message: 'Employee ID and status are required.' });
            }

            // Check if the employee exists
            const employee = await Employee.findById(empId);
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found.' });
            }

            const date = new Date();

            // Check if the attendance for today already exists
            const existingAttendance = await Attendance.findOne({
                employeeId: empId,
                date: { $gte: new Date(date.setHours(0, 0, 0, 0)), $lt: new Date(date.setHours(23, 59, 59, 999)) }
            });

            if (existingAttendance) {
                return res.status(400).json({ message: 'Attendance for today is already marked.' });
            }

            // Create new attendance record
            const newAttendance = new Attendance({
                employeeId: empId,
                date: new Date(),
                status
            });

            await newAttendance.save();
        }

        return res.status(201).json({ success: true, message: 'Attendance marked successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error marking attendance', error });
    }
}
  


// Get attendance for a specific month
export const getMonthlyAttendance = async (req, res) => {
  const { employeeId, month, year } = req.query;

  try {
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`)
      }
    });

    res.json({ attendanceRecords });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error });
  }
};
