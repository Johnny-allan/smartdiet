from types import SimpleNamespace

import pytest

from app.clinical.schemas import AnamnesisCreate, PatientGoalCreate, PatientGoalUpdate
from app.clinical.service import AnamnesisService, PatientGoalService
from app.core.exceptions import NotFoundError


class FakePatients:
    def __init__(self, existing_ids: set[int]) -> None:
        self.existing_ids = existing_ids

    def get(self, patient_id: int) -> object | None:
        return object() if patient_id in self.existing_ids else None


class FakeAnamnesisRepository:
    def __init__(self) -> None:
        self.saved: tuple[int, AnamnesisCreate] | None = None

    def get_by_patient(self, patient_id: int) -> object | None:
        return None

    def create_or_replace(self, patient_id: int, data: AnamnesisCreate) -> object:
        self.saved = (patient_id, data)
        return SimpleNamespace(patient_id=patient_id, **data.model_dump())


class FakeGoalRepository:
    def __init__(self) -> None:
        self.goals = {
            10: SimpleNamespace(
                id=10,
                patient_id=1,
                focus="Peso",
                metric="kg",
                metric_type="body_weight",
                unit="kg",
                direction="decrease",
                baseline_value="84",
                current_value="80",
                target_value="76",
                status="Em progresso",
                notes=None,
            )
        }

    def list_by_patient(self, patient_id: int) -> list[object]:
        return [goal for goal in self.goals.values() if goal.patient_id == patient_id]

    def get(self, goal_id: int) -> object | None:
        return self.goals.get(goal_id)

    def replace_for_patient(self, patient_id: int, goals: list[PatientGoalCreate]) -> list[object]:
        self.goals = {
            index: SimpleNamespace(id=index, patient_id=patient_id, **goal.model_dump())
            for index, goal in enumerate(goals, start=1)
        }
        return self.list_by_patient(patient_id)

    def update(self, goal: object, data: PatientGoalUpdate) -> object:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(goal, field, value)
        return goal


def test_anamnesis_persists_guided_suggestions() -> None:
    repository = FakeAnamnesisRepository()
    service = AnamnesisService(repository, FakePatients({1}))  # type: ignore[arg-type]

    result = service.create_or_replace(
        1,
        AnamnesisCreate(
            main_goal="Ganho de massa",
            objective_type="performance",
            suggested_strategy=["Aumentar proteina"],
            suggested_meals={"Almoco": "Proteina, arroz, feijao e legumes"},
            suggested_goals=[{"focus": "Proteina", "target_value": "130 g"}],
        ),
    )

    assert result.objective_type == "performance"
    assert result.suggested_meals["Almoco"].startswith("Proteina")
    assert repository.saved is not None


def test_goal_update_is_scoped_to_patient() -> None:
    service = PatientGoalService(FakeGoalRepository(), FakePatients({1, 2}))  # type: ignore[arg-type]

    updated = service.update_goal(1, 10, PatientGoalUpdate(status="Batida", current_value="76.5"))

    assert updated.status == "Batida"
    assert updated.direction == "decrease"
    assert updated.current_value == "76.5"
    with pytest.raises(NotFoundError):
        service.update_goal(2, 10, PatientGoalUpdate(status="Batida"))


def test_goal_create_accepts_structured_metric_fields() -> None:
    goal = PatientGoalCreate(
        focus="Aderencia",
        metric="Dias completos",
        metric_type="adherence",
        unit="dias/semana",
        direction="increase",
        baseline_value="3",
        current_value="4",
        target_value="6",
    )

    assert goal.metric_type == "adherence"
    assert goal.unit == "dias/semana"
    assert goal.direction == "increase"
    assert goal.baseline_value == "3"
