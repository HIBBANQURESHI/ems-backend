import Attendance from '../models/Attendance.js';

export const markAttendance = async (req, res) => {
    try {
        const { attendanceRecords, date } = req.body;
        console.log("Received Data:", attendanceRecords, date);

        const formattedDate = new Date(date);
        // Normalize the date to only include the date (00:00:00) part for consistency
        formattedDate.setHours(0, 0, 0, 0);

        for (const record of attendanceRecords) {
            const { employeeId, status } = record;

            // Check if the attendance for the given date and employee already exists
            const existingAttendance = await Attendance.findOne({
                employeeId,
                date: { $gte: formattedDate, $lt: new Date(formattedDate).setHours(23, 59, 59, 999) }
            });

            if (!existingAttendance) {
                // Save new attendance record
                const newAttendance = new Attendance({
                    employeeId,
                    date: formattedDate,
                    status,
                });
                await newAttendance.save();
            } else {
                // Update existing attendance record
                existingAttendance.status = status;
                await existingAttendance.save();
            }
        }

        return res.status(200).json({ success: true, message: "Attendance marked successfully!" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        return res.status(500).json({ success: false, error: "Server error while marking attendance." });
    }
};


export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const formattedDate = new Date(date);
        // Normalize the date to only include the date (00:00:00) part
        formattedDate.setHours(0, 0, 0, 0);

        // Fetch attendance records for the selected date
        const attendanceRecords = await Attendance.find({ 
            date: { $gte: formattedDate, $lt: new Date(formattedDate).setHours(23, 59, 59, 999) }
        })
        .populate('employeeId', 'userId department')
        .lean();

        const attendance = attendanceRecords.map((record) => ({
            employeeId: record.employeeId._id,
            name: record.employeeId.userId.name,
            department: record.employeeId.department,
            status: record.status,
        }));

        return res.status(200).json({ success: true, attendance });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return res.status(500).json({ success: false, error: "Server error while fetching attendance." });
    }
};
