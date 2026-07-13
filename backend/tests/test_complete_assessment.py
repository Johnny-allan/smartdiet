from datetime import date
from decimal import Decimal

from app.assessment.schemas import (
    BioimpedanceCreate,
    CompleteAssessmentCreate,
    PhysicalAssessmentCreate,
)
from app.assessment.service import AssessmentService


class FakePatients:
    def get(self, patient_id: int) -> object | None:
        return object() if patient_id == 7 else None


class FakeAssessments:
    def create_complete(self, physical: object, bioimpedance: object | None) -> tuple[object, object | None]:
        return physical, bioimpedance


def test_complete_assessment_keeps_seven_skinfolds_and_bioimpedance_on_same_patient() -> None:
    service = AssessmentService(FakeAssessments(), FakePatients())  # type: ignore[arg-type]
    payload = CompleteAssessmentCreate(
        physical=PhysicalAssessmentCreate(
            date=date(2026, 7, 13),
            weight_kg=Decimal("70"),
            height_cm=Decimal("170"),
            chest_skinfold_mm=Decimal("10"),
            midaxillary_skinfold_mm=Decimal("11"),
            triceps_skinfold_mm=Decimal("12"),
            subscapular_skinfold_mm=Decimal("13"),
            abdominal_skinfold_mm=Decimal("14"),
            suprailiac_skinfold_mm=Decimal("15"),
            thigh_skinfold_mm=Decimal("16"),
        ),
        bioimpedance=BioimpedanceCreate(
            date=date(2026, 7, 13),
            body_fat_percent=Decimal("24"),
        ),
    )

    physical, bioimpedance = service.create_complete(7, payload)

    assert physical.patient_id == 7
    assert physical.bmi == Decimal("24.22")
    assert physical.thigh_skinfold_mm == Decimal("16")
    assert bioimpedance is not None
    assert bioimpedance.patient_id == 7
    assert bioimpedance.body_fat_percent == Decimal("24")
