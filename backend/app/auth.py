import os
import httpx
from jose import jwt
from functools import lru_cache
from fastapi import HTTPException

SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL")


@lru_cache(maxsize=1)
def get_jwks():
    resp = httpx.get(SUPABASE_JWKS_URL)
    resp.raise_for_status()
    return resp.json()


def verify_token(token: str):
    jwks = get_jwks()

    unverified_header = jwt.get_unverified_header(token)

    # buscar la clave que coincide con el kid del token
    key = next((k for k in jwks["keys"] if k["kid"] == unverified_header["kid"]), None)
    if key is None:
        raise HTTPException(status_code=401, detail="Invalid token: kid not found")

    try:
        payload = jwt.decode(
            token,
            key,
            algorithms=[key["alg"]],
            options={"verify_aud": False},
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
