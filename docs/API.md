# API Reference

Base URL for local development: `http://localhost:8000`

## `GET /`

Returns service health metadata.

```json
{
  "status": "ok",
  "service": "AI Compliance Reasoner",
  "version": "1.0.0"
}
```

## `POST /api/compliance/analyze`

Analyzes whether an AI-generated response is safe to show to the user.

### Request

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

### Response

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

## `GET /api/compliance/logs`

Returns recent audit logs.

Query parameters:

- `limit`: integer from `1` to `100`, default `20`

```bash
curl "http://localhost:8000/api/compliance/logs?limit=10"
```

## Decisions

The backend always normalizes the final decision from `risk_score`.

| Score | Risk level | Decision |
| --- | --- | --- |
| 0-30 | low | allow |
| 31-60 | medium | modify |
| 61-80 | high | regenerate |
| 81-100 | critical | block |
