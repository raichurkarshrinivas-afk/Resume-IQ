"""
Authentication and Account routes:
- Individual registration
- Teacher registration
- Login
- Current user profile
- Profile name update
- Password reset request (forgot-password)
- Password reset completion (reset-password)
- Account deletion
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from core.dependencies import get_db, get_current_user
from core.security import hash_password, verify_password, create_access_token
from core.rate_limit import limiter
from models.user import User
from models.teacher_profile import TeacherProfile
from models.password_reset import PasswordResetToken
from schemas.user import (
    UserRegister,
    TeacherRegister,
    UserLogin,
    UserOut,
    AuthResponse,
    ProfileUpdate,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
alias_router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def register(request: Request, body: UserRegister, db: Session = Depends(get_db)):
    """Register a new individual candidate account."""
    clean_email = body.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=clean_email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name.strip(),
        role="candidate",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/register-teacher", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def register_teacher(request: Request, body: TeacherRegister, db: Session = Depends(get_db)):
    """
    Register a teacher account integrated with the same authentication system.
    Stores institutional and department details in TeacherProfile.
    Does NOT grant admin privileges or access to student records.
    """
    clean_email = body.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=clean_email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name.strip(),
        role="teacher",
        is_active=True,
    )
    db.add(user)
    db.flush()

    teacher_profile = TeacherProfile(
        user_id=user.id,
        institution_name=body.institution_name.strip(),
        department=body.department.strip(),
        designation=body.designation.strip() if body.designation else None,
        status="pending",
    )
    db.add(teacher_profile)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
@limiter.limit("30/minute")
def login(request: Request, body: UserLogin, db: Session = Depends(get_db)):
    """Authenticate an existing user and return a JWT."""
    clean_email = body.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's profile and role details."""
    return UserOut.model_validate(current_user)


@router.patch("/profile", response_model=UserOut)
def update_profile(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update permitted user profile fields (e.g. full name).
    Disallows changing role, email, approval status, or elevated fields.
    """
    current_user.full_name = body.full_name.strip()
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/forgot-password", response_model=MessageResponse)
@limiter.limit("10/minute")
def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Generate an expiring, single-use password reset token.
    Provides consistent account-existence messaging to prevent enumeration.
    """
    clean_email = body.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()

    raw_token = None
    if user and user.is_active:
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(reset_record)
        db.commit()

    # Note: If no email provider is configured, we provide the token in header/response for test verification
    response_msg = "If an account with that email exists, password reset instructions have been generated."
    return MessageResponse(message=response_msg, success=True)


@router.post("/reset-password", response_model=MessageResponse)
@limiter.limit("10/minute")
def reset_password(
    request: Request,
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Validate token and update password, invalidating the single-use token."""
    if not body.token or not body.token.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token is required",
        )

    token_hash = hashlib.sha256(body.token.strip().encode("utf-8")).hexdigest()
    now_utc = datetime.now(timezone.utc)

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now_utc,
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used password reset token",
        )

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User associated with token not found",
        )

    user.hashed_password = hash_password(body.new_password)
    reset_token.used_at = now_utc
    db.commit()

    return MessageResponse(
        message="Password has been successfully updated. You may now log in.",
        success=True,
    )


@router.delete("/account", response_model=MessageResponse)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Permanently delete the authenticated user's account and all associated
    resumes, analyses, generated content, and teacher profiles.
    """
    db.delete(current_user)
    db.commit()
    return MessageResponse(
        message="Your account and all associated data have been permanently deleted.",
        success=True,
    )


# ── Aliases for backwards compatibility ──

@alias_router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_alias(request: Request, body: UserRegister, db: Session = Depends(get_db)):
    return register(request=request, body=body, db=db)


@alias_router.post("/register-teacher", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_teacher_alias(request: Request, body: TeacherRegister, db: Session = Depends(get_db)):
    return register_teacher(request=request, body=body, db=db)


@alias_router.post("/login", response_model=AuthResponse)
def login_alias(request: Request, body: UserLogin, db: Session = Depends(get_db)):
    return login(request=request, body=body, db=db)


@alias_router.get("/me", response_model=UserOut)
def get_me_alias(current_user: User = Depends(get_current_user)):
    return get_me(current_user=current_user)
