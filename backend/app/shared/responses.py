from typing import Generic, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    data: DataT | None = None
    meta: dict[str, object] = Field(default_factory=dict)
    errors: list[dict[str, object]] = Field(default_factory=list)
