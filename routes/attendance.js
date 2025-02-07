import express from 'express'
import { attendanceReport, getAttendance, updateAttendance, getMonthlySummary} from '../controllers/attendanceController.js';
import authMiddleware from '../middleware/authMiddlware.js';
import defaultAttendance from '../middleware/defaultAttendance.js';

const router = express.Router()

router.get('/',authMiddleware, defaultAttendance, getAttendance)
router.put('/update/:employeeId',authMiddleware, updateAttendance)
router.get('/report',authMiddleware, attendanceReport)
router.get('/monthly-summary', authMiddleware, getMonthlySummary);



export default router;