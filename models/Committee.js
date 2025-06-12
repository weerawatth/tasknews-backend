// models/Committee.js
const mongoose = require('mongoose');
const committeeSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  notes: String,
  status: String,
  isCompleted: { type: Boolean, default: false } // เพิ่มฟิลด์นี้
});
module.exports = mongoose.model('Committee', committeeSchema);