require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Task = require('./models/Task');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/task_management';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB connected successfully to:', MONGO_URI);
    // เพิ่มผู้ใช้ admin
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({ username: 'admin', password: 'admin123', role: 'admin' });
      await admin.save();
      console.log('Admin user created: username=admin, password=admin123');
    }
    // เพิ่มงานทดสอบ
    const taskExists = await Task.findOne({ title: 'งานทดสอบ' });
    if (!taskExists) {
      const task = new Task({
        title: 'งานทดสอบ',
        date: '2023-10-01',
        time: '10:00',
        status: 'ตามเวลา',
        createdBy: 'admin'
      });
      await task.save();
      console.log('Test task created');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // หยุดเซิร์ฟเวอร์ถ้าเชื่อมต่อไม่ได้
  });

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/committee', require('./routes/committeeRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));