from dataclasses import dataclass
from typing import Protocol

import asyncpg

from app.config import get_settings


@dataclass
class RagflowBinding:
    tenant_id: str
    user_id: str | None
    api_key: str
    default_dataset_ids: list[str]


def _user_key(user_id: str | None) -> str:
    return user_id or ""


class RagflowBindingsStore(Protocol):
    async def get(
        self, tenant_id: str, user_id: str | None
    ) -> RagflowBinding | None: ...

    async def upsert(
        self,
        tenant_id: str,
        user_id: str | None,
        api_key: str,
        default_dataset_ids: list[str],
    ) -> RagflowBinding: ...

    async def delete(self, tenant_id: str, user_id: str | None) -> bool: ...


class MemoryRagflowBindingsStore:
    def __init__(self):
        self._rows: dict[tuple[str, str], RagflowBinding] = {}

    async def get(
        self, tenant_id: str, user_id: str | None
    ) -> RagflowBinding | None:
        if user_id:
            row = self._rows.get((tenant_id, user_id))
            if row:
                return row
        return self._rows.get((tenant_id, ""))

    async def upsert(
        self,
        tenant_id: str,
        user_id: str | None,
        api_key: str,
        default_dataset_ids: list[str],
    ) -> RagflowBinding:
        key = (tenant_id, _user_key(user_id))
        row = RagflowBinding(
            tenant_id=tenant_id,
            user_id=user_id,
            api_key=api_key,
            default_dataset_ids=list(default_dataset_ids),
        )
        self._rows[key] = row
        return row

    async def delete(self, tenant_id: str, user_id: str | None) -> bool:
        key = (tenant_id, _user_key(user_id))
        return self._rows.pop(key, None) is not None


class PostgresRagflowBindingsStore:
    async def get(
        self, tenant_id: str, user_id: str | None
    ) -> RagflowBinding | None:
        conn = await asyncpg.connect(get_settings().database_url)
        try:
            if user_id:
                row = await conn.fetchrow(
                    "SELECT tenant_id, user_id, api_key, default_dataset_ids "
                    "FROM ragflow_bindings WHERE tenant_id = $1 AND user_id = $2",
                    tenant_id,
                    user_id,
                )
                if row:
                    return _row_to_binding(row)
            row = await conn.fetchrow(
                "SELECT tenant_id, user_id, api_key, default_dataset_ids "
                "FROM ragflow_bindings WHERE tenant_id = $1 AND user_id = ''",
                tenant_id,
            )
            if row:
                return _row_to_binding(row)
            return None
        finally:
            await conn.close()

    async def upsert(
        self,
        tenant_id: str,
        user_id: str | None,
        api_key: str,
        default_dataset_ids: list[str],
    ) -> RagflowBinding:
        uid = _user_key(user_id)
        conn = await asyncpg.connect(get_settings().database_url)
        try:
            row = await conn.fetchrow(
                "INSERT INTO ragflow_bindings "
                "(tenant_id, user_id, api_key, default_dataset_ids, updated_at) "
                "VALUES ($1, $2, $3, $4, now()) "
                "ON CONFLICT (tenant_id, user_id) DO UPDATE SET "
                "api_key = EXCLUDED.api_key, "
                "default_dataset_ids = EXCLUDED.default_dataset_ids, "
                "updated_at = now() "
                "RETURNING tenant_id, user_id, api_key, default_dataset_ids",
                tenant_id,
                uid,
                api_key,
                default_dataset_ids,
            )
            return _row_to_binding(row)
        finally:
            await conn.close()

    async def delete(self, tenant_id: str, user_id: str | None) -> bool:
        conn = await asyncpg.connect(get_settings().database_url)
        try:
            result = await conn.execute(
                "DELETE FROM ragflow_bindings WHERE tenant_id = $1 AND user_id = $2",
                tenant_id,
                _user_key(user_id),
            )
            return result.endswith("1")
        finally:
            await conn.close()


def _row_to_binding(row) -> RagflowBinding:
    uid = row["user_id"]
    return RagflowBinding(
        tenant_id=row["tenant_id"],
        user_id=uid if uid else None,
        api_key=row["api_key"],
        default_dataset_ids=list(row["default_dataset_ids"] or []),
    )
