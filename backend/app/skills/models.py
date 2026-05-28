from enum import Enum

from pydantic import BaseModel, Field


class SkillType(str, Enum):
    instruction = "instruction"
    workflow = "workflow"
    resource = "resource"


class SkillMeta(BaseModel):
    name: str
    description: str
    skill_type: SkillType = SkillType.instruction
    spawn_subagent: bool = False
    path: str
    triggers: list[str] = Field(default_factory=list)
