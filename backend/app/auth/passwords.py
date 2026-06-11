import hashlib
import hmac
import secrets

_ITERATIONS = 260_000
_ALGORITHM = "sha256"


def hash_password(plain: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        _ALGORITHM,
        plain.encode(),
        salt.encode(),
        _ITERATIONS,
    )
    return f"pbkdf2_sha256${_ITERATIONS}${salt}${digest.hex()}"


def verify_password(plain: str, stored: str) -> bool:
    try:
        scheme, iter_str, salt, hex_digest = stored.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iter_str)
        expected = bytes.fromhex(hex_digest)
    except (ValueError, TypeError):
        return False
    actual = hashlib.pbkdf2_hmac(
        _ALGORITHM,
        plain.encode(),
        salt.encode(),
        iterations,
    )
    return hmac.compare_digest(actual, expected)
