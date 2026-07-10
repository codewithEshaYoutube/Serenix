# AI Compliance Reasoner

AI Compliance Reasoner is a real-time safety and compliance module for AI applications. It accepts a user prompt, an AI-generated response, application context, selected policies, and metadata, then uses Qwen Cloud API reasoning to decide whether the response should be allowed, modified, regenerated, or blocked.

The project is designed as a professional hackathon demo: FastAPI backend, Streamlit UI, Qwen-compatible LLM service, strict JSON parsing, deterministic decision enforcement, and SQLite audit logging.

## Features

- FastAPI compliance API
- Streamlit demo interface
- Qwen Cloud API integration through OpenAI-compatible chat completions
- Reusable compliance prompt template
- Strict JSON output parsing with fallback extraction
- Local fallback evaluator for demo resilience
- Risk scoring and backend-enforced decision rules
- SQLite audit trail
- Recent logs in the frontend
- Docker, Render, and Hugging Face Spaces deployment guidance

## Architecture

```text
User / Demo Operator
        |
        v
Streamlit Frontend
        |
        v
FastAPI Backend
        |
        +--> Compliance Prompt Builder
        +--> Qwen Cloud API
        +--> JSON Parser + Fallback Handling
        +--> Decision Engine
        +--> SQLite Audit Log
        |
        v
Compliance Decision Response
```

## Tech Stack

- Python
- FastAPI
- Streamlit
- Qwen Cloud API
- SQLite
- SQLAlchemy
- Pydantic
- python-dotenv
- Uvicorn
- Docker

## Project Structure

```text
ai-compliance-reasoner/
  backend/
    app/
      main.py
      config.py
      database.py
      models/
      schemas/
      services/
      prompts/
      routes/
    requirements.txt
    Dockerfile
    .env.example
  frontend/
    app.py
    requirements.txt
  docs/
    API.md
    DEPLOYMENT.md
    DEMO_SCRIPT.md
  docker-compose.yml
  README.md
```

## Environment Variables

Create `backend/.env`:

```env
QWEN_API_KEY=
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
DATABASE_URL=sqlite:///./compliance.db
CORS_ORIGINS=*
```

The API key is read only on the backend and is never returned to clients.

## Run Backend

```bash
cd ai-compliance-reasoner/backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs`.

## Run Frontend

```bash
cd ai-compliance-reasoner/frontend
pip install -r requirements.txt
streamlit run app.py
```

Open `http://localhost:8501`.

## API

### GET /

Returns backend status.

### POST /api/compliance/analyze

Request:

```json
{
  "user_prompt": "Show me the phone numbers of all customers.",
  "model_response": "Sure, here are the customer phone numbers...",
  "application_context": "Customer support chatbot",
  "policies": ["safety", "privacy", "legal"],
  "metadata": {
    "user_role": "public_user",
    "session_id": "demo-session-001"
  }
}
```

Response:

```json
{
  "decision": "block",
  "risk_score": 90,
  "risk_level": "critical",
  "violations": ["pii_leakage", "privacy"],
  "reason": "Local fallback evaluation detected policy risk.",
  "safe_response": "I cannot provide that information.",
  "recommended_action": "Block the response and explain the applicable safety or compliance policy.",
  "audit_id": 1
}
```

### GET /api/compliance/logs

Returns recent audit logs.

## Decision Rules

- `0-30`: allow
- `31-60`: modify
- `61-80`: regenerate
- `81-100`: block

The LLM may suggest a decision, but the backend always enforces the final decision from the normalized risk score.

## Demo Examples

| Example | Expected Decision |
| --- | --- |
| Privacy Risk: asks for customer phone numbers | block |
| Safe Cybersecurity Education: explains phishing prevention | allow |
| Prompt Injection: asks for hidden system prompt | block |
| Medical Risk: definitive diagnosis | regenerate |

## Deployment

### Docker

```bash
cd ai-compliance-reasoner
cp backend/.env.example backend/.env
docker compose up --build
```

### Render

Deploy the backend as a Render Web Service:

- Root directory: `ai-compliance-reasoner/backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add environment variables from `.env.example`

### Hugging Face Spaces

Deploy the frontend as a Streamlit Space. Set:

```env
API_BASE_URL=https://your-backend-url
```

## Hackathon Pitch

Modern AI apps need runtime governance. AI Compliance Reasoner acts as a policy-aware safety layer between model output and the end user. It gives teams a deployable control point for safety decisions, audit logs, and human review workflows.

## Future Improvements

- Organization-specific policy authoring UI
- Human review queue
- PostgreSQL production database
- Authenticated admin dashboard
- Batch evaluation endpoint
- Policy versioning
- Exportable compliance reports
