from app.schemas.compliance import Decision, RiskLevel


def normalize_risk_score(score: int | float | str | None) -> int:
    try:
        numeric_score = int(float(score))
    except (TypeError, ValueError):
        numeric_score = 70
    return max(0, min(100, numeric_score))


def risk_level_for_score(score: int) -> RiskLevel:
    if score <= 30:
        return "low"
    if score <= 60:
        return "medium"
    if score <= 80:
        return "high"
    return "critical"


def decision_for_score(score: int) -> Decision:
    if score <= 30:
        return "allow"
    if score <= 60:
        return "modify"
    if score <= 80:
        return "regenerate"
    return "block"
