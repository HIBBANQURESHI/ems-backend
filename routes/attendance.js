import express from 'express'
import { markAttendance, getMonthlyAttendance } from '../controllers/attendanceContoller.js';
import authMiddleware from '../middleware/authMiddlware.js'

const router = express.Router();

// Route to mark attendance
router.post('/mark', authMiddleware, markAttendance);

// Route to view attendance for a specific month
router.get('/view', authMiddleware, getMonthlyAttendance);

export default router