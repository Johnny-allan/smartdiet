from pydantic import BaseModel, EmailStr


class SessionUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str


class SessionRead(BaseModel):
    authenticated: bool
    mode: str
    user: SessionUser | None = None
