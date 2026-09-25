# NEXUS — AI Personal Intelligence & Planning System

NEXUS is an intelligent, proactive personal productivity and project planning platform. It seamlessly unifies your goals, projects, deliverables, milestones, decision memory, and knowledge base with a general-purpose AI assistant powered by Google Gemini.

---

## 🌟 Key Features

1. **AI Chatbot (Google Gemini Integration)**:
   - General-purpose conversational AI assistant capable of answering coding questions, drafting emails, solving math/algorithmic problems, and general domain knowledge.
   - Grounded in user workspace data (tasks, projects, goals) when relevant without compromising versatility.
   - Multi-turn conversation persistence in MongoDB Atlas.

2. **Proactive Intelligence & Risk Analysis**:
   - Automatically detects impending workload conflicts (e.g., overlapping deadlines with high estimated hours).
   - Generates structured, explainable recovery plans with automated rescheduling recommendations.

3. **Projects, Tasks, & Milestones**:
   - Kanban board, status workflows, priorities, tags, and progress tracking.
   - Hierarchical goal mapping and deadline alerts.

4. **Personal & Decision Memory**:
   - Document knowledge management with Markdown/PDF ingestion.
   - Architectural and personal decision tracking with rationale and trade-off logging.

5. **Real-time Notifications & Sockets**:
   - Instant updates via WebSocket / Socket.IO.
   - Native Windows Desktop Agent support via Electron.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (v18), Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Zustand, React Query.
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO, Mongoose.
- **Database**: MongoDB Atlas.
- **AI**: Google Gemini API via official `@google/generative-ai` SDK through Express backend.

---

## 📁 Repository Structure

```
NEXUS/
├── apps/
│   ├── web/                    # React 18 + Vite + Tailwind CSS Frontend SPA
│   └── desktop/                # Electron Tray & Native Notifications
├── server/                     # Node.js + Express API + Gemini AI + Socket.IO
├── workers/
│   └── notification-worker/    # Background intelligence worker
├── .env.example                # Safe environment variable placeholders
├── render.yaml                 # Render Cloud Deployment Blueprint
└── package.json                # Monorepo workspace configuration
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the root directory:

### Backend Variables (`.env`)
```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexus?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_access_token_key_here
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_token_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Configuration (Gemini API)
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Desktop Agent
DESKTOP_APP_SECRET=nexus_desktop_agent_shared_secret_2026
```

### Frontend Variables (`apps/web/.env.example`)
```env
# In production, point to your deployed backend URL
VITE_API_URL=https://your-backend-api.onrender.com
VITE_SOCKET_URL=https://your-backend-api.onrender.com
```

> **Security Note**: Never commit actual API keys or credentials to version control. The Gemini API key and MongoDB URI reside strictly in the Express backend environment.

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Demonstration Data
```bash
npm run seed
```

### 3. Start Development Servers
```bash
npm run dev
```
- **Web Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📦 Production Build

Build all monorepo workspaces:
```bash
npm run build
```

Individual builds:
```bash
npm run build:server   # Builds backend Express server to server/dist
npm run build:web      # Builds frontend React SPA to apps/web/dist
```

---

## 🌐 Deployment Instructions (e.g. Render)

### Option A: Render Blueprint (`render.yaml`)
1. Push your repository to GitHub.
2. In Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically configure the backend Web Service and frontend Static Site based on `render.yaml`.
4. Supply your private `MONGODB_URI` and `GEMINI_API_KEY` in the environment settings.

### Option B: Manual Setup

#### 1. Backend Web Service:
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build:server`
- **Start Command**: `npm run start --workspace=server`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000` (or leave default for Render)
  - `MONGODB_URI`: your MongoDB Atlas connection string
  - `JWT_SECRET`: secure random string
  - `JWT_REFRESH_SECRET`: secure random string
  - `GEMINI_API_KEY`: your Google Gemini API key
  - `FRONTEND_URL`: `https://<your-frontend-subdomain>.onrender.com`

#### 2. Frontend Static Site:
- **Environment**: `Static Site`
- **Build Command**: `npm install && npm run build:web`
- **Publish Directory**: `apps/web/dist`
- **Rewrite Rules**: Source `/*` -> Destination `/index.html` (SPA routing)
- **Environment Variables**:
  - `VITE_API_URL`: `https://<your-backend-subdomain>.onrender.com`
  - `VITE_SOCKET_URL`: `https://<your-backend-subdomain>.onrender.com`

---

## 📄 License
MIT
