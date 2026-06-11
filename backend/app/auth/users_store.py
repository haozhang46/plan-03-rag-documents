from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

import asyncpg

from app.config import get_settings


@dataclass
class UserRecord:
    id: str
    tenant_id: str
    email: str
    password_hash: str
    display_name: str
    created_at: datetime


class MemoryUsersStore:
    def __init__(self) -> None:
        self._users: dict[str, UserRecord] = {}
        self._by_email: dict[str, str] = {}

    async def create(
        self,
        *,
        tenant_id: str,
        email: str,
        password_hash: str,
        display_name: str = "",
    ) -> UserRecord:
        normalized = email.strip().lower()
        if normalized in self._by_email:
            raise ValueError("email already registered")
        record = UserRecord(
            id=str(uuid4()),
            tenant_id=tenant_id,
            email=normalized,
            password_hash=password_hash,
            display_name=display_name,
            created_at=datetime.now(timezone.utc),
        )
        self._users[record.id] = record
        self._by_email[normalized] = record.id
        return record

    async def get_by_email(self, email: str) -> UserRecord | None:
        user_id = self._by_email.get(email.strip().lower())
        return self._users.get(user_id) if user_id else None

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        return self._users.get(user_id)


class PostgresUsersStore:
    @property
    def _dsn(self) -> str:
        return get_settings().database_url

    async def create(
        self,
        *,
        tenant_id: str,
        email: str,
        password_hash: str,
        display_name: str = "",
    ) -> UserRecord:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "INSERT INTO users (tenant_id, email, password_hash, display_name) "
                "VALUES ($1, $2, $3, $4) "
                "RETURNING id, tenant_id, email, password_hash, display_name, created_at",
                tenant_id,
                email.strip().lower(),
                password_hash,
                display_name,
            )
            return _row_to_user(row)
        finally:
            await conn.close()

    async def get_by_email(self, email: str) -> UserRecord | None:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "SELECT id, tenant_id, email, password_hash, display_name, created_at "
                "FROM users WHERE email = $1",
                email.strip().lower(),
            )
            return _row_to_user(row) if row else None
        finally:
            await conn.close()

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "SELECT id, tenant_id, email, password_hash, display_name, created_at "
                "FROM users WHERE id = $1::uuid",
                user_id,
            )
            return _row_to_user(row) if row else None
        finally:
            await conn.close()


def _row_to_user(row) -> UserRecord:
    return UserRecord(
        id=str(row["id"]),
        tenant_id=row["tenant_id"],
        email=row["email"],
        password_hash=row["password_hash"],
        display_name=row["display_name"],
        created_at=row["created_at"],
    )
