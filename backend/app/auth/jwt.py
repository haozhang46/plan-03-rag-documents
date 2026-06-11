import base64
import binascii
import hashlib
import hmac
import json
import time


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def create_access_token(
    payload: dict, *, secret: str, expires_in_seconds: int
) -> str:
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body_payload = {**payload, "exp": int(time.time()) + expires_in_seconds}
    body = _b64url_encode(json.dumps(body_payload, separators=(",", ":")).encode())
    signing_input = f"{header}.{body}".encode()
    signature = _b64url_encode(
        hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    )
    return f"{header}.{body}.{signature}"


def decode_jwt_payload(token: str, secret: str) -> dict | None:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError:
        return None

    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected_sig = hmac.new(
        secret.encode(),
        signing_input,
        hashlib.sha256,
    ).digest()
    try:
        actual_sig = _b64url_decode(signature_b64)
    except (ValueError, binascii.Error):
        return None
    if not hmac.compare_digest(expected_sig, actual_sig):
        return None

    try:
        payload = json.loads(_b64url_decode(payload_b64).decode())
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        return None

    exp = payload.get("exp")
    if exp is not None and int(exp) < int(time.time()):
        return None
    return payload
