const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  time: String,
  newsId: String,
  indicator: String,
  command: String,
  from: String,
  to: String,
  title: String,
  status: { type: String, enum: ['ตามเวลา', 'เริ่มเมื่อพร้อม', 'รอฟัง'], default: 'ตามเวลา' },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);