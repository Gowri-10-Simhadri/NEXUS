import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ProfileType } from '../types/index.js';

export interface IUserPreferences {
  theme: 'dark' | 'light' | 'system';
  desktopNotifications: boolean;
  browserNotifications: boolean;
  emailNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // e.g., "22:00"
    end: string;   // e.g., "08:00"
  };
  dailyNotificationLimit: number;
  aiProvider: 'gemini' | 'openai';
  startOnBoot: boolean;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  profileType: ProfileType;
  avatar?: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: number[]; // 0-6 (Sun-Sat)
  };
  preferences: IUserPreferences;
  onboardingComplete: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    profileType: {
      type: String,
      enum: ['student', 'developer', 'employee', 'researcher', 'freelancer', 'entrepreneur', 'teacher', 'manager', 'professional', 'general'],
      default: 'general',
    },
    avatar: { type: String },
    timezone: { type: String, default: 'UTC' },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      days: { type: [Number], default: [1, 2, 3, 4, 5] },
    },
    preferences: {
      theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
      desktopNotifications: { type: Boolean, default: true },
      browserNotifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false },
      quietHours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '08:00' },
      },
      dailyNotificationLimit: { type: Number, default: 20 },
      aiProvider: { type: String, enum: ['gemini', 'openai'], default: 'gemini' },
      startOnBoot: { type: Boolean, default: false },
    },
    onboardingComplete: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
