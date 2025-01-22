import express from 'express'
import { markAttendance, getAttendanceRecords } from '../controllers/attendanceContoller.js';
import authMiddleware from '../middleware/authMiddlware.js'

const router = express.Router();

// Route to mark attendance
router.post('/mark', authMiddleware, markAttendance);

// Route to view attendance for a specific month
router.get('/records', authMiddleware, getAttendanceRecords);

export default router