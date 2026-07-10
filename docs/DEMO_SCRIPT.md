# Demo Script

## Setup

1. Start the FastAPI backend.
2. Start the Streamlit frontend.
3. Open `http://localhost:8501`.

## Story

Modern AI apps need a runtime compliance layer between model output and the user. AI Compliance Reasoner evaluates each candidate answer against safety, privacy, legal, medical, cybersecurity, and application-specific policies before the answer is shown.

## Demo Flow

1. Load **Privacy risk** and run analysis.
   Expected result: `block`, because the response exposes customer PII.

2. Load **Safe cybersecurity education** and run analysis.
   Expected result: `allow`, because the response gives defensive advice.

3. Load **Prompt injection** and run analysis.
   Expected result: `block`, because hidden instructions must not be disclosed.

4. Load **Medical risk** and run analysis.
   Expected result: `regenerate`, because the answer makes an unsafe diagnosis.

5. Scroll to recent audit logs.
   Show that every compliance decision is recorded with prompt, response, policies, score, decision, reason, and timestamp.

## Closing

The backend can use Qwen Cloud for richer reasoning when configured, but it also has deterministic fallback evaluation so the demo remains usable without an API key.
