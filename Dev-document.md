# SERENIX AI — Developer Documentation

Edge-Based Safety & Compliance Monitoring System for LLMs

---

## 1. Overview

SERENIX AI is a defensive proxy layer that sits between your application and any foundational LLM (GPT, Llama, etc.). It intercepts prompts before they reach the model and sanitizes responses before they reach the user, while logging everything for compliance auditing.

This document covers:
- The full tech stack and why each piece is used
- How to set up the backend
- How to build and run the React dashboard
- How the pieces connect end-to-end

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| API Gateway | FastAPI (Python, async) | Intercepts requests/responses at low latency |
| NLP / Structural Analysis | spaCy, NLTK | Detects jailbreak "grammar" patterns |
| Classification | PyTorch + Hugging Face Transformers | Toxicity and injection-embedding scoring |
| Caching | Redis | Instant lookups for known-good/bad strings and policies |
| Persistence | PostgreSQL | Immutable audit trail for compliance |
| Frontend | React.js + Tailwind CSS | Real-time safety dashboard |
| Containerization | Docker + Docker Compose | Local dev and deployment |

**Pipeline:**

```
[User App] → [FastAPI Edge Gateway] → [Prompt Analyzer] → [Risk Engine]
                                                               │
[User] ← [Policy Auditor] ← [Output Validator] ←──────────────┘
```

---

## 3. Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.10+
- Docker and Docker Compose
- Git

---

## 4. Backend Setup (FastAPI)

### 4.1 Project structure

```
serenix-ai/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── analyzers/
│   │   │   ├── prompt_analyzer.py
│   │   │   └── output_validator.py
│   │   ├── models/
│   │   │   └── classification_head.py
│   │   ├── cache/
│   │   │   └── redis_client.py
│   │   └── db/
│   │       └── postgres_client.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── (React app — see section 5)
└── docker-compose.yml
```

### 4.2 Install dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn spacy nltk torch transformers redis psycopg2-binary
python -m spacy download en_core_web_sm
```

### 4.3 Minimal FastAPI gateway example

```python
# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SERENIX AI Edge Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/v1/analyze-prompt")
async def analyze_prompt(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")
    # 1. Run structural/injection analysis
    # 2. Run risk scoring
    # 3. Cache result in Redis
    # 4. Log to PostgreSQL
    return {"risk_score": 0.02, "blocked": False, "reason": None}

@app.post("/v1/validate-output")
async def validate_output(request: Request):
    body = await request.json()
    text = body.get("text", "")
    return {"sanitized_text": text, "flags": []}

@app.get("/v1/dashboard/stats")
async def dashboard_stats():
    return {"blocked_today": 0, "active_policies": 0, "threat_level": "low"}
```

Run it locally:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs will be available at `http://localhost:8000/docs`.

---

## 5. Frontend Setup (React + Tailwind)

This is the "Safety Score Dashboard" — a real-time UI showing blocked attacks, active policy violations, and threat-level visualizations.

### 5.1 Scaffold the app

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 5.2 Configure Tailwind

`tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

`src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5.3 Fetching live data from the gateway

```jsx
// src/hooks/useDashboardStats.js
import { useState, useEffect } from "react";

export function useDashboardStats(pollMs = 3000) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/v1/dashboard/stats");
        const data = await res.json();
        if (active) setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, pollMs);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pollMs]);

  return stats;
}
```

### 5.4 Dashboard component

```jsx
// src/components/SafetyDashboard.jsx
import { useDashboardStats } from "../hooks/useDashboardStats";

const threatColor = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export default function SafetyDashboard() {
  const stats = useDashboardStats();

  if (!stats) {
    return <div className="p-6 text-gray-400">Loading safety metrics…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">SERENIX AI — Safety Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Blocked Today</p>
          <p className="text-3xl font-semibold">{stats.blocked_today}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Active Policies</p>
          <p className="text-3xl font-semibold">{stats.active_policies}</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Threat Level</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-3 h-3 rounded-full ${threatColor[stats.threat_level]}`}
            />
            <span className="capitalize font-semibold">
              {stats.threat_level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

```jsx
// src/App.jsx
import SafetyDashboard from "./components/SafetyDashboard";

export default function App() {
  return <SafetyDashboard />;
}
```

### 5.5 Run the frontend

```bash
npm run dev
```

Visit `http://localhost:5173` (Vite default) or `http://localhost:3000` if using Create React App.

---

## 6. Docker Compose (Full Stack)

`docker-compose.yml`:

```yaml
version: "3.9"
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: serenix
      POSTGRES_PASSWORD: serenix
      POSTGRES_DB: serenix_audit
    ports: ["5432:5432"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [redis, postgres]
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgresql://serenix:serenix@postgres:5432/serenix_audit

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
```

Start everything:

```bash
docker-compose up --build
```

- Dashboard: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

---

## 7. Extending the System

- **Prompt Analyzer**: add new spaCy pattern matchers in `analyzers/prompt_analyzer.py` to catch new injection phrasings.
- **Classification heads**: fine-tune a Hugging Face token-classification model and drop the checkpoint into `models/classification_head.py`.
- **Dashboard**: add a WebSocket connection instead of polling for true real-time updates (`FastAPI` supports `WebSocket` routes natively).

---

## 8. Notes

This documentation reflects the hackathon prototype architecture described in the SERENIX AI submission. Production hardening (auth, rate limiting, model versioning, TLS termination) is not covered here and should be addressed before any real deployment.
