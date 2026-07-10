from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.compliance import AuditLogResponse, ComplianceRequest, ComplianceResponse
from app.services.compliance_service import ComplianceService


router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.post("/analyze", response_model=ComplianceResponse)
async def analyze_compliance(payload: ComplianceRequest, db: Session = Depends(get_db)) -> ComplianceResponse:
    service = ComplianceService()
    return await service.analyze(payload, db)


@router.get("/logs", response_model=list[AuditLogResponse])
def get_logs(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[AuditLogResponse]:
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        AuditLogResponse(
            audit_id=log.id,
            user_prompt=log.user_prompt,
            model_response=log.model_response,
            application_context=log.application_context,
            policies=log.policies,
            metadata=log.metadata_json,
            decision=log.decision,
            risk_score=log.risk_score,
            risk_level=log.risk_level,
            violations=log.violations,
            reason=log.reason,
            safe_response=log.safe_response,
            recommended_action=log.recommended_action,
            created_at=log.created_at,
        )
        for log in logs
    ]
