from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.auth import authenticate_admin, create_access_token, get_current_admin
from app.config import settings
from app.schemas import LoginRequest, MeResponse, Token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: LoginRequest) -> Token:
    if not authenticate_admin(payload.username, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(payload.username)
    return Token(access_token=token, token_type="bearer")


@router.post("/login/oauth", response_model=Token, include_in_schema=False)
def login_oauth(form: OAuth2PasswordRequestForm = Depends()) -> Token:
    """Form-based login to support the interactive Swagger 'Authorize' button."""
    if not authenticate_admin(form.username, form.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token(form.username)
    return Token(access_token=token, token_type="bearer")


@router.get("/me", response_model=MeResponse)
def me(current: MeResponse = Depends(get_current_admin)) -> MeResponse:
    return current
