from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass(frozen=True)
class FlowSpec:
    flow_id: str
    title: str
    description: str
    builder: Callable[[Any], Any]
    default_skill_names: list[str] = field(default_factory=list)
