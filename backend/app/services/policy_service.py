from app.schemas.compliance import LLMComplianceResult
from app.services.decision_service import decision_for_score, risk_level_for_score


RISK_KEYWORDS = {
    "privacy": ["phone number", "email address", "ssn", "passport", "customer", "private", "personal data"],
    "pii_leakage": ["phone numbers", "addresses", "credit card", "national id", "cnic", "date of birth"],
    "prompt_injection": ["ignore previous instructions", "system prompt", "hidden instructions", "developer message"],
    "cybersecurity": ["malware", "credential theft", "exploit", "phishing kit", "bypass authentication"],
    "medical_risk": ["definitely have", "diagnose", "cancer", "prescribe", "dosage"],
    "financial_risk": ["guaranteed profit", "insider trading", "buy this stock now"],
    "hate_harassment": ["slur", "inferior race", "targeted harassment"],
    "self_harm": ["suicide", "self-harm", "kill myself"],
    "violence": ["build a bomb", "assassinate", "violent threat"],
    "sexual_content": ["explicit sexual"],
    "legal_violation": ["evade taxes", "forge", "illegal"],
}


def local_policy_evaluation(user_prompt: str, model_response: str, policies: list[str]) -> LLMComplianceResult:
    combined = f"{user_prompt}\n{model_response}".lower()
    violations = []
    score = 10

    for category, keywords in RISK_KEYWORDS.items():
        if any(keyword in combined for keyword in keywords):
            violations.append(category)
            if category in {"privacy", "pii_leakage", "prompt_injection", "self_harm", "violence", "legal_violation"}:
                score = max(score, 90)
            elif category in {"cybersecurity", "medical_risk", "financial_risk"}:
                score = max(score, 75)
            else:
                score = max(score, 65)

    if "phishing is a scam" in combined and "how to avoid" in combined:
        violations = [v for v in violations if v != "cybersecurity"]
        score = min(score, 20)

    if not violations and any(policy in policies for policy in ("safety", "privacy", "legal")):
        score = 15

    decision = decision_for_score(score)
    risk_level = risk_level_for_score(score)

    safe_response = ""
    recommended_action = "Response may be shown to the user."
    if decision == "modify":
        safe_response = "Provide the response with sensitive details removed and add appropriate caveats."
        recommended_action = "Modify the response before displaying it."
    elif decision == "regenerate":
        safe_response = "I cannot make definitive claims here. Please consult a qualified professional or provide safer, general information."
        recommended_action = "Regenerate the answer with safer wording and stronger caveats."
    elif decision == "block":
        safe_response = "I cannot provide that information."
        recommended_action = "Block the response and explain the applicable safety or compliance policy."

    return LLMComplianceResult(
        decision=decision,
        risk_score=score,
        risk_level=risk_level,
        violations=sorted(set(violations)) or [],
        reason="Local fallback evaluation detected policy risk." if violations else "No material compliance risk detected.",
        safe_response=safe_response,
        recommended_action=recommended_action,
    )
