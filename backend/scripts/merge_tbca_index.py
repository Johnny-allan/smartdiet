from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from fetch_tbca_public import collect_summaries, write_outputs


def main() -> None:
    backend_root = Path(__file__).resolve().parents[1]
    detailed_path = backend_root / "data" / "tbca_public_foods.json"
    detailed = json.loads(detailed_path.read_text(encoding="utf-8")) if detailed_path.exists() else []
    detailed_by_code = {food["tbca_code"]: food for food in detailed}

    summaries = collect_summaries(80)
    foods = []
    for summary in summaries:
        if summary.code in detailed_by_code:
            foods.append(detailed_by_code[summary.code])
            continue
        foods.append(
            {
                "id": f"tbca-{summary.code.lower()}",
                "tbca_code": summary.code,
                "name": summary.name,
                "scientific_name": summary.scientific_name or None,
                "category": summary.category,
                "source": "TBCA",
                "kcal": None,
                "protein": None,
                "carbs": None,
                "fat": None,
                "fiber": None,
                "sodium": None,
                "detail_url": summary.detail_url,
            }
        )

    write_outputs(foods, detailed_path, backend_root / "app" / "foods" / "tbca_data.py")
    print(f"Wrote TBCA index with {len(foods)} foods; detailed nutrients for {len(detailed_by_code)} foods.")


if __name__ == "__main__":
    main()
