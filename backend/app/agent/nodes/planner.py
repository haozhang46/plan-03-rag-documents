from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.models.router import RouterOutput
from app.agent.routing import heuristic_next_agent
from app.agent.state import AgentState
from app.llm.factory import get_chat_model
from app.observability.langfuse import get_langfuse_client
from app.skills.registry import SkillRegistry


def _planner_system_prompt(state: AgentState) -> str:
    skills = SkillRegistry().list_l1()
    skill_lines = "\n".join(
        f"- {s.name} ({s.skill_type}): {s.description}" for s in skills
    )
    doc_ids = state.get("document_ids") or []
    return (
        "You are the routing planner for an agent platform.\n"
        "Choose next_agent:\n"
        "- rag: user question requires content from uploaded documents AND document_ids are present.\n"
        "- code: user wants Python code executed, calculations run, or numeric/script output.\n"
        "- chat: general conversation, coding help without execution, or no documents attached.\n"
        "Never choose rag if document_ids is empty.\n\n"
        f"document_ids present: {bool(doc_ids)} ({len(doc_ids)} ids)\n\n"
        f"Available skills (metadata only):\n{skill_lines}\n"
    )


def planner_node(state: AgentState) -> dict:
    if state.get("rag_completed") or state.get("citations"):
        return {
            "next_agent": "chat",
            "planner_reason": "rag already completed; routing to chat",
        }

    if state.get("code_completed"):
        return {
            "next_agent": "chat",
            "planner_reason": "code already completed; routing to chat",
        }

    client = get_langfuse_client()

    def _run() -> dict:
        try:
            llm = get_chat_model()
            structured = llm.with_structured_output(RouterOutput)
            sys_msg = SystemMessage(content=_planner_system_prompt(state))
            last_human = next(
                m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
            )
            result: RouterOutput = structured.invoke([sys_msg, last_human])
            next_agent = result.next_agent
            if not (state.get("document_ids") or []) and next_agent == "rag":
                next_agent = "chat"
            return {
                "next_agent": next_agent,
                "planner_reason": result.reasoning,
            }
        except Exception as exc:
            next_agent = heuristic_next_agent(state)
            return {
                "next_agent": next_agent,
                "planner_reason": f"fallback ({exc.__class__.__name__}): heuristic={next_agent}",
            }

    if not client:
        return _run()
    with client.start_as_current_observation(name="planner.route") as span:
        result = _run()
        span.update(
            metadata={
                "next_agent": result.get("next_agent"),
                "planner_reason": result.get("planner_reason"),
            }
        )
        return result
