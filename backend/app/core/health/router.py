from fastapi import APIRouter

from app.core.health.schemas import HealthPayload
from app.shared.responses import ApiResponse

router = APIRouter()


@router.get("/health", response_model=ApiResponse[HealthPayload])
def health_check() -> ApiResponse[HealthPayload]:
    return ApiResponse(data=HealthPayload(status="ok", service="smartdiet-api"))
