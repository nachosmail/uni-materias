from fastapi import Header, HTTPException
from .auth import verify_token

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing Authorization header")

    token = authorization.split(" ", 1)[1]

    payload = verify_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(401, "Invalid Supabase token")

    return {"user_id": user_id}
