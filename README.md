<!-- prettier-ignore-start -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,100:0ea5e9&height=140&section=header&text=RahaSeva&fontSize=42&fontAlignY=30&fontColor=ffffff&animation=fadeIn" alt="RahaSeva Banner" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=26&duration=2400&pause=1000&color=22C55E&center=true&vCenter=true&width=900&lines=An+on%E2%80%91demand+services+platform;React+%2B+Vite+Frontend+%7C+Express+%2B+MongoDB+Backend;Fast%2C+Modern%2C+Developer%E2%80%91Friendly" alt="Typing SVG" />
</p>

<p align="center">
  <a href="#"><img alt="Node" src="https://img.shields.io/badge/Node-18%2B-43853D?style=for-the-badge&logo=node.js&logoColor=white"></a>
  <a href="#"><img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=000"></a>
  <a href="#"><img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=fff"></a>
  <a href="#"><img alt="Express" src="https://img.shields.io/badge/Express-4-black?style=for-the-badge&logo=express&logoColor=white"></a>
  <a href="#"><img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-01A34D?style=for-the-badge&logo=mongodb&logoColor=white"></a>
  <a href="#"><img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white"></a>
  <a href="#"><img alt="License" src="https://img.shields.io/badge/License-ISC-22C55E?style=for-the-badge"></a>
  <a href="https://vercel.com" target="_blank"><img alt="Vercel" src="https://img.shields.io/badge/Powered%20by-Vercel-000?style=for-the-badge&logo=vercel"></a>
  <a href="#contributing"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-0ea5e9?style=for-the-badge&logo=github"></a>
</p>

---

# RahaSeva – HelpHive

A modern on-demand services platform connecting users with trusted service providers. This monorepo hosts a React + Vite frontend and an Express + MongoDB backend with clean APIs, authentication, and a developer-friendly setup.

> Tip: This README is designed for GitHub and includes colorful badges, subtle animations, and collapsible sections for a professional look.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [API Endpoints (Overview)](#api-endpoints-overview)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Modern UI**: React 18 + Vite with Tailwind CSS.
- **Auth**: JWT-based authentication and role-based authorization.
- **API-First**: Organized REST endpoints for auth, services, and bookings.
- **MongoDB Atlas**: Resilient connection handling and graceful shutdown.
- **Developer UX**: Hot reload for both frontend and backend via concurrent dev script.
- **CORS Management**: Pre-configured allowed origins for local dev & production.

## Tech Stack
- **Frontend**: React, Vite, React Router, React Toastify, Tailwind CSS
- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, dotenv, CORS
- **Tooling**: Concurrently, Nodemon, ESLint, Vitest (ready)
- **Deploy**: Vercel (frontend), MongoDB Atlas (database)

## Architecture
```text
RahaSeva (Monorepo)
├─ HelpHive/
│  └─ RahSeva/                 # App root
│     ├─ src/                  # React app
│     ├─ server/               # Express API
│     │  ├─ routes/            # auth, services, bookings
│     │  ├─ controllers/       # request handlers
│     │  ├─ models/            # Mongoose models
│     │  └─ index.js           # server entrypoint
│     └─ package.json          # scripts (dev runs FE+BE)
└─ package.json                # shared deps (if any)
```

## Quick Start
1. Clone the repo
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd RahaSeva/HelpHive/RahSeva
   ```
2. Install dependencies
   ```bash
   # Frontend workspace deps
   npm install

   # Backend deps
   cd server && npm install
   cd ..
   ```
3. Configure environment
   - Create a `.env` file in `HelpHive/RahSeva/server` (see template below).
4. Run in development
   ```bash
   # From HelpHive/RahSeva
   npm run dev
   ```
5. Open your app
   - Frontend: http://localhost:3003
   - Backend Health: http://localhost:5000/health

> Note: The dev script starts both frontend (Vite) and backend (Nodemon) concurrently.

## Environment Variables
Create `HelpHive/RahSeva/server/.env` with:
```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"

# Auth
JWT_SECRET="your-strong-secret"

# CORS (optional; defaults already include localhost:3003 and 5173)
# FRONTEND_ORIGINS="http://localhost:3003,http://localhost:5173"
```

## Available Scripts
From `HelpHive/RahSeva`:
- `npm run dev` – **Run frontend and backend together** (concurrently)
- `npm run frontend` – Run Vite dev server at `0.0.0.0:3003`
- `npm run backend` – Start backend from `server/` using its dev script
- `npm run build` – Build the frontend for production
- `npm run preview` – Preview the built frontend

From `HelpHive/RahSeva/server`:
- `npm run dev` – Start Express server with Nodemon
- `npm run prod` – Start Express server with Node

## Project Structure
```text
RahaSeva/
├─ HelpHive/
│  └─ RahSeva/
│     ├─ public/              # Static assets
│     ├─ src/                 # React source (components, pages, hooks)
│     ├─ server/
│     │  ├─ controllers/      # Business logic
│     │  ├─ middleware/       # auth, authorize, etc.
│     │  ├─ models/           # User, ServiceProvider, Booking
│     │  ├─ routes/           # /api/auth, /api/services, /api/bookings
│     │  └─ index.js          # Express app + Mongo connection
│     ├─ eslint.config.js
│     ├─ tailwind.config.js
│     └─ vite.config.js
└─ README.md
```

## API Endpoints (Overview)
- **Auth**: `/api/auth` – login, register, token validation
- **Services**: `/api/services` – list services, provider operations
- **Bookings**: `/api/bookings` – create and manage bookings
- **Health**: `/health` – service status

> Explore `HelpHive/RahSeva/server/routes/*` and `controllers/*` for details.




## Contributing
- **Issues & Feature Requests**: Use GitHub Issues.
- **Pull Requests**: Fork, create a feature branch, commit with clear messages, and submit a PR.

```bash
# Example flow
git checkout -b feat/<short-feature-name>
# ...commit changes...
git push origin feat/<short-feature-name>
```

## License
This project is licensed under the **ISC** License.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,100:22c55e&height=120&section=footer" alt="Footer Wave" />
</p>
<!-- prettier-ignore-end -->
