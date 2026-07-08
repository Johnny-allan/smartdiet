from fastapi import APIRouter

from app.auth.schemas import SessionRead, SessionUser
from app.core.config import settings
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/session", response_model=ApiResponse[SessionRead])
def get_session() -> ApiResponse[SessionRead]:
    if settings.AUTH_ENABLED:
        return ApiResponse(data=SessionRead(authenticated=False, mode="auth_required", user=None))

    return ApiResponse(
        data=SessionRead(
            authenticated=True,
            mode="beta",
            user=SessionUser(
                id="beta-local-user",
                name=settings.BETA_USER_NAME,
                email=settings.BETA_USER_EMAIL,
                role="nutritionist",
            ),
        )
    )
