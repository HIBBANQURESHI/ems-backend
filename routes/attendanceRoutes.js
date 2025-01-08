import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { markAttendance, getAttendanceByDate } from '../controllers/attendanceController.js';

const router = express.Router();

// Mark attendance for employees
router.post('/mark', authMiddleware, markAttendance);

// Get attendance by date
router.get('/:date', authMiddleware, getAttendanceByDate);

export default router;
