from pathlib import Path

from app.config import Settings


def test_settings_defaults():
    s = Settings(
        _env_file=None,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    assert s.app_name == "agent-flow"
    assert "postgresql" in s.database_url


def test_settings_skills_root_points_at_repo_skills():
    s = Settings(_env_file=None, openai_api_key=None, anthropic_api_key=None)
    root = Path(s.skills_root)
    assert root.name == "skills"
    assert (root / "registry.yaml").is_file()
