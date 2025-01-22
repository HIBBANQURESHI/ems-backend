import Attendance from '../models/Attendance.js';
import Employee  from '../models/Employee.js';

export const markAttendance = async (req, res) => {
  console.log("Request Body:", req.body);
  const { attendanceData } = req.body;

  if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
          success: false,
          message: "Invalid attendance data. Ensure it's an array.",
      });
  }

  try {
      for (const attendance of attendanceData) {
          const { empId, status } = attendance;

          if (!empId || !status) {
              return res.status(400).json({
                  success: false,
                  message: "Employee ID and status are required.",
              });
          }

          // Populate the `userId` field
          const employee = await Employee.findById(empId).populate("userId", "name");
          if (!employee) {
              return res.status(404).json({
                  success: false,
                  message: `Employee with ID ${empId} not found.`,
              });
          }

          const date = new Date();
          const existingAttendance = await Attendance.findOne({
              employeeId: empId,
              date: {
                  $gte: new Date(date.setHours(0, 0, 0, 0)),
                  $lt: new Date(date.setHours(23, 59, 59, 999)),
              },
          });

          if (existingAttendance) {
              return res.status(400).json({
                  success: false,
                  message: `Attendance for employee ${employee.userId?.name || "Unknown"} (${empId}) is already marked.`,
              });
          }

          const newAttendance = new Attendance({
              employeeId: empId,
              date: new Date(),
              status,
          });

          await newAttendance.save();
      }

      return res.status(201).json({
          success: true,
          message: "Attendance marked successfully.",
      });
  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
          success: false,
          message: "Error marking attendance.",
          error,
      });
  }
};



export const getAttendanceRecords = async (req, res) => {
  console.log(req.query);
  const { employeeId, month, year } = req.query;

  // Validate the parameters
  if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
  }

  const parsedMonth = parseInt(month, 10); // Convert month to integer
  const parsedYear = parseInt(year, 10); // Convert year to integer

  if (isNaN(parsedMonth) || isNaN(parsedYear)) {
      return res.status(400).json({ success: false, message: "Invalid month or year values." });
  }

  // Ensure month is valid (0 to 11 for January to December)
  if (parsedMonth < 0 || parsedMonth > 11) {
      return res.status(400).json({ success: false, message: "Invalid month value." });
  }

  try {
      // Construct the start and end date for the given month and year
      const startDate = new Date(parsedYear, parsedMonth, 1); // Start of the month (1st day)
      const endDate = new Date(parsedYear, parsedMonth + 1, 0); // End of the month (last day)

      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);

      // Fetch attendance records
      const attendanceRecords = await Attendance.find({
          employeeId: employeeId,
          date: { $gte: startDate, $lte: endDate }
      });

      // If no records found
      if (attendanceRecords.length === 0) {
          return res.status(404).json({ success: false, message: "No attendance records found for this employee." });
      }

      res.status(200).json({ success: true, records: attendanceRecords });
  } catch (err) {
      console.error("Error fetching attendance records:", err);
      res.status(500).json({ success: false, message: 'Server error while fetching attendance records.', error: err.message });
  }
};




