import json
from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

import asyncpg
from fastapi import Request

from app.auth.tenant import get_tenant_id
from app.config import get_settings


@dataclass
class AuditEntry:
    id: str
    tenant_id: str | None
    action: str
    resource_type: str
    resource_id: str | None
    details: dict
    created_at: datetime


class MemoryAuditStore:
    def __init__(self) -> None:
        self._entries: list[AuditEntry] = []

    async def log(
        self,
        *,
        action: str,
        resource_type: str,
        tenant_id: str | None = None,
        resource_id: str | None = None,
        details: dict | None = None,
    ) -> AuditEntry:
        entry = AuditEntry(
            id=str(uuid4()),
            tenant_id=tenant_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            created_at=datetime.now(timezone.utc),
        )
        self._entries.append(entry)
        return entry

    async def list(self, tenant_id: str | None = None) -> list[AuditEntry]:
        if tenant_id is None:
            return list(self._entries)
        return [e for e in self._entries if e.tenant_id == tenant_id]


class PostgresAuditStore:
    @property
    def _dsn(self) -> str:
        return get_settings().database_url

    async def log(
        self,
        *,
        action: str,
        resource_type: str,
        tenant_id: str | None = None,
        resource_id: str | None = None,
        details: dict | None = None,
    ) -> AuditEntry:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "INSERT INTO audit_logs "
                "(tenant_id, action, resource_type, resource_id, details) "
                "VALUES ($1, $2, $3, $4, $5::jsonb) "
                "RETURNING id, tenant_id, action, resource_type, resource_id, "
                "details, created_at",
                tenant_id,
                action,
                resource_type,
                resource_id,
                json.dumps(details or {}),
            )
            return _row_to_entry(row)
        finally:
            await conn.close()

    async def list(self, tenant_id: str | None = None) -> list[AuditEntry]:
        conn = await asyncpg.connect(self._dsn)
        try:
            if tenant_id:
                rows = await conn.fetch(
                    "SELECT id, tenant_id, action, resource_type, resource_id, "
                    "details, created_at FROM audit_logs "
                    "WHERE tenant_id = $1 ORDER BY created_at DESC",
                    tenant_id,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, tenant_id, action, resource_type, resource_id, "
                    "details, created_at FROM audit_logs ORDER BY created_at DESC"
                )
            return [_row_to_entry(r) for r in rows]
        finally:
            await conn.close()


def _row_to_entry(row) -> AuditEntry:
    details = row["details"]
    if isinstance(details, str):
        details = json.loads(details)
    return AuditEntry(
        id=str(row["id"]),
        tenant_id=row["tenant_id"],
        action=row["action"],
        resource_type=row["resource_type"],
        resource_id=row["resource_id"],
        details=dict(details or {}),
        created_at=row["created_at"],
    )


async def write_audit(
    request: Request,
    *,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    details: dict | None = None,
) -> None:
    store = getattr(request.app.state, "audit_store", None)
    if store is None:
        return

    tenant_id = getattr(request.state, "tenant_id", None)
    if tenant_id is None:
        tenant_id = get_tenant_id(request)

    await store.log(
        action=action,
        resource_type=resource_type,
        tenant_id=tenant_id,
        resource_id=resource_id,
        details=details,
    )
