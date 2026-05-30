import re
import subprocess
import sys
import tempfile
from pathlib import Path

_TIMEOUT_SECONDS = 5

_UNSAFE_PATTERNS = (
    re.compile(r"\bos\.system\b"),
    re.compile(r"\bsubprocess\b"),
    re.compile(r"\b__import__\s*\("),
    re.compile(r"\beval\s*\("),
    re.compile(r"\bexec\s*\("),
    re.compile(r"open\s*\([^)]*['\"]w"),
    re.compile(r"open\s*\([^)]*['\"]a"),
    re.compile(r"open\s*\([^)]*['\"][wa][^'\"]*['\"]"),
)


def _check_safety(code: str) -> str | None:
    for pattern in _UNSAFE_PATTERNS:
        if pattern.search(code):
            return f"unsafe code rejected: matched {pattern.pattern}"
    return None


def run_python(code: str) -> dict:
    safety_error = _check_safety(code)
    if safety_error:
        return {
            "stdout": "",
            "stderr": "",
            "exit_code": 1,
            "error": safety_error,
        }

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".py", delete=False, encoding="utf-8"
    ) as f:
        f.write(code)
        script_path = Path(f.name)

    try:
        proc = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=_TIMEOUT_SECONDS,
        )
        result: dict = {
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "exit_code": proc.returncode,
        }
        if proc.returncode != 0:
            result["error"] = proc.stderr.strip() or f"exit code {proc.returncode}"
        return result
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "",
            "exit_code": 124,
            "error": f"execution timed out after {_TIMEOUT_SECONDS}s",
        }
    finally:
        script_path.unlink(missing_ok=True)
