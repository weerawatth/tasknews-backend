const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
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

// GET /api/tasks - ดึงงานของผู้ใช้ที่ล็อกอิน
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.username }).sort({ createdAt: -1 });
    console.log('Fetched tasks:', tasks); // เพิ่ม log เพื่อตรวจสอบ
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// POST /api/tasks - เพิ่มงานใหม่
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Received task data:', req.body); // ตรวจสอบข้อมูลที่ได้รับ
    const taskData = {
      date: req.body.date || Date.now(), // ใช้ default จาก schema ถ้าไม่ส่งมา
      time: req.body.time || '',
      newsId: req.body.newsId || '',
      indicator: req.body.indicator || '',
      command: req.body.command || '',
      from: req.body.from || '',
      to: req.body.to || '',
      title: req.body.title,
      status: req.body.status || 'ตามเวลา', // ใช้ default จาก schema
      createdBy: req.user.username
    };
    if (!taskData.title) {
      return res.status(400).json({ message: 'กรุณากรอกชื่องาน' });
    }

    const task = new Task(taskData);
    await task.save();
    console.log('Saved task:', task); // ตรวจสอบข้อมูลที่บันทึก
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ message: 'คำขอไม่ถูกต้อง', error: err.message });
  }
});

// PUT /api/tasks/:id - อัปเดตงาน
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Update task data:', req.body); // ตรวจสอบข้อมูลที่อัปเดต
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.username },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'ไม่พบงาน' });
    console.log('Updated task:', task); // ตรวจสอบข้อมูลหลังอัปเดต
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// DELETE /api/tasks/:id - ลบงานตาม ID
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user.username });
    if (!task) return res.status(404).json({ message: 'ไม่พบงาน' });
    res.json({ message: 'ลบงานสำเร็จ' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// DELETE /api/tasks - ลบงานทั้งหมดของผู้ใช้
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await Task.deleteMany({ createdBy: req.user.username });
    res.json({ message: 'ลบงานทั้งหมดสำเร็จ' });
  } catch (err) {
    console.error('Error deleting all tasks:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

module.exports = router;