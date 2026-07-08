from fastapi import APIRouter

from app.analytics.schemas import DashboardSummary
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=ApiResponse[DashboardSummary])
def dashboard_summary() -> ApiResponse[DashboardSummary]:
    return ApiResponse(data=DashboardSummary(active_patients=0, pending_actions=0, beta_status="local"))
