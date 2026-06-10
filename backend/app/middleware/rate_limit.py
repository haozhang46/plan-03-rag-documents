import time
from collections import defaultdict

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.auth.tenant import get_tenant_id
from app.config import get_settings

_limiter: "SlidingWindowRateLimiter | None" = None


class SlidingWindowRateLimiter:
    WINDOW_SECONDS = 60

    def __init__(self, rpm: int) -> None:
        self.rpm = rpm
        self._hits: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.WINDOW_SECONDS
        hits = self._hits[key]
        self._hits[key] = [t for t in hits if t > cutoff]
        if len(self._hits[key]) >= self.rpm:
            return False
        self._hits[key].append(now)
        return True

    def reset(self) -> None:
        self._hits.clear()


def get_rate_limiter() -> SlidingWindowRateLimiter:
    global _limiter
    if _limiter is None:
        _limiter = SlidingWindowRateLimiter(get_settings().rate_limit_rpm)
    return _limiter


def reset_rate_limiter() -> None:
    global _limiter
    settings = get_settings()
    if settings.rate_limit_rpm <= 0:
        _limiter = SlidingWindowRateLimiter(0)
    else:
        _limiter = SlidingWindowRateLimiter(settings.rate_limit_rpm)


class RateLimitMiddleware(BaseHTTPMiddleware):
    MUTATION_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})

    async def dispatch(self, request: Request, call_next):
        settings = get_settings()
        if settings.rate_limit_rpm <= 0:
            return await call_next(request)

        if request.method not in self.MUTATION_METHODS:
            return await call_next(request)

        if not request.url.path.startswith("/v1/"):
            return await call_next(request)

        tenant_id = get_tenant_id(request) or "default"
        limiter = get_rate_limiter()
        if not limiter.check(tenant_id):
            return JSONResponse(
                status_code=429,
                content={"detail": "rate limit exceeded"},
            )

        return await call_next(request)
