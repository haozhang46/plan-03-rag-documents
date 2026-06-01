from pydantic import BaseModel, Field


class ReviewOutput(BaseModel):
    passed: bool = Field(description="True when all checklist items pass.")
    feedback: str = Field(
        description="Actionable feedback for the planner when passed is False."
    )
    checklist: list[str] = Field(
        description="Spec checklist items with pass/fail status."
    )
