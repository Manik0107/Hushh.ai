from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    google_api_key: str = field(default_factory=lambda: _require("GOOGLE_API_KEY"))
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


def _require(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            "Copy .env.example to .env and fill in your values."
        )
    return value


settings = Settings()
