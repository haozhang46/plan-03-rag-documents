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


def test_settings_client_embedding_defaults():
    s = Settings(
        _env_file=None,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    assert s.expected_embedding_dimensions == 768
    assert s.client_embedding_mode is False


def test_settings_deepseek_defaults():
    s = Settings(
        _env_file=None,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    assert s.deepseek_base_url == "https://api.deepseek.com/v1"
    assert s.default_llm_provider == "openai"
