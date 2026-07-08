from app.etl.open_food_facts import (
    OPEN_FOOD_FACTS_SOURCE_NAME,
    OpenFoodFactsClient,
    open_food_facts_product_to_food_create,
)
from app.etl.repository import ImportJobRepository
from app.etl.schemas import FoodImportItem, FoodImportResult
from app.foods.repository import FoodRepository


class OpenFoodFactsImportService:
    def __init__(
        self,
        foods: FoodRepository,
        jobs: ImportJobRepository,
        client: OpenFoodFactsClient | None = None,
    ) -> None:
        self.foods = foods
        self.jobs = jobs
        self.client = client or OpenFoodFactsClient()

    def import_by_search(self, query: str, page_size: int = 20, country: str = "br") -> FoodImportResult:
        job = self.jobs.start(
            source_name=OPEN_FOOD_FACTS_SOURCE_NAME,
            source_version="api-search",
            notes=f"query={query}; country={country}; page_size={page_size}",
        )
        items: list[FoodImportItem] = []

        try:
            products = self.client.search_products(query=query, page_size=page_size, country=country)
            for product in products:
                food_data = open_food_facts_product_to_food_create(product)
                if food_data is None or food_data.external_id is None:
                    items.append(
                        FoodImportItem(
                            external_id="unknown",
                            name="unknown",
                            status="skipped",
                            reason="missing name or external id",
                        )
                    )
                    continue

                existing = self.foods.get_by_source_external_id(OPEN_FOOD_FACTS_SOURCE_NAME, food_data.external_id)
                if existing is not None:
                    items.append(
                        FoodImportItem(
                            external_id=food_data.external_id,
                            name=existing.name,
                            status="skipped",
                            food_id=existing.id,
                            reason="already imported",
                        )
                    )
                    continue

                food = self.foods.create(food_data)
                items.append(
                    FoodImportItem(
                        external_id=food_data.external_id,
                        name=food.name,
                        status="imported",
                        food_id=food.id,
                    )
                )

            imported_count = sum(1 for item in items if item.status == "imported")
            skipped_count = sum(1 for item in items if item.status == "skipped")
            self.jobs.finish(job, "finished", notes=f"imported={imported_count}; skipped={skipped_count}")
            return FoodImportResult(
                source=OPEN_FOOD_FACTS_SOURCE_NAME,
                query=query,
                imported_count=imported_count,
                skipped_count=skipped_count,
                items=items,
            )
        except Exception as exc:
            self.jobs.log(job, "error", str(exc))
            self.jobs.finish(job, "failed", notes=str(exc))
            raise
