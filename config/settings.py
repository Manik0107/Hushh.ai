from __future__ import annotations

import itertools
import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    gemini_model: str = "gemini-2.5-flash"
    embedding_model: str = "gemini-embedding-001"

    db_host: str = field(default_factory=lambda: os.getenv("DB_HOST", "localhost"))
    db_port: int = field(default_factory=lambda: int(os.getenv("DB_PORT", "5532")))
    db_name: str = field(default_factory=lambda: os.getenv("DB_NAME", "ai"))
    db_user: str = field(default_factory=lambda: os.getenv("DB_USER", "ai"))
    db_password: str = field(default_factory=lambda: os.getenv("DB_PASSWORD", "ai"))
    db_table: str = field(default_factory=lambda: os.getenv("DB_TABLE", "pdf_knowledge"))

    pdf_dir: Path = field(
        default_factory=lambda: _ROOT / os.getenv("PDF_DIR", "data/pdfs")
    )

    @property
    def db_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def google_api_keys(self) -> list[str]:
        keys = []
        for i in range(1, 20):
            val = os.getenv(f"GOOGLE_API_KEY_{i}")
            if val:
                keys.append(val)
        
        # Fallback to single key
        if not keys:
            val = os.getenv("GOOGLE_API_KEY")
            if val:
                keys.append(val)
                
        if not keys:
            raise EnvironmentError(
                "No GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc. variables found. "
                "Please add them to your .env file."
            )
        return keys


def _require(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            "Copy .env.example to .env and fill in your values."
        )
    return value


settings = Settings()

_key_cycle = None

def get_next_google_api_key() -> str:
    global _key_cycle
    if _key_cycle is None:
        _key_cycle = itertools.cycle(settings.google_api_keys)
    return next(_key_cycle)
