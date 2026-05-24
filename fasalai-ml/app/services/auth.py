# app/services/auth.py
# Bearer token authentication for the ML service
# Next.js sends ML_SERVICE_SECRET in Authorization header

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify the bearer token sent by Next.js.
    Token must match ML_SERVICE_SECRET env var.
    """
    if credentials.credentials != settings.ML_SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing ML service token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials
