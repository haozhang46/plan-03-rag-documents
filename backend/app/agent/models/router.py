from typing import Literal

from pydantic import BaseModel, Field

NextAgent = Literal["rag", "chat", "code", "websearch"]


class RouterOutput(BaseModel):
    next_agent: NextAgent = Field(
        description=(
            "Use rag when user question needs uploaded documents; "
            "code when user wants Python executed or a calculation run; "
            "websearch when user needs current/real-time web info, news, or facts not in documents; "
            "otherwise chat."
        )
    )
    reasoning: str = Field(description="One sentence explaining the routing decision.")
