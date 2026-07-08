from __future__ import annotations

import argparse
import html
import json
import re
import time
import unicodedata
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import urljoin
from urllib.request import Request, urlopen


BASE_URL = "http://www.tbca.net.br/base-dados/"
LIST_URL = urljoin(BASE_URL, "composicao_alimentos.php")
USER_AGENT = "SmartDiet educational importer (+local research use)"

NUTRIENT_CODES = {
    "Energia|kcal": "kcal",
    "Proteína|g": "protein",
    "Proteina|g": "protein",
    "Carboidrato total|g": "carbs",
    "Lipídios|g": "fat",
    "Lipidios|g": "fat",
    "Fibra alimentar|g": "fiber",
    "Sódio|mg": "sodium",
    "Sodio|mg": "sodium",
}


@dataclass
class TbcaFoodSummary:
    code: str
    name: str
    scientific_name: str
    category: str
    detail_url: str


def fetch(url: str, *, retries: int = 3) -> str:
    last_error: Exception | None = None
    for _ in range(retries):
        try:
            request = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(request, timeout=30) as response:
                raw = response.read()
            return raw.decode("utf-8", errors="replace")
        except Exception as exc:  # pragma: no cover - network resilience
            last_error = exc
            time.sleep(1)
    raise RuntimeError(f"Failed to fetch {url}: {last_error}")


def clean_text(value: str) -> str:
    without_tags = re.sub(r"<[^>]+>", "", value)
    return html.unescape(without_tags).replace("\xa0", " ").strip()


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.lower())
    return "".join(char for char in normalized if not unicodedata.combining(char))


def parse_number(value: str) -> str | None:
    clean = clean_text(value).strip()
    if not clean or clean.upper() in {"NA", "N/A", "-", ""}:
        return None
    if clean.lower() == "tr":
        return "0"
    clean = clean.replace(".", "").replace(",", ".")
    try:
        return str(Decimal(clean))
    except InvalidOperation:
        return None


def extract_rows(page_html: str) -> list[TbcaFoodSummary]:
    rows: list[TbcaFoodSummary] = []
    row_pattern = re.compile(r"<tr>(.*?)</tr>", re.IGNORECASE | re.DOTALL)
    cell_pattern = re.compile(r"<td>(.*?)</td>", re.IGNORECASE | re.DOTALL)
    href_pattern = re.compile(r"href='([^']+)'", re.IGNORECASE)

    for row_match in row_pattern.finditer(page_html):
        cells = cell_pattern.findall(row_match.group(1))
        if len(cells) < 4:
            continue
        href_match = href_pattern.search(cells[0])
        code = clean_text(cells[0])
        if not href_match or not code.startswith("BRC"):
            continue
        rows.append(
            TbcaFoodSummary(
                code=code,
                name=clean_text(cells[1]),
                scientific_name=clean_text(cells[2]),
                category=clean_text(cells[3]),
                detail_url=urljoin(BASE_URL, href_match.group(1)),
            )
        )
    return rows


def page_url(page: int) -> str:
    if page <= 1:
        return LIST_URL
    group = ((page - 1) // 10) + 1
    return f"{LIST_URL}?pagina={page}&atuald={group}"


def collect_summaries(max_pages: int) -> list[TbcaFoodSummary]:
    foods: list[TbcaFoodSummary] = []
    seen_codes: set[str] = set()
    empty_pages = 0

    for page in range(1, max_pages + 1):
        page_html = fetch(page_url(page))
        rows = extract_rows(page_html)
        new_rows = [row for row in rows if row.code not in seen_codes]
        if not new_rows:
            empty_pages += 1
            if empty_pages >= 2:
                break
        else:
            empty_pages = 0
        for row in new_rows:
            seen_codes.add(row.code)
            foods.append(row)
        time.sleep(0.15)
    return foods


def parse_detail(summary: TbcaFoodSummary) -> dict:
    detail_html = fetch(summary.detail_url)
    nutrients: dict[str, str | None] = {}
    row_pattern = re.compile(r"<tr>(.*?)</tr>", re.IGNORECASE | re.DOTALL)
    cell_pattern = re.compile(r"<td>(.*?)</td>", re.IGNORECASE | re.DOTALL)

    for row_match in row_pattern.finditer(detail_html):
        cells = cell_pattern.findall(row_match.group(1))
        if len(cells) < 3:
            continue
        component = clean_text(cells[0])
        unit = clean_text(cells[1])
        value = parse_number(cells[2])
        key = f"{component}|{unit}"
        code = NUTRIENT_CODES.get(key)
        if code:
            nutrients[code] = value

    return {
        "id": f"tbca-{summary.code.lower()}",
        "tbca_code": summary.code,
        "name": summary.name,
        "scientific_name": summary.scientific_name or None,
        "category": summary.category,
        "source": "TBCA",
        "kcal": nutrients.get("kcal"),
        "protein": nutrients.get("protein"),
        "carbs": nutrients.get("carbs"),
        "fat": nutrients.get("fat"),
        "fiber": nutrients.get("fiber"),
        "sodium": nutrients.get("sodium"),
        "detail_url": summary.detail_url,
    }


def write_outputs(foods: list[dict], output_json: Path, output_py: Path) -> None:
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(foods, ensure_ascii=False, indent=2), encoding="utf-8")

    py_payload = json.dumps(foods, ensure_ascii=False, indent=2)
    output_py.write_text(
        "from decimal import Decimal\n\n\n"
        "def _d(value: str | None) -> Decimal | None:\n"
        "    return Decimal(value) if value is not None else None\n\n\n"
        "TBCA_FOODS = [\n"
        + ",\n".join(_python_food(item) for item in foods)
        + "\n]\n",
        encoding="utf-8",
    )


def _python_food(item: dict) -> str:
    fields = {
        "id": item["id"],
        "taco_code": int(re.sub(r"\D", "", item["tbca_code"]) or "0"),
        "tbca_code": item["tbca_code"],
        "name": item["name"],
        "scientific_name": item["scientific_name"],
        "category": item["category"],
        "source": item["source"],
        "kcal": item["kcal"],
        "protein": item["protein"],
        "carbs": item["carbs"],
        "fat": item["fat"],
        "fiber": item["fiber"],
        "sodium": item["sodium"],
        "detail_url": item["detail_url"],
    }
    lines = ["    {"]
    for key, value in fields.items():
        if key in {"kcal", "protein", "carbs", "fat", "fiber", "sodium"}:
            lines.append(f'        "{key}": _d({value!r}),')
        else:
            lines.append(f'        "{key}": {value!r},')
    lines.append("    }")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch public TBCA food composition pages.")
    parser.add_argument("--max-pages", type=int, default=3)
    parser.add_argument("--max-foods", type=int, default=100)
    parser.add_argument("--delay", type=float, default=0.2)
    parser.add_argument("--output-json", default="data/tbca_public_foods.json")
    parser.add_argument("--output-py", default="app/foods/tbca_data.py")
    args = parser.parse_args()

    summaries = collect_summaries(args.max_pages)
    selected = summaries[: args.max_foods]
    foods: list[dict] = []
    for index, summary in enumerate(selected, start=1):
        foods.append(parse_detail(summary))
        print(f"{index}/{len(selected)} {summary.code} {summary.name}")
        time.sleep(args.delay)

    write_outputs(foods, Path(args.output_json), Path(args.output_py))
    print(f"Wrote {len(foods)} TBCA foods to {args.output_json} and {args.output_py}")


if __name__ == "__main__":
    main()
