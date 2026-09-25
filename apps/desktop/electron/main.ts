import { app, BrowserWindow, Tray, Menu, nativeImage, Notification, shell } from 'electron';
import { io, Socket } from 'socket.io-client';

let tray: Tray | null = null;
let socket: Socket | null = null;
let isPaused = false;

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

function createTray() {
  const icon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVDhPY/wPBAxUABw1gGE0DBiA7kGGB1D9R00gGDWBYNQEgkFvgGFAH01g1ASCURMIBvTBjBoAANcWDBX/1i5uAAAAAElFTkSuQmCC',
      'base64'
    )
  );

  tray = new Tray(icon);
  tray.setToolTip('NEXUS — AI Personal Intelligence Agent (Connected)');

  updateTrayMenu('connected');
}

function updateTrayMenu(status: 'connected' | 'disconnected' | 'paused') {
  if (!tray) return;

  const statusLabel =
    status === 'connected'
      ? '● Connected (Monitoring)'
      : status === 'paused'
      ? '⏸ Notifications Paused'
      : '○ Disconnected';

  const contextMenu = Menu.buildFromTemplate([
    { label: 'NEXUS Desktop Agent', enabled: false },
    { label: statusLabel, enabled: false },
    { type: 'separator' },
    {
      label: 'Open NEXUS Web App',
      click: () => {
        shell.openExternal(FRONTEND_URL);
      },
    },
    {
      label: isPaused ? 'Resume Notifications' : 'Pause Notifications',
      click: () => {
        isPaused = !isPaused;
        updateTrayMenu(isPaused ? 'paused' : 'connected');
        showDesktopNotification({
          title: 'NEXUS Desktop Agent',
          body: isPaused ? 'Notifications paused.' : 'Notifications resumed.',
        });
      },
    },
    {
      label: 'Sync Workload Status Now',
      click: () => {
        if (socket) socket.emit('sync:request');
        showDesktopNotification({
          title: 'NEXUS Intelligence',
          body: 'Synchronized active projects, deadlines, and schedule.',
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Quit NEXUS Agent',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function showDesktopNotification(payload: { title: string; body: string; url?: string }) {
  if (isPaused) return;

  if (Notification.isSupported()) {
    const notif = new Notification({
      title: payload.title || 'NEXUS Intelligence Alert',
      body: payload.body || 'Workload update detected.',
      urgency: 'critical',
    });

    notif.on('click', () => {
      shell.openExternal(payload.url || `${FRONTEND_URL}/ai`);
    });

    notif.show();
  } else {
    console.log(`[Desktop Notification] ${payload.title}: ${payload.body}`);
  }
}

function initSocketConnection() {
  socket = io(BACKEND_URL, {
    auth: {
      token: process.env.NEXUS_TOKEN || 'desktop_agent_session_token',
      deviceId: 'desktop-agent-windows-01',
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.log('[Desktop Agent] Connected to NEXUS Backend Server');
    updateTrayMenu('connected');
  });

  socket.on('notification:new', (data: any) => {
    console.log('[Desktop Agent] Real-time notification received:', data);
    showDesktopNotification({
      title: `🔔 NEXUS — ${data.title}`,
      body: `${data.message}\n\nSuggested: Click to review AI recovery plan.`,
      url: `${FRONTEND_URL}/ai`,
    });
  });

  socket.on('disconnect', () => {
    console.warn('[Desktop Agent] Disconnected from NEXUS Backend');
    updateTrayMenu('disconnected');
  });
}

// App lifecycle
app.whenReady().then(() => {
  createTray();
  initSocketConnection();

  setTimeout(() => {
    showDesktopNotification({
      title: 'NEXUS Desktop Agent Active',
      body: 'Monitoring deadlines and workload in background. You will receive alerts even with your browser closed.',
      url: FRONTEND_URL,
    });
  }, 1500);
});

app.on('window-all-closed', () => {
  // Keep agent running in system tray
});
