from app.config import Settings


def test_settings_defaults():
    s = Settings(
        _env_file=None,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    assert s.app_name == "agent-flow"
    assert "postgresql" in s.database_url
