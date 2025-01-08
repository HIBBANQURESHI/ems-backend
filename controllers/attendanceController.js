import Employee from '../models/Employee.js';

// Mark attendance
export const markAttendance = async (req, res) => {
    try {
        const { attendanceRecords, date } = req.body;
        const formattedDate = new Date(date).toISOString();

        for (const record of attendanceRecords) {
            const { employeeId, status } = record;

            // Update the attendance only if not already marked for the date
            await Employee.updateOne(
                { _id: employeeId, "attendance.date": { $ne: formattedDate } },
                { $push: { attendance: { date: formattedDate, status } } }
            );
        }

        return res.status(200).json({ success: true, message: "Attendance marked successfully!" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        return res.status(500).json({ success: false, error: "Server error while marking attendance." });
    }
};


// Get attendance by date
export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const formattedDate = new Date(date).toISOString();

        // Retrieve employees and their attendance for the selected date
        const employees = await Employee.find().populate("userId", "name").lean();

        const attendance = employees.map((emp) => {
            const attendanceForDate = emp.attendance.find((att) => att.date.toISOString() === formattedDate);
            return {
                employeeId: emp._id,
                name: emp.userId.name,
                department: emp.department,
                status: attendanceForDate ? attendanceForDate.status : "Absent",
            };
        });

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching attendance." });
    }
};

