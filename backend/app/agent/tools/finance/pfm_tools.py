from langchain_core.tools import StructuredTool

from app.integrations.pfm_client import pfm_get, pfm_post


def build_finance_tools(access_token: str) -> list[StructuredTool]:
    def search_ledger(q: str = "", start_date: str | None = None, end_date: str | None = None) -> str:
        params: dict[str, str | int] = {"limit": 20}
        if q:
            params["q"] = q
        if start_date:
            params["startDate"] = start_date
        if end_date:
            params["endDate"] = end_date
        return str(pfm_get("/internal/v1/ledger/search", access_token, params))

    def get_daily_stats(date: str) -> str:
        return str(pfm_get("/internal/v1/analytics/daily", access_token, {"date": date}))

    def get_finance_context(start_date: str, end_date: str) -> str:
        return str(
            pfm_get(
                "/internal/v1/finance-context",
                access_token,
                {"startDate": start_date, "endDate": end_date},
            )
        )

    def create_ledger_entry(
        entry_date: str,
        entry_type: str,
        amount: str,
        category: str,
        merchant_name: str = "",
        payment_channel: str = "",
        note: str = "",
    ) -> str:
        payload = {
            "entryDate": entry_date,
            "entryType": entry_type,
            "amount": amount,
            "category": category,
            "merchantName": merchant_name or None,
            "paymentChannel": payment_channel or None,
            "note": note or None,
        }
        return str(pfm_post("/internal/v1/ledger/entries", access_token, payload))

    return [
        StructuredTool.from_function(
            func=search_ledger,
            name="search_ledger",
            description="Search ledger entries by keyword and optional date range.",
        ),
        StructuredTool.from_function(
            func=get_daily_stats,
            name="get_daily_stats",
            description="Get daily income, expense, and top categories for a date (YYYY-MM-DD).",
        ),
        StructuredTool.from_function(
            func=get_finance_context,
            name="get_finance_context",
            description="Get period finance summary between start_date and end_date (YYYY-MM-DD).",
        ),
        StructuredTool.from_function(
            func=create_ledger_entry,
            name="create_ledger_entry",
            description="Create a manual ledger entry for the current user.",
        ),
    ]
