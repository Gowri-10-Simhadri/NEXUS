import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Goal } from '../models/Goal.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { Note } from '../models/Note.js';
import { Decision } from '../models/Decision.js';
import { DocumentModel } from '../models/Document.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { IntelligenceService } from '../services/intelligenceService.js';

async function seed() {
  console.log('[Seed] Initializing database connection...');
  await connectDB();

  const demoEmail = 'demo@nexus.app';

  // 1. Clean existing demo user
  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    const userId = existingUser._id;
    await Promise.all([
      User.deleteOne({ _id: userId }),
      Goal.deleteMany({ userId }),
      Project.deleteMany({ userId }),
      Task.deleteMany({ userId }),
      CalendarEvent.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      Decision.deleteMany({ userId }),
      DocumentModel.deleteMany({ userId }),
      Activity.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
    ]);
    console.log('[Seed] Cleaned existing demo user data.');
  }

  // 2. Create Demo User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const user = await User.create({
    name: 'Alex Mercer',
    email: demoEmail,
    passwordHash,
    profileType: 'developer',
    timezone: 'Asia/Kolkata',
    workingHours: { start: '09:00', end: '19:00', days: [1, 2, 3, 4, 5] },
    preferences: {
      theme: 'dark',
      desktopNotifications: true,
      browserNotifications: true,
      emailNotifications: false,
      quietHours: { enabled: false, start: '22:00', end: '08:00' },
      dailyNotificationLimit: 20,
      aiProvider: 'gemini',
      startOnBoot: true,
    },
    onboardingComplete: true,
  });
  console.log(`[Seed] Created User: ${user.name} (${user.email})`);

  // 3. Create Goal
  const goal = await Goal.create({
    userId: user._id,
    title: 'Master Full-Stack AI & Cloud Systems',
    description: 'Build production-grade distributed apps with multi-agent AI integration.',
    category: 'Career & Learning',
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    milestones: [
      { title: 'Learn React 18, Vite & Tailwind Design Systems', completed: true, completedAt: new Date() },
      { title: 'Architect Node.js & TypeScript REST & WebSocket backend', completed: true, completedAt: new Date() },
      { title: 'Complete AI Music Composer Flagship Project', completed: false, dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { title: 'Pass Advanced Software Engineering Examination', completed: false, dueDate: new Date(Date.now() + 40 * 60 * 60 * 1000) },
      { title: 'Deploy to Cloud Infrastructure with CI/CD', completed: false },
    ],
    progress: 40,
    status: 'active',
    color: '#8b5cf6',
  });

  // Calculate upcoming 24h & 40h deadline windows for the flagship scenario
  const now = new Date();
  const projectDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  const examStartTime = new Date(projectDeadline.getTime() + 16 * 60 * 60 * 1000); // 16 hours after project due
  const examEndTime = new Date(examStartTime.getTime() + 3 * 60 * 60 * 1000);

  // 4. Create Flagship Project
  const project = await Project.create({
    userId: user._id,
    goalId: goal._id,
    title: 'AI Music Composer',
    description: 'Generative audio synthesizer backend with interactive WebAudio visualizer interface.',
    status: 'in_progress',
    priority: 'high',
    deadline: projectDeadline,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    progress: 50,
    tags: ['AI', 'React', 'Node.js', 'AudioEngine'],
    color: '#06b6d4',
    lastActivityAt: new Date(),
  });
  console.log(`[Seed] Created Project: ${project.title} (Deadline: ${projectDeadline.toLocaleString()})`);

  // 5. Create 4 Tasks (2 Completed, 2 Pending)
  const task1 = await Task.create({
    userId: user._id,
    projectId: project._id,
    goalId: goal._id,
    title: 'Design Audio Synthesis REST API & Endpoints',
    description: 'Define track generation schemas and audio buffer streaming pipeline.',
    status: 'completed',
    priority: 'high',
    estimatedDuration: 120,
    actualDuration: 110,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  const task2 = await Task.create({
    userId: user._id,
    projectId: project._id,
    goalId: goal._id,
    title: 'Build Interactive Waveform Visualizer in React',
    description: 'Canvas-based audio visualizer responding to frequency spectrum.',
    status: 'completed',
    priority: 'medium',
    estimatedDuration: 90,
    actualDuration: 95,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  const task3 = await Task.create({
    userId: user._id,
    projectId: project._id,
    goalId: goal._id,
    title: 'Implement Multi-track MIDI Exporter & Buffer Pipeline',
    description: 'Convert synthesized frequency matrix into standard MIDI .mid file format.',
    status: 'todo',
    priority: 'urgent',
    deadline: projectDeadline,
    estimatedDuration: 120, // 2 hours
    tags: ['Backend', 'AudioFormat'],
  });

  const task4 = await Task.create({
    userId: user._id,
    projectId: project._id,
    goalId: goal._id,
    title: 'End-to-End Latency Benchmarking & Performance Profiling',
    description: 'Stress-test audio chunk synthesis under concurrent load and document results.',
    status: 'todo',
    priority: 'high',
    deadline: projectDeadline,
    estimatedDuration: 120, // 2 hours
    dependencies: [task3._id],
    tags: ['Testing', 'Performance'],
  });
  console.log(`[Seed] Created 4 Tasks (2 Completed, 2 Pending: 4 hours estimated work)`);

  // 6. Create Flagship Examination Calendar Event
  const examEvent = await CalendarEvent.create({
    userId: user._id,
    title: 'Software Systems Architecture Final Examination',
    description: 'Comprehensive exam covering microservices, concurrency, distributed storage & caching.',
    type: 'exam',
    startTime: examStartTime,
    endTime: examEndTime,
    location: 'Main Examination Hall / Online Portal',
    color: '#f43f5e',
    linkedGoalId: goal._id,
  });
  console.log(`[Seed] Created Calendar Exam Event: ${examEvent.title} (Time: ${examStartTime.toLocaleString()})`);

  // 7. Create Decision Memory entry
  await Decision.create({
    userId: user._id,
    projectId: project._id,
    title: 'Database Selection for AI Music Composer',
    context: 'Needed high throughput storage for audio generation metadata, tags, and user session data.',
    options: [
      { title: 'MongoDB Atlas', pros: ['Flexible document schema', 'Fast JSON querying', 'Native vector search support'], cons: ['Requires careful index management'] },
      { title: 'PostgreSQL', pros: ['Strict relational consistency'], cons: ['More complex schema migrations for rapid prototyping'] },
    ],
    chosenOption: 'MongoDB Atlas',
    reasoning: 'MongoDB Atlas provides the ideal balance of schema flexibility for evolving audio metadata, easy horizontal scaling, and integrated vector search capabilities.',
    outcome: 'Enabled rapid iteration and eliminated schema migration bottlenecks during sprint 1.',
  });

  // 8. Create Personal Memory Document
  await DocumentModel.create({
    userId: user._id,
    projectId: project._id,
    title: 'AI Music Composer Architecture Specifications',
    originalFileName: 'audio_architecture_spec.pdf',
    fileType: 'application/pdf',
    fileSize: 45200,
    content: `AI Music Composer System Architecture
Overview: The system leverages a dual-engine architecture. A Node.js audio pipeline coordinates with the generative sound synthesis model. 
Key Dependencies: WebAudio API, Buffer streaming, MIDI export specification.
Testing Strategy: Latency must stay under 80ms per synthesized audio chunk.`,
    chunks: [
      { chunkIndex: 0, text: 'Overview: The system leverages a dual-engine architecture with Node.js and generative sound synthesis.' },
      { chunkIndex: 1, text: 'Testing Strategy: Latency must stay under 80ms per synthesized audio chunk.' },
    ],
  });

  // 8b. Create Personal Notes & Learning Preferences
  await Note.create({
    userId: user._id,
    title: 'Preferred Programming Language & Learning Style',
    content: 'I prefer learning Python through practical examples and building real-world projects.',
    tags: ['Python', 'Learning', 'Preferences'],
    isPinned: true,
  });

  // 9. Run Proactive Intelligence Evaluation immediately!
  console.log('[Seed] Running Proactive Intelligence Engine evaluation...');
  const insights = await IntelligenceService.evaluateUserContext(user._id.toString());
  console.log(`[Seed] ✅ Proactive Intelligence Engine detected: ${insights.length} active risks/conflicts!`);
  insights.forEach((i, idx) => {
    console.log(`   [Insight #${idx + 1}] (${i.priority.toUpperCase()}) ${i.title}`);
  });

  console.log('===========================================================');
  console.log('✅ Flagship Demo Seed successfully loaded into database!');
  console.log(`👤 User Email:    ${demoEmail}`);
  console.log(`🔑 Password:      password123`);
  console.log(`🎯 Scenario:      Project Due ${projectDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (4h pending work)`);
  console.log(`📝 Conflict:      Exam Scheduled closely after`);
  console.log('===========================================================');

  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Error seeding database:', err);
  process.exit(1);
});
