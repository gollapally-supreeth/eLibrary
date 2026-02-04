# 📚 eLibrary V2 - Modern MERN Stack Library System

> A "Deep Space" themed digital library experience, rebuilt with a modern tech stack and industry-level deployment standards.

![eLibrary V2 Banner](https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2690&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)
*(Conceptual Background: Deep Space Library)*

## 🌟 What's New in V2?

This version is a complete architectural overhaul, moving from static files to a robust **MERN Stack** application.

-   **🌌 "Deep Space" Aesthetic**: A fully responsive dark mode interface with floating glow orbs and parallax backgrounds.
-   **✨ Interactive UI**: Bento Grid layout with "Spotlight" hover effects and GSAP micro-animations.
-   **🔐 Secure Auth**: Full JWT authentication system with session management.
-   **🚀 Industry-Level Deployment**: Dockerized architecture ready for Oracle Cloud/AWS.

---

## 🛠️ Tech Stack

### Frontend
-   **Core**: React 18, Vite
-   **Styling**: Modern CSS3 (Variables, Glassmorphism), Lucide React (Icons)
-   **Animations**: GSAP (GreenSock), ScrollTrigger

### Backend
-   **Runtime**: Node.js, Express.js
-   **Database**: MongoDB Atlas (Cloud)
-   **Auth**: JSON Web Tokens (JWT), BCrypt

### DevOps
-   **Containerization**: Docker, Docker Compose
-   **Server**: Oracle Cloud / AWS / Vercel (Hybrid)

---

## 📂 Project Structure

Verified, clean structure after V2 refactor:

```
eLibrary/
├── frontend/             # React Application (Vite)
│   ├── src/
│   │   ├── pages/        # Landing, Login, Profile, etc.
│   │   ├── components/   # Reusable UI components
│   │   └── main.jsx      # Entry point
│   └── Dockerfile        # Nginx-based production image
├── backend/              # Express API
│   ├── routes/           # Auth, Books, Users routes
│   ├── models/           # Mongoose Schemas
│   ├── server.js         # App entry point
│   └── Dockerfile        # Node.js production image
├── docker-compose.yml    # Orchestration for Pro Mode
└── DEPLOYMENT_INSTRUCTIONS.md # Guide for Cloud Hosting
```

---

## 🚀 Getting Started

### Prerequisites
-   **Node.js** (v18+)
-   **MongoDB Atlas URI** (Free Tier works)
-   **Docker Desktop** (Optional, for Pro Mode)

### 1. Configuration
Create a `.env` file in the `backend/` directory:

```ini
# backend/.env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
SESSION_SECRET=your_secret_key
```

### 2. Development Mode (Quick Start)
Run frontend and backend concurrently from the root:

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Run (from root of frontend/backend respectively in two terminals)
# Terminal 1: Backend
cd backend && npm run start

# Terminal 2: Frontend
cd frontend && npm run dev
```
*Access the app at `http://localhost:5173`*

### 3. Pro Mode (Docker) 🐳
Simulate the production environment locally:

```bash
docker compose up --build
```
*Access the app at `http://localhost:80` (Standard Web Port)*

---

## 🌍 Deployment

We support two major deployment strategies:

1.  **Free Tier (Easy)**: Vercel (Frontend) + Render (Backend).
2.  **Pro Mode (Industry)**: Oracle Cloud / VPS using Docker.

👉 **[Read the Full Deployment Guide](./DEPLOYMENT_INSTRUCTIONS.md)**

---

## 🔒 Account Recovery
If you forget your password, the Login page includes a **"Forgot Password"** feature that connects you directly with the developer for secure recovery support via LinkedIn/Email.

---

## 📞 Contact & Credits

**Lead Developer**: [Supreeth Gollapally](https://www.linkedin.com/in/gollapally-supreeth)  
**GitHub**: [gollapally-supreeth](https://github.com/gollapally-supreeth)

Built with ❤️ and ☕.
