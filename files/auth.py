"""
Placeholder auth dependencies.
Wire `get_current_user` up to your actual auth (JWT/session/etc).
Replace the body but keep the shape so `require_warden` below keeps working.
"""
import uuid
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status


@dataclass
class CurrentUser:
    id: uuid.UUID
    role: str  # "student" | "warden"


def get_current_user() -> CurrentUser:
    # TODO: replace with real token/session decoding
    raise NotImplementedError("Wire this up to your existing auth system")


def require_warden(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """AC2: non-warden users get an authorization error."""
    if user.role != "warden":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only wardens may approve or reject outpass requests.",
        )
    return user
