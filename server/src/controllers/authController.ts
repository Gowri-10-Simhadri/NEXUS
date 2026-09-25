import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { UserSession } from '../models/UserSession.js';
import { Activity } from '../models/Activity.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, profileType } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: { message: 'Name, email, and password are required.' } });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, error: { message: 'An account with this email already exists.' } });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      profileType: profileType || 'general',
      onboardingComplete: false,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Create session record
    await UserSession.create({
      userId: user._id,
      refreshToken,
      deviceInfo: {
        browser: req.headers['user-agent'],
        ip: req.ip,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await Activity.create({
      userId: user._id,
      type: 'task_created',
      description: 'Account created and initialized on NEXUS.',
    }).catch(() => {});

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileType: user.profileType,
          onboardingComplete: user.onboardingComplete,
          preferences: user.preferences,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: { message: 'Email and password are required.' } });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, error: { message: 'Invalid email or password.' } });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: { message: 'Invalid email or password.' } });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await UserSession.create({
      userId: user._id,
      refreshToken,
      deviceInfo: {
        browser: req.headers['user-agent'],
        ip: req.ip,
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileType: user.profileType,
          onboardingComplete: user.onboardingComplete,
          preferences: user.preferences,
          timezone: user.timezone,
          workingHours: user.workingHours,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      res.status(400).json({ success: false, error: { message: 'Refresh token is required.' } });
      return;
    }

    const decoded = verifyRefreshToken(token);
    const session = await UserSession.findOne({ refreshToken: token, userId: decoded.userId });

    if (!session || new Date() > session.expiresAt) {
      res.status(401).json({ success: false, error: { message: 'Refresh token expired or revoked.' } });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, error: { message: 'User not found.' } });
      return;
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Rotate refresh token
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await session.save();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: { message: 'Invalid refresh token.' } });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await UserSession.deleteOne({ refreshToken: token });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User not found.' } });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
