from pydantic import BaseModel, Field


class OpenFoodFactsImportRequest(BaseModel):
    query: str = Field(min_length=2, max_length=120)
    page_size: int = Field(default=20, ge=1, le=100)
    country: str = Field(default="br", min_length=2, max_length=20)


class FoodImportItem(BaseModel):
    external_id: str
    name: str
    status: str
    food_id: int | None = None
    reason: str | None = None


class FoodImportResult(BaseModel):
    source: str
    query: str
    imported_count: int
    skipped_count: int
    items: list[FoodImportItem]
