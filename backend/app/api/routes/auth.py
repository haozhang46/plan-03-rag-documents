from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.auth.jwt import create_access_token
from app.auth.passwords import hash_password, verify_password
from app.auth.skill_admin import require_skill_admin
from app.auth.tenant import get_tenant_id, get_user_id_from_request
from app.auth.users_store import MemoryUsersStore
from app.config import get_settings

router = APIRouter(prefix="/v1")


class LoginRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=8)


class CreateUserRequest(BaseModel):
    tenant_id: str = Field(min_length=1)
    email: str = Field(min_length=3)
    password: str = Field(min_length=8)
    display_name: str = ""


class UserOut(BaseModel):
    id: str
    email: str
    tenant_id: str
    display_name: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


def _users_store(request: Request) -> MemoryUsersStore:
    store = getattr(request.app.state, "users_store", None)
    if store is None:
        raise HTTPException(status_code=503, detail="users store unavailable")
    return store


@router.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest, request: Request) -> LoginResponse:
    settings = get_settings()
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT_SECRET not configured")

    user = await _users_store(request).get_by_email(body.email)
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    expires_in = settings.jwt_expires_minutes * 60
    token = create_access_token(
        {
            "sub": user.id,
            "tenant_id": user.tenant_id,
            "email": user.email,
        },
        secret=settings.jwt_secret,
        expires_in_seconds=expires_in,
    )
    return LoginResponse(
        access_token=token,
        expires_in=expires_in,
        user=UserOut(
            id=user.id,
            email=user.email,
            tenant_id=user.tenant_id,
            display_name=user.display_name,
        ),
    )


@router.get("/auth/me", response_model=UserOut)
async def me(request: Request) -> UserOut:
    settings = get_settings()
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT_SECRET not configured")

    tenant_id = get_tenant_id(request)
    user_id = get_user_id_from_request(request)
    if not tenant_id or not user_id:
        raise HTTPException(status_code=401, detail="authentication required")

    user = await _users_store(request).get_by_id(user_id)
    if user is None or user.tenant_id != tenant_id:
        raise HTTPException(status_code=401, detail="authentication required")

    return UserOut(
        id=user.id,
        email=user.email,
        tenant_id=user.tenant_id,
        display_name=user.display_name,
    )


@router.post("/admin/users", status_code=201, response_model=UserOut)
async def admin_create_user(body: CreateUserRequest, request: Request) -> UserOut:
    require_skill_admin(request, tenant_id=None)
    try:
        user = await _users_store(request).create(
            tenant_id=body.tenant_id,
            email=body.email,
            password_hash=hash_password(body.password),
            display_name=body.display_name,
        )
    except ValueError:
        raise HTTPException(status_code=409, detail="email already registered") from None
    return UserOut(
        id=user.id,
        email=user.email,
        tenant_id=user.tenant_id,
        display_name=user.display_name,
    )
