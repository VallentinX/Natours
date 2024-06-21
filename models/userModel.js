/** Models */
import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

/** Developer's Models */

/** Others */
const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Type your full name!'],
  },
  email: {
    type: String,
    required: [true, 'Your email address!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please make sure you type a valid email address!'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Set a password!'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm your password!'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },

      message: 'Passwords do not match!',
    },
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

usersSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

usersSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

usersSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

usersSchema.pre(/^find/, function (next) {
  this.find({active: {$ne: false}});

  next();
});

usersSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

const User = mongoose.model('User', usersSchema);

export default User;
