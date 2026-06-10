from pydantic import BaseModel, Field


class WebSearchIntentOutput(BaseModel):
    use_web_search: bool = Field(
        description=(
            "True when the answer depends on current or time-sensitive public "
            "information (news, prices, weather, releases, live status). "
            "False for evergreen knowledge, coding help, general chat, or "
            "questions answerable from uploaded documents alone."
        )
    )
    reasoning: str = Field(description="One sentence explaining the decision.")
