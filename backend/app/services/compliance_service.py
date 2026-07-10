from __future__ import annotations

import json
import re
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.prompts.compliance_prompt import build_compliance_prompt
from app.schemas.compliance import ComplianceRequest, ComplianceResponse, LLMComplianceResult
from app.services.decision_service import decision_for_score, normalize_risk_score, risk_level_for_score
from app.services.policy_service import local_policy_evaluation
from app.services.qwen_service import QwenService, QwenServiceError


class ComplianceService:
    def __init__(self, qwen_service: QwenService | None = None):
        self.qwen_service = qwen_service or QwenService()

    async def analyze(self, payload: ComplianceRequest, db: Session) -> ComplianceResponse:
        prompt = build_compliance_prompt(
            user_prompt=payload.user_prompt,
            model_response=payload.model_response,
            application_context=payload.application_context,
            policies=payload.policies,
            metadata=payload.metadata,
        )

        llm_raw_response = ""
        try:
            llm_raw_response = await self.qwen_service.analyze(prompt)
            result = parse_llm_json(llm_raw_response)
        except (QwenServiceError, ValueError, json.JSONDecodeError):
            result = local_policy_evaluation(payload.user_prompt, payload.model_response, payload.policies)

        normalized = normalize_result(result)

        audit_log = AuditLog(
            user_prompt=payload.user_prompt,
            model_response=payload.model_response,
            application_context=payload.application_context,
            policies=payload.policies,
            metadata_json=payload.metadata,
            decision=normalized.decision,
            risk_score=normalized.risk_score,
            risk_level=normalized.risk_level,
            violations=normalized.violations,
            reason=normalized.reason,
            safe_response=normalized.safe_response,
            recommended_action=normalized.recommended_action,
            llm_raw_response=llm_raw_response,
        )
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)

        return ComplianceResponse(
            audit_id=audit_log.id,
            decision=normalized.decision,
            risk_score=normalized.risk_score,
            risk_level=normalized.risk_level,
            violations=normalized.violations,
            reason=normalized.reason,
            safe_response=normalized.safe_response,
            recommended_action=normalized.recommended_action,
        )


def parse_llm_json(raw_response: str) -> LLMComplianceResult:
    text = raw_response.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise ValueError("LLM response did not contain a JSON object.")
        data = json.loads(match.group(0))

    if not isinstance(data, dict):
        raise ValueError("LLM JSON response must be an object.")
    return LLMComplianceResult(**data)


def normalize_result(result: LLMComplianceResult | dict[str, Any]) -> LLMComplianceResult:
    if isinstance(result, dict):
        result = LLMComplianceResult(**result)

    score = normalize_risk_score(result.risk_score)
    return LLMComplianceResult(
        decision=decision_for_score(score),
        risk_score=score,
        risk_level=risk_level_for_score(score),
        violations=sorted(set(result.violations)),
        reason=result.reason.strip() or "Compliance analysis completed.",
        safe_response=result.safe_response.strip(),
        recommended_action=result.recommended_action.strip(),
    )
