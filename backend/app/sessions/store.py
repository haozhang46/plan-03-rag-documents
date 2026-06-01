from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

import asyncpg

from app.config import get_settings


@dataclass
class SessionRecord:
    id: str
    thread_id: str
    title: str
    starred: bool
    created_at: datetime
    updated_at: datetime
    tenant_id: str = "default"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "thread_id": self.thread_id,
            "title": self.title,
            "starred": self.starred,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class MemorySessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, SessionRecord] = {}

    async def list_sessions(self, tenant_id: str | None = None) -> list[SessionRecord]:
        records = list(self._sessions.values())
        if tenant_id and get_settings().tenant_mode:
            records = [r for r in records if r.tenant_id == tenant_id]
        return sorted(
            records,
            key=lambda s: s.updated_at,
            reverse=True,
        )

    async def create(
        self,
        title: str = "New Chat",
        thread_id: str | None = None,
        tenant_id: str | None = None,
    ) -> SessionRecord:
        now = datetime.now(timezone.utc)
        tid = thread_id or str(uuid4())
        record = SessionRecord(
            id=str(uuid4()),
            thread_id=tid,
            title=title,
            starred=False,
            created_at=now,
            updated_at=now,
            tenant_id=tenant_id or "default",
        )
        self._sessions[record.id] = record
        return record

    async def delete(self, session_id: str, tenant_id: str | None = None) -> bool:
        record = self._sessions.get(session_id)
        if record is None:
            return False
        if tenant_id and get_settings().tenant_mode:
            if record.tenant_id != tenant_id:
                return False
        return self._sessions.pop(session_id, None) is not None

    async def update(
        self,
        session_id: str,
        *,
        title: str | None = None,
        starred: bool | None = None,
        tenant_id: str | None = None,
    ) -> SessionRecord | None:
        record = self._sessions.get(session_id)
        if not record:
            return None
        if tenant_id and get_settings().tenant_mode:
            if record.tenant_id != tenant_id:
                return None
        if title is not None:
            record.title = title
        if starred is not None:
            record.starred = starred
        record.updated_at = datetime.now(timezone.utc)
        return record

    async def touch_by_thread(self, thread_id: str, title: str | None = None) -> None:
        for record in self._sessions.values():
            if record.thread_id == thread_id:
                if title is not None:
                    record.title = title[:60]
                record.updated_at = datetime.now(timezone.utc)
                return


class PostgresSessionStore:
    @property
    def _dsn(self) -> str:
        return get_settings().database_url

    async def list_sessions(self, tenant_id: str | None = None) -> list[SessionRecord]:
        conn = await asyncpg.connect(self._dsn)
        try:
            if tenant_id and get_settings().tenant_mode:
                await conn.execute(
                    "SELECT set_config('app.tenant_id', $1, false)", tenant_id
                )
                rows = await conn.fetch(
                    "SELECT id, thread_id, title, starred, created_at, updated_at "
                    "FROM sessions WHERE tenant_id = $1 ORDER BY updated_at DESC",
                    tenant_id,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, thread_id, title, starred, created_at, updated_at "
                    "FROM sessions ORDER BY updated_at DESC"
                )
            return [_row_to_record(r) for r in rows]
        finally:
            await conn.close()

    async def create(
        self,
        title: str = "New Chat",
        thread_id: str | None = None,
        tenant_id: str | None = None,
    ) -> SessionRecord:
        tid = thread_id or str(uuid4())
        conn = await asyncpg.connect(self._dsn)
        try:
            if tenant_id and get_settings().tenant_mode:
                await conn.execute(
                    "SELECT set_config('app.tenant_id', $1, false)", tenant_id
                )
                row = await conn.fetchrow(
                    "INSERT INTO sessions (thread_id, title, tenant_id) "
                    "VALUES ($1, $2, $3) "
                    "RETURNING id, thread_id, title, starred, created_at, updated_at",
                    tid,
                    title,
                    tenant_id,
                )
            else:
                row = await conn.fetchrow(
                    "INSERT INTO sessions (thread_id, title) VALUES ($1, $2) "
                    "RETURNING id, thread_id, title, starred, created_at, updated_at",
                    tid,
                    title,
                )
            return _row_to_record(row)
        finally:
            await conn.close()

    async def delete(self, session_id: str, tenant_id: str | None = None) -> bool:
        conn = await asyncpg.connect(self._dsn)
        try:
            if tenant_id and get_settings().tenant_mode:
                await conn.execute(
                    "SELECT set_config('app.tenant_id', $1, false)", tenant_id
                )
                result = await conn.execute(
                    "DELETE FROM sessions WHERE id = $1::uuid AND tenant_id = $2",
                    session_id,
                    tenant_id,
                )
            else:
                result = await conn.execute(
                    "DELETE FROM sessions WHERE id = $1::uuid",
                    session_id,
                )
            return result.endswith("1")
        finally:
            await conn.close()

    async def update(
        self,
        session_id: str,
        *,
        title: str | None = None,
        starred: bool | None = None,
        tenant_id: str | None = None,
    ) -> SessionRecord | None:
        conn = await asyncpg.connect(self._dsn)
        try:
            if tenant_id and get_settings().tenant_mode:
                await conn.execute(
                    "SELECT set_config('app.tenant_id', $1, false)", tenant_id
                )
                row = await conn.fetchrow(
                    "UPDATE sessions SET "
                    "title = COALESCE($2, title), "
                    "starred = COALESCE($3, starred), "
                    "updated_at = now() "
                    "WHERE id = $1::uuid AND tenant_id = $4 "
                    "RETURNING id, thread_id, title, starred, created_at, updated_at",
                    session_id,
                    title,
                    starred,
                    tenant_id,
                )
            else:
                row = await conn.fetchrow(
                    "UPDATE sessions SET "
                    "title = COALESCE($2, title), "
                    "starred = COALESCE($3, starred), "
                    "updated_at = now() "
                    "WHERE id = $1::uuid "
                    "RETURNING id, thread_id, title, starred, created_at, updated_at",
                    session_id,
                    title,
                    starred,
                )
            return _row_to_record(row) if row else None
        finally:
            await conn.close()

    async def touch_by_thread(self, thread_id: str, title: str | None = None) -> None:
        conn = await asyncpg.connect(self._dsn)
        try:
            if title is not None:
                await conn.execute(
                    "UPDATE sessions SET title = $2, updated_at = now() "
                    "WHERE thread_id = $1",
                    thread_id,
                    title[:60],
                )
            else:
                await conn.execute(
                    "UPDATE sessions SET updated_at = now() WHERE thread_id = $1",
                    thread_id,
                )
        finally:
            await conn.close()


def _row_to_record(row) -> SessionRecord:
    return SessionRecord(
        id=str(row["id"]),
        thread_id=row["thread_id"],
        title=row["title"],
        starred=bool(row["starred"]),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
