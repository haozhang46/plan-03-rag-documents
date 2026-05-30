from typing import Literal

from pydantic import BaseModel, Field

NextAgent = Literal["rag", "chat"]


class RouterOutput(BaseModel):
    next_agent: NextAgent = Field(
        description="Use rag when user question needs uploaded documents; otherwise chat."
    )
    reasoning: str = Field(description="One sentence explaining the routing decision.")
