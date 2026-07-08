from decimal import Decimal

from app.assessment.models import Bioimpedance, PhysicalAssessment
from app.assessment.repository import AssessmentRepository
from app.assessment.schemas import BioimpedanceCreate, PhysicalAssessmentCreate
from app.assessment.service import AssessmentService
from app.clinical.models import Anamnesis
from app.clinical.repository import AnamnesisRepository
from app.clinical.schemas import AnamnesisCreate
from app.clinical.service import AnamnesisService
from app.core.database import SessionLocal
from app.diary.models import FoodDiaryEntry
from app.diary.repository import DiaryRepository
from app.diary.schemas import FoodDiaryEntryCreate
from app.diary.service import DiaryService
from app.patients.models import Patient
from app.patients.repository import PatientRepository
from app.patients.schemas import PatientCreate
from app.plans.models import MealPlan, MealPlanItem, MealPlanMeal
from app.plans.repository import MealPlanRepository
from app.plans.schemas import MealPlanCreate, MealPlanItemCreate, MealPlanMealCreate, REQUIRED_MEALS
from app.plans.service import MealPlanService


def main() -> None:
    db = SessionLocal()
    patient_id: int | None = None
    plan_id: int | None = None
    try:
        db.query(Patient).filter(Patient.full_name == "Paciente Integracao SmartDiet").delete(
            synchronize_session=False
        )
        db.commit()

        patients = PatientRepository(db)
        plans = MealPlanRepository(db)
        service = MealPlanService(plans, patients)
        assessments = AssessmentService(AssessmentRepository(db), patients)
        anamnesis_service = AnamnesisService(AnamnesisRepository(db), patients)
        diary_service = DiaryService(DiaryRepository(db), patients)

        patient = patients.create(
            PatientCreate(
                full_name="Paciente Integracao SmartDiet",
                gender="Feminino",
                notes="Registro temporario de verificacao do banco real.",
            )
        )
        patient_id = patient.id
        plan = service.create_plan(
            patient.id,
            MealPlanCreate(
                title="Plano integracao real",
                target_kcal=Decimal("1800"),
                target_protein_g=Decimal("120"),
                target_carbs_g=Decimal("200"),
                target_fat_g=Decimal("55"),
                meals=[
                    MealPlanMealCreate(
                        meal_type=meal,
                        notes=f"Notas de {meal}",
                        items=[
                            MealPlanItemCreate(
                                quantity=Decimal("100"),
                                unit="g",
                                grams=Decimal("100"),
                                notes=f"TACO local: item de {meal}",
                            )
                        ],
                    )
                    for meal in REQUIRED_MEALS
                ],
            ),
        )
        plan_id = plan.id
        loaded = service.get_plan(plan.id)
        assessment = assessments.create_physical(
            patient.id,
            PhysicalAssessmentCreate(
                date="2026-07-07",
                weight_kg=Decimal("70"),
                height_cm=Decimal("165"),
                notes="Avaliacao temporaria de verificacao.",
            ),
        )
        bioimpedance = assessments.create_bioimpedance(
            patient.id,
            BioimpedanceCreate(
                date="2026-07-07",
                body_fat_percent=Decimal("25.5"),
                lean_mass_kg=Decimal("52"),
                notes="Bioimpedancia temporaria de verificacao.",
            ),
        )
        anamnesis = anamnesis_service.create_or_replace(
            patient.id,
            AnamnesisCreate(
                main_goal="Verificar persistencia real",
                clinical_history="Sem historico relevante para teste.",
                food_restrictions="Sem restricoes no teste.",
            ),
        )
        diary = diary_service.create(
            patient.id,
            FoodDiaryEntryCreate(
                date="2026-07-07",
                meal_type="Almoco",
                quantity=Decimal("1"),
                grams=Decimal("100"),
                notes="Diario textual temporario.",
            ),
        )
        item_count = sum(len(meal.items) for meal in loaded.meals)
        assert loaded.patient_id == patient.id
        assert len(loaded.meals) == len(REQUIRED_MEALS)
        assert item_count == len(REQUIRED_MEALS)
        assert assessment.bmi == Decimal("25.71")
        assert bioimpedance.patient_id == patient.id
        assert anamnesis.patient_id == patient.id
        assert diary.patient_id == patient.id
        print(
            f"OK real DB: patient_id={patient.id}, plan_id={loaded.id}, "
            f"meals={len(loaded.meals)}, items={item_count}, assessment_id={assessment.id}, "
            f"bioimpedance_id={bioimpedance.id}, anamnesis_id={anamnesis.id}, diary_id={diary.id}"
        )
    finally:
        db.rollback()
        if patient_id is not None:
            db.query(FoodDiaryEntry).filter(FoodDiaryEntry.patient_id == patient_id).delete(synchronize_session=False)
            db.query(Bioimpedance).filter(Bioimpedance.patient_id == patient_id).delete(synchronize_session=False)
            db.query(PhysicalAssessment).filter(PhysicalAssessment.patient_id == patient_id).delete(
                synchronize_session=False
            )
            db.query(Anamnesis).filter(Anamnesis.patient_id == patient_id).delete(synchronize_session=False)
            db.commit()
        if plan_id is not None:
            meal_ids = [
                item.id
                for item in db.query(MealPlanMeal).filter(MealPlanMeal.plan_id == plan_id).all()
            ]
            if meal_ids:
                db.query(MealPlanItem).filter(MealPlanItem.meal_id.in_(meal_ids)).delete(synchronize_session=False)
                db.query(MealPlanMeal).filter(MealPlanMeal.plan_id == plan_id).delete(synchronize_session=False)
            db.query(MealPlan).filter(MealPlan.id == plan_id).delete(synchronize_session=False)
            db.commit()
        if patient_id is not None:
            db.query(Patient).filter(Patient.id == patient_id).delete(synchronize_session=False)
            db.commit()
        db.close()


if __name__ == "__main__":
    main()
