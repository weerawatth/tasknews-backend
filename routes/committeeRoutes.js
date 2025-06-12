const express = require('express');
const router = express.Router();
const Committee = require('../models/Committee');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware ตรวจสอบ token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    req.user = user;
    next();
  });
};

// GET /api/committee - ดึงงานคณะกรรมการ
router.get('/', authenticateToken, async (req, res) => {
  try {
    const committeeTasks = await Committee.find().populate('taskId', 'title date time status');
    console.log('Sending committee tasks:', committeeTasks);
    res.json(committeeTasks);
  } catch (err) {
    console.error('Error fetching committee tasks:', err.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// POST /api/committee - เพิ่มงานคณะกรรมการ
router.post('/', authenticateToken, async (req, res) => {
  try {
    const committeeTask = new Committee({
      taskId: req.body.taskId,
      startTime: req.body.startTime,
      status: req.body.status,
      isCompleted: req.body.isCompleted || false,
      createdBy: req.user.username // เพิ่มผู้สร้าง
    });
    const savedTask = await committeeTask.save();
    console.log('Created committee task:', savedTask);
    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating committee task:', err.message);
    res.status(400).json({ message: 'คำขอไม่ถูกต้อง', error: err.message });
  }
});

// PUT /api/committee/:id - อัปเดตงาน
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const committeeTask = await Committee.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.username },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!committeeTask) {
      return res.status(404).json({ message: 'ไม่พบงานคณะกรรมการ' });
    }
    console.log('Updated committee task:', committeeTask);
    res.json(committeeTask);
  } catch (err) {
    console.error('Error updating committee task:', err.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// DELETE /api/committee/:id - ลบงาน
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const committeeTask = await Committee.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.username
    });
    if (!committeeTask) {
      return res.status(404).json({ message: 'ไม่พบงานคณะกรรมการ' });
    }
    console.log('Deleted committee task:', committeeTask);
    res.json({ message: 'ลบงานคณะกรรมการสำเร็จ' });
  } catch (err) {
    console.error('Error deleting committee task:', err.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// DELETE /api/committee - ลบงานทั้งหมด
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await Committee.deleteMany({ createdBy: req.user.username });
    console.log('All committee tasks deleted');
    res.json({ message: 'ลบงานคณะกรรมการทั้งหมดสำเร็จ' });
  } catch (err) {
    console.error('Error deleting all committee tasks:', err.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

module.exports = router;