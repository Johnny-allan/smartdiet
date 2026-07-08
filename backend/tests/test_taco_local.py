from fastapi.testclient import TestClient

from app.foods.brazilian_tables import search_brazilian_foods
from app.foods.taco_local import search_taco_foods
from app.main import create_app


def test_taco_local_search_returns_brazilian_food_with_macros() -> None:
    results = search_taco_foods("arroz integral cozido")

    assert results
    assert results[0].source == "TACO 4a edicao"
    assert results[0].kcal is not None
    assert results[0].carbs is not None


def test_brazilian_foods_endpoint_uses_brazilian_tables() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/foods/brazilian/search", params={"q": "banana"})

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload
    assert payload[0]["source"] == "TBCA"


def test_brazilian_foods_search_includes_tbca_educational_table() -> None:
    results = search_brazilian_foods("banana prata", 10)

    assert any(food.source == "TBCA" for food in results)
