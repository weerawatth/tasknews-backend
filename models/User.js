const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'guest' },
  createdAt: { type: Date, default: Date.now }
});

// เมธอดเปรียบเทียบรหัสผ่านแบบธรรมดา (ไม่ใช้ bcrypt)
userSchema.methods.comparePassword = function (candidatePassword) {
  return this.password === candidatePassword; // เปรียบเทียบข้อความตรง ๆ
};

module.exports = mongoose.model('User', userSchema);