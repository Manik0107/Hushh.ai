from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from config.settings import settings

router = APIRouter(prefix="/materials", tags=["Materials"])


class MaterialResponse(BaseModel):
    materials: dict[str, dict[str, list[dict[str, Any]]]]


@router.get("", response_model=MaterialResponse)
async def get_materials() -> MaterialResponse:
    materials: dict[str, dict[str, list[dict[str, Any]]]] = {}

    if not settings.pdf_dir.exists():
        return MaterialResponse(materials=materials)

    for pdf_path in settings.pdf_dir.glob("*.pdf"):
        filename = pdf_path.name
        
        parts = filename.replace(".pdf", "").split("__")

        if len(parts) == 2:
            subject = parts[0].replace("_", " ").title()
            unit = parts[1].replace("_", " ").title()
        else:
            subject = "General"
            unit = "Uncategorized"

        file_info = {
            "id": filename,
            "name": filename.replace("__", " - ").replace("_", " "),
            "type": "pdf",
            "teacher": "Uploaded Resource",
        }

        if subject not in materials:
            materials[subject] = {}
        if unit not in materials[subject]:
            materials[subject][unit] = []

        materials[subject][unit].append(file_info)

    return MaterialResponse(materials=materials)
