from pydantic import BaseModel


class DashboardSummary(BaseModel):
    active_patients: int
    pending_actions: int
    beta_status: str
