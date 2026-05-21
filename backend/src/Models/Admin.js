const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Le username admin est obligatoire'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 80,
    },
    passwordHash: {
      type: String,
      required: [true, 'Le mot de passe admin est obligatoire'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

adminSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash)
}

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema)
