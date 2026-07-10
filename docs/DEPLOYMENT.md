# Deployment

## Local

Start the backend:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Start the frontend in another shell:

```bash
cd frontend
pip install -r requirements.txt
streamlit run app.py
```

## Docker Compose

From the repository root:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Backend: `http://localhost:8000`

Frontend: `http://localhost:8501`

## Render Backend

Create a Render Web Service with:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Set environment variables from `backend/.env.example`.

## Hugging Face Spaces Frontend

Create a Streamlit Space from the `frontend` directory and set:

```env
API_BASE_URL=https://your-backend-url
```

The Qwen API key belongs only on the backend.
