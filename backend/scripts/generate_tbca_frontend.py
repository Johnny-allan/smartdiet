from __future__ import annotations

import json
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    source = root / "backend" / "data" / "tbca_public_foods.json"
    target = root / "frontend" / "src" / "modules" / "foods" / "tbca-foods.ts"
    foods = json.loads(source.read_text(encoding="utf-8"))
    payload = []
    for food in foods:
        payload.append(
            {
                "id": food["id"],
                "tacoCode": int("".join(char for char in food["tbca_code"] if char.isdigit()) or "0"),
                "tbcaCode": food["tbca_code"],
                "name": food["name"],
                "category": food["category"],
                "source": "TBCA",
                "kcal": _number_or_none(food.get("kcal")),
                "protein": _number_or_none(food.get("protein")),
                "carbs": _number_or_none(food.get("carbs")),
                "fat": _number_or_none(food.get("fat")),
                "fiber": _number_or_none(food.get("fiber")),
                "sodium": _number_or_none(food.get("sodium")),
            }
        )
    json_payload = json.dumps(payload, ensure_ascii=False)
    target.write_text(
        'import type { TacoFood } from "./taco-foods";\n\n'
        "export type TbcaFood = TacoFood & {\n"
        "  tbcaCode: string;\n"
        "};\n\n"
        f"const tbcaFoodsRaw = {json.dumps(json_payload, ensure_ascii=False)};\n\n"
        "export const tbcaFoods = JSON.parse(tbcaFoodsRaw) as TbcaFood[];\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(payload)} TBCA foods to {target}")


def _number_or_none(value: str | None) -> float | None:
    return float(value) if value is not None else None


if __name__ == "__main__":
    main()
