import Employee from '../models/Employee.js';

// Mark attendance
export const markAttendance = async (req, res) => {
    try {
        const { attendanceRecords } = req.body; // Array of {employeeId, status}
        const date = new Date(req.body.date).toISOString();

        for (const record of attendanceRecords) {
            const { employeeId, status } = record;
            await Employee.updateOne(
                { _id: employeeId, "attendance.date": { $ne: date } },
                { $push: { attendance: { date, status } } }
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

        const employees = await Employee.find({ "attendance.date": formattedDate }).select('userId attendance');
        return res.status(200).json({ success: true, employees });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching attendance." });
    }
};
