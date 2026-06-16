from langchain_core.tools import tool

from app.agent.tools.desktop.executor_client import ExecutorError, call_executor


@tool
def read_file(path: str) -> str:
    """Read a UTF-8 text file relative to the workspace root."""
    try:
        return call_executor("read_file", {"path": path})
    except ExecutorError as exc:
        return f"error: {exc}"


@tool
def list_dir(path: str = ".") -> str:
    """List files and directories under a workspace-relative path."""
    try:
        return call_executor("list_dir", {"path": path})
    except ExecutorError as exc:
        return f"error: {exc}"


@tool
def git_status() -> str:
    """Show git status for the workspace repository."""
    try:
        return call_executor("git_status", {})
    except ExecutorError as exc:
        return f"error: {exc}"


@tool
def git_diff(path: str = "") -> str:
    """Show git diff for the whole repo or a specific path."""
    try:
        return call_executor("git_diff", {"path": path})
    except ExecutorError as exc:
        return f"error: {exc}"


@tool
def run_shell(command: str) -> str:
    """Run a shell command in the workspace directory. Use for build/test commands."""
    try:
        return call_executor("run_shell", {"command": command})
    except ExecutorError as exc:
        return f"error: {exc}"


def build_desktop_tools() -> list:
    return [read_file, list_dir, git_status, git_diff, run_shell]
