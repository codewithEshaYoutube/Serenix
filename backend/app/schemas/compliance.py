from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


Decision = Literal["allow", "modify", "regenerate", "block"]
RiskLevel = Literal["low", "medium", "high", "critical"]

SUPPORTED_POLICIES = (
    "safety",
    "privacy",
    "legal",
    "pii_leakage",
    "prompt_injection",
    "cybersecurity",
    "legal_violation",
    "medical_risk",
    "financial_risk",
    "bias_discrimination",
    "hallucination_risk",
    "policy_violation",
    "self_harm",
    "violence",
    "hate_harassment",
    "sexual_content",
)


class ComplianceRequest(BaseModel):
    user_prompt: str = Field(..., min_length=1, max_length=12000)
    model_response: str = Field(..., min_length=1, max_length=20000)
    application_context: str = Field("", max_length=8000)
    policies: list[str] = Field(default_factory=lambda: ["safety", "privacy", "legal"])
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("policies")
    @classmethod
    def validate_policies(cls, value: list[str]) -> list[str]:
        if not value:
            return ["safety", "privacy", "legal"]
        normalized = [policy.strip().lower() for policy in value if policy and policy.strip()]
        unsupported = sorted(set(normalized) - set(SUPPORTED_POLICIES))
        if unsupported:
            raise ValueError(f"Unsupported policies: {', '.join(unsupported)}")
        return normalized


class LLMComplianceResult(BaseModel):
    decision: Decision = "regenerate"
    risk_score: int = Field(default=70, ge=0, le=100)
    risk_level: RiskLevel = "high"
    violations: list[str] = Field(default_factory=list)
    reason: str = ""
    safe_response: str = ""
    recommended_action: str = ""


class ComplianceResponse(LLMComplianceResult):
    audit_id: int


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    audit_id: int
    user_prompt: str
    model_response: str
    application_context: str
    policies: list[str]
    metadata: dict[str, Any]
    decision: Decision
    risk_score: int
    risk_level: RiskLevel
    violations: list[str]
    reason: str
    safe_response: str
    recommended_action: str
    created_at: datetime
