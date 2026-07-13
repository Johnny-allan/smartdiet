"""Create or refresh three synthetic patients used for report export QA."""

from __future__ import annotations

from datetime import date
from pathlib import Path
import sys
from typing import Any

from sqlalchemy import select

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.assessment.repository import AssessmentRepository
from app.assessment.schemas import (
    BioimpedanceCreate,
    BioimpedanceUpdate,
    PhysicalAssessmentCreate,
    PhysicalAssessmentUpdate,
)
from app.assessment.service import AssessmentService
from app.clinical.repository import AnamnesisRepository, PatientGoalRepository
from app.clinical.schemas import AnamnesisCreate, PatientGoalCreate
from app.clinical.service import AnamnesisService, PatientGoalService
from app.core.database import SessionLocal
from app.diary.repository import DiaryRepository
from app.diary.schemas import FoodDiaryEntryCreate, FoodDiaryEntryUpdate
from app.diary.service import DiaryService
from app.patients.models import Patient
from app.patients.repository import PatientRepository
from app.patients.schemas import PatientCreate, PatientUpdate
from app.plans.repository import MealPlanRepository
from app.plans.schemas import MealPlanCreate
from app.plans.service import MealPlanService
from app.recipes.repository import RecipeRepository
from app.recipes.schemas import RecipeCreate, RecipeUpdate


DEMO_PATIENTS: list[dict[str, Any]] = [
    {
        "patient": {
            "full_name": "Helena Costa QA",
            "birth_date": "1967-03-14",
            "gender": "Feminino",
            "email": "helena.costa.qa@example.com",
            "phone": "(11) 98881-0101",
            "status": "active",
            "notes": "Paciente sintetica. Perfil cardiovascular para validacao de relatorios.",
        },
        "anamnesis": {
            "main_goal": "Reducao do risco cardiovascular e melhora do perfil lipidico",
            "clinical_history": "Hipertensao controlada e dislipidemia em acompanhamento.",
            "family_history": "Historico familiar de doenca cardiovascular.",
            "medications": "Anti-hipertensivo conforme prescricao medica.",
            "diseases": "Hipertensao arterial e dislipidemia.",
            "sleep_quality": "Regular",
            "stress_level": "Moderado",
            "water_intake": "1,8 L/dia",
            "physical_activity": "Caminhada 4 vezes por semana.",
            "food_preferences": "Peixes, frutas, feijao, verduras e preparacoes caseiras.",
            "food_restrictions": "Reduzir sodio e carnes processadas.",
            "objective_type": "cardiovascular",
            "suggested_strategy": ["Dieta mediterranea", "Aumentar fibras", "Priorizar gorduras insaturadas"],
        },
        "assessment": {
            "date": "2026-07-10",
            "weight_kg": "78.4",
            "height_cm": "162",
            "waist_cm": "94",
            "hip_cm": "106",
            "body_fat_percent": "36.8",
            "muscle_mass_kg": "25.6",
            "notes": "Perfil demo cardiovascular; conferir evolucao de cintura e pressao.",
        },
        "bioimpedance": [
            {"date": "2026-07-10", "body_fat_percent": "36.8", "fat_mass_kg": "28.9", "lean_mass_kg": "49.5", "muscle_mass_kg": "25.6", "total_body_water_l": "36.0", "basal_metabolic_rate_kcal": "1410", "visceral_fat_level": "11", "metabolic_age": 61, "notes": "Bioimpedancia atual: reducao de gordura visceral."},
        ],
        "goals": [
            {"focus": "Circunferencia abdominal", "metric": "Cintura", "unit": "cm", "direction": "decrease", "baseline_value": "98", "current_value": "94", "target_value": "88", "status": "Em progresso", "notes": "Meta cardiovascular."},
            {"focus": "Aderencia mediterranea", "metric": "Aderencia", "unit": "%", "direction": "increase", "baseline_value": "55", "current_value": "72", "target_value": "85", "status": "Em progresso", "notes": "Acompanhar variedade vegetal semanal."},
        ],
        "recipes": [
            {
                "title": "Bowl mediterraneo da Helena",
                "description": "Arroz integral, feijao, sardinha, folhas, tomate e azeite extravirgem.",
                "preparation_method": "Montar o bowl com os ingredientes cozidos, finalizar com folhas, tomate e azeite.",
                "prep_time_minutes": 15,
                "cook_time_minutes": 25,
                "servings": 2,
                "raw_weight_g": "650",
                "cooked_weight_g": "720",
                "yield_weight_g": "720",
                "tags": ["mediterranea", "cardiovascular", "tbca"],
                "professional_notes": "Receita sintetica para validacao integral da ficha e do relatorio.",
            }
        ],
        "diary": {"date": "2026-07-11", "meal_type": "Almoco", "quantity": "1", "grams": "420", "notes": "Arroz integral, feijao, sardinha, salada e azeite. Aderencia: 82%"},
        "plan": {
            "title": "Dieta mediterranea - Helena Costa QA",
            "target_kcal": "1750",
            "target_protein_g": "95",
            "target_carbs_g": "205",
            "target_fat_g": "62",
            "notes": "Modelo mediterraneo individualizado; revisar sodio, porcoes e tolerancia.",
            "meals": [
                {"meal_type": "Cafe da manha", "time": "07:30", "notes": "Aveia, fruta e iogurte natural.", "items": [{"quantity": "40", "unit": "g", "grams": "40", "notes": "Aveia em flocos"}, {"quantity": "120", "unit": "g", "grams": "120", "notes": "Mamao"}]},
                {"meal_type": "Lanche da manha", "time": "10:30", "notes": "Fruta e oleaginosas sem sal.", "items": [{"quantity": "100", "unit": "g", "grams": "100", "notes": "Maca"}, {"quantity": "20", "unit": "g", "grams": "20", "notes": "Castanha-do-para"}]},
                {"meal_type": "Almoco", "time": "13:00", "notes": "Vegetais, leguminosa, cereal integral, peixe e azeite extravirgem.", "items": [{"quantity": "100", "unit": "g", "grams": "100", "notes": "Arroz integral cozido"}, {"quantity": "100", "unit": "g", "grams": "100", "notes": "Feijao carioca cozido"}, {"quantity": "130", "unit": "g", "grams": "130", "notes": "Sardinha assada"}, {"quantity": "8", "unit": "ml", "grams": "8", "notes": "Azeite de oliva extravirgem"}, {"quantity": "120", "unit": "g", "grams": "120", "notes": "Substituicao para Arroz integral cozido: Batata-doce cozida"}]},
                {"meal_type": "Lanche da tarde", "time": "16:30", "notes": "Homus e vegetais crus.", "items": [{"quantity": "60", "unit": "g", "grams": "60", "notes": "Homus de grao-de-bico"}]},
                {"meal_type": "Jantar", "time": "20:00", "notes": "Sopa de lentilha com legumes e folhas.", "items": [{"quantity": "160", "unit": "g", "grams": "160", "notes": "Lentilha cozida"}, {"quantity": "180", "unit": "g", "grams": "180", "notes": "Legumes variados"}]},
                {"meal_type": "Ceia", "time": "22:00", "notes": "Opcional conforme fome.", "items": [{"quantity": "170", "unit": "g", "grams": "170", "notes": "Iogurte natural"}]},
            ],
        },
    },
    {
        "patient": {
            "full_name": "Lucas Ferreira QA",
            "birth_date": "1996-11-02",
            "gender": "Masculino",
            "email": "lucas.ferreira.qa@example.com",
            "phone": "(21) 98882-0202",
            "status": "active",
            "notes": "Paciente sintetico. Perfil esportivo para validacao de relatorios.",
        },
        "anamnesis": {
            "main_goal": "Ganho de massa muscular com desempenho em treino de forca",
            "clinical_history": "Sem doencas cronicas relatadas.",
            "sleep_quality": "Boa",
            "stress_level": "Baixo",
            "water_intake": "3,2 L/dia",
            "physical_activity": "Musculacao 5 vezes por semana, treino as 18h.",
            "food_preferences": "Arroz, feijao, frango, ovos, leite, frutas e aveia.",
            "food_restrictions": "Sem restricoes alimentares relatadas.",
            "objective_type": "muscle_gain",
            "suggested_strategy": ["Superavit energetico controlado", "Proteina distribuida ao longo do dia"],
        },
        "assessment": {"date": "2026-07-09", "weight_kg": "82.6", "height_cm": "181", "waist_cm": "82", "hip_cm": "99", "body_fat_percent": "13.8", "muscle_mass_kg": "38.4", "notes": "Perfil demo esportivo; foco em ganho gradual de massa magra."},
        "bioimpedance": [
            {"date": "2026-07-09", "body_fat_percent": "13.8", "fat_mass_kg": "11.4", "lean_mass_kg": "71.2", "muscle_mass_kg": "38.4", "total_body_water_l": "51.7", "basal_metabolic_rate_kcal": "1865", "visceral_fat_level": "4", "metabolic_age": 24, "notes": "Evolucao positiva de massa magra."},
        ],
        "goals": [{"focus": "Massa muscular", "metric": "Massa muscular", "unit": "kg", "direction": "increase", "baseline_value": "36.9", "current_value": "38.4", "target_value": "40.0", "status": "Em progresso", "notes": "Evitar aumento excessivo de gordura."}],
        "recipes": [
            {
                "title": "Marmita de frango do Lucas",
                "description": "Arroz, feijao, peito de frango e legumes conforme porcoes do plano.",
                "preparation_method": "Cozinhar os alimentos separadamente, porcionar e refrigerar em recipientes individuais.",
                "prep_time_minutes": 20,
                "cook_time_minutes": 40,
                "servings": 5,
                "raw_weight_g": "2200",
                "cooked_weight_g": "2500",
                "yield_weight_g": "2500",
                "tags": ["esportivo", "marmita", "tbca"],
                "professional_notes": "Distribuir as porcoes conforme treino e meta energetica.",
            }
        ],
        "diary": {"date": "2026-07-10", "meal_type": "Lanche da tarde", "quantity": "1", "grams": "450", "notes": "Vitamina de banana, leite e aveia antes do treino. Aderencia: 90%"},
        "plan": {
            "title": "Ganho de massa magra - Lucas Ferreira QA",
            "target_kcal": "2950", "target_protein_g": "165", "target_carbs_g": "390", "target_fat_g": "82",
            "notes": "Distribuir proteina nas seis refeicoes e ajustar carboidrato ao treino das 18h.",
            "meals": [
                {"meal_type": "Cafe da manha", "time": "07:00", "notes": "Cafe da manha proteico.", "items": [{"quantity": "100", "unit": "g", "grams": "100", "notes": "Ovos mexidos"}, {"quantity": "80", "unit": "g", "grams": "80", "notes": "Pao integral"}]},
                {"meal_type": "Lanche da manha", "time": "10:00", "notes": "Lanche de facil transporte.", "items": [{"quantity": "170", "unit": "g", "grams": "170", "notes": "Iogurte natural"}, {"quantity": "100", "unit": "g", "grams": "100", "notes": "Banana"}]},
                {"meal_type": "Almoco", "time": "12:30", "notes": "Refeicao completa para sustentar o treino.", "items": [{"quantity": "180", "unit": "g", "grams": "180", "notes": "Arroz branco cozido"}, {"quantity": "120", "unit": "g", "grams": "120", "notes": "Feijao preto cozido"}, {"quantity": "180", "unit": "g", "grams": "180", "notes": "Peito de frango grelhado"}]},
                {"meal_type": "Lanche da tarde", "time": "16:30", "notes": "Pre-treino rico em carboidrato e proteina.", "items": [{"quantity": "250", "unit": "ml", "grams": "250", "notes": "Leite integral"}, {"quantity": "120", "unit": "g", "grams": "120", "notes": "Banana"}, {"quantity": "40", "unit": "g", "grams": "40", "notes": "Aveia em flocos"}]},
                {"meal_type": "Jantar", "time": "20:15", "notes": "Pos-treino.", "items": [{"quantity": "200", "unit": "g", "grams": "200", "notes": "Batata-doce cozida"}, {"quantity": "170", "unit": "g", "grams": "170", "notes": "Carne bovina magra"}]},
                {"meal_type": "Ceia", "time": "22:30", "notes": "Completar proteina diaria.", "items": [{"quantity": "200", "unit": "g", "grams": "200", "notes": "Iogurte proteico"}]},
            ],
        },
    },
    {
        "patient": {
            "full_name": "Renata Alves QA",
            "birth_date": "1983-08-21",
            "gender": "Feminino",
            "email": "renata.alves.qa@example.com",
            "phone": "(31) 98883-0303",
            "status": "active",
            "notes": "Paciente sintetica. Perfil vegetariano com controle glicemico.",
        },
        "anamnesis": {
            "main_goal": "Controle glicemico e reducao de gordura corporal com dieta vegetariana",
            "clinical_history": "Resistencia insulinica em acompanhamento multiprofissional.",
            "family_history": "Diabetes tipo 2 em familiares de primeiro grau.",
            "intolerances": "Desconforto com grandes volumes de leite.",
            "sleep_quality": "Regular",
            "stress_level": "Alto",
            "water_intake": "2,1 L/dia",
            "physical_activity": "Pilates 2 vezes e caminhada 3 vezes por semana.",
            "food_preferences": "Leguminosas, ovos, tofu, verduras e frutas citricas.",
            "food_restrictions": "Vegetariana ovolactea; evitar carnes e sucos acucarados.",
            "objective_type": "glycemic_control",
            "suggested_strategy": ["Distribuir carboidratos", "Associar fibras e proteinas", "Padrao vegetariano"],
        },
        "assessment": {"date": "2026-07-08", "weight_kg": "71.2", "height_cm": "158", "waist_cm": "89", "hip_cm": "103", "body_fat_percent": "34.2", "muscle_mass_kg": "24.1", "notes": "Perfil demo vegetariano; monitorar cintura e marcadores glicemicos."},
        "bioimpedance": [
            {"date": "2026-07-08", "body_fat_percent": "34.2", "fat_mass_kg": "24.4", "lean_mass_kg": "46.8", "muscle_mass_kg": "24.1", "total_body_water_l": "34.1", "basal_metabolic_rate_kcal": "1335", "visceral_fat_level": "8", "metabolic_age": 47, "notes": "Reducao gradual de gordura corporal."},
        ],
        "goals": [{"focus": "Controle glicemico", "metric": "Aderencia alimentar", "unit": "%", "direction": "increase", "baseline_value": "50", "current_value": "76", "target_value": "85", "status": "Em progresso", "notes": "Evitar bebidas acucaradas e distribuir carboidratos."}],
        "recipes": [
            {
                "title": "Ensopado vegetariano da Renata",
                "description": "Lentilha, tofu, abobrinha, cenoura, tomate e temperos naturais.",
                "preparation_method": "Refogar os vegetais, juntar a lentilha cozida e finalizar com o tofu grelhado.",
                "prep_time_minutes": 18,
                "cook_time_minutes": 30,
                "servings": 4,
                "raw_weight_g": "1200",
                "cooked_weight_g": "1450",
                "yield_weight_g": "1450",
                "tags": ["vegetariana", "controle glicemico", "tbca"],
                "professional_notes": "Manter vegetais variados e ajustar a porcao de lentilha individualmente.",
            }
        ],
        "diary": {"date": "2026-07-09", "meal_type": "Jantar", "quantity": "1", "grams": "380", "notes": "Lentilha, tofu e legumes salteados. Aderencia: 86%"},
        "plan": {
            "title": "Vegetariano com controle glicemico - Renata Alves QA",
            "target_kcal": "1650", "target_protein_g": "92", "target_carbs_g": "185", "target_fat_g": "60",
            "notes": "Plano ovolactovegetariano com carboidratos distribuidos, fibras e fontes proteicas em todas as refeicoes.",
            "meals": [
                {"meal_type": "Cafe da manha", "time": "07:00", "notes": "Proteina, fibra e fruta inteira.", "items": [{"quantity": "100", "unit": "g", "grams": "100", "notes": "Ovos mexidos"}, {"quantity": "30", "unit": "g", "grams": "30", "notes": "Aveia em flocos"}]},
                {"meal_type": "Lanche da manha", "time": "10:00", "notes": "Sem acucar adicionado.", "items": [{"quantity": "170", "unit": "g", "grams": "170", "notes": "Iogurte natural sem acucar"}]},
                {"meal_type": "Almoco", "time": "12:30", "notes": "Combinar cereal, leguminosa e vegetais.", "items": [{"quantity": "90", "unit": "g", "grams": "90", "notes": "Arroz integral cozido"}, {"quantity": "140", "unit": "g", "grams": "140", "notes": "Feijao preto cozido"}, {"quantity": "120", "unit": "g", "grams": "120", "notes": "Tofu grelhado"}]},
                {"meal_type": "Lanche da tarde", "time": "16:00", "notes": "Fruta associada a gordura insaturada.", "items": [{"quantity": "100", "unit": "g", "grams": "100", "notes": "Pera"}, {"quantity": "20", "unit": "g", "grams": "20", "notes": "Castanhas sem sal"}]},
                {"meal_type": "Jantar", "time": "19:30", "notes": "Baixa carga glicemica.", "items": [{"quantity": "150", "unit": "g", "grams": "150", "notes": "Lentilha cozida"}, {"quantity": "160", "unit": "g", "grams": "160", "notes": "Legumes variados"}]},
                {"meal_type": "Ceia", "time": "21:30", "notes": "Opcional conforme fome e glicemia.", "items": [{"quantity": "100", "unit": "g", "grams": "100", "notes": "Maca com canela"}]},
            ],
        },
    },
]


def seed_demo_patients() -> list[tuple[int, str, str]]:
    seeded: list[tuple[int, str, str]] = []
    with SessionLocal() as db:
        patients = PatientRepository(db)
        assessment_repository = AssessmentRepository(db)
        assessments = AssessmentService(assessment_repository, patients)
        anamnesis = AnamnesisService(AnamnesisRepository(db), patients)
        goals = PatientGoalService(PatientGoalRepository(db), patients)
        recipes = RecipeRepository(db)
        diary_repository = DiaryRepository(db)
        diary = DiaryService(diary_repository, patients, recipes)
        plan_repository = MealPlanRepository(db)
        plans = MealPlanService(plan_repository, patients, recipes)

        for profile in DEMO_PATIENTS:
            patient_data = PatientCreate(**profile["patient"])
            patient = db.scalar(select(Patient).where(Patient.email == patient_data.email))
            if patient is None:
                patient = patients.create(patient_data)
            else:
                patient = patients.update(patient, PatientUpdate(**patient_data.model_dump()))

            anamnesis.create_or_replace(patient.id, AnamnesisCreate(**profile["anamnesis"]))
            goals.replace_for_patient(patient.id, [PatientGoalCreate(**item) for item in profile["goals"]])

            existing_recipes = recipes.list_by_patient(patient.id)
            for item in profile["recipes"]:
                recipe_data = RecipeCreate(**item)
                matching_recipe = next((recipe for recipe in existing_recipes if recipe.title == recipe_data.title), None)
                if matching_recipe:
                    recipes.update(matching_recipe, RecipeUpdate(**recipe_data.model_dump()))
                else:
                    recipes.create(patient.id, recipe_data)

            physical_data = PhysicalAssessmentCreate(**profile["assessment"])
            existing_assessments = assessment_repository.list_physical(patient.id)
            matching_assessment = next((item for item in existing_assessments if item.date == physical_data.date), None)
            if matching_assessment:
                assessments.update_physical(patient.id, matching_assessment.id, PhysicalAssessmentUpdate(**physical_data.model_dump()))
            else:
                assessments.create_physical(patient.id, physical_data)

            existing_bioimpedance = assessment_repository.list_bioimpedance(patient.id)
            bioimpedance_data = [BioimpedanceCreate(**item) for item in profile["bioimpedance"]]
            desired_bioimpedance_dates = {item.date for item in bioimpedance_data}
            for existing_record in existing_bioimpedance:
                if existing_record.date not in desired_bioimpedance_dates:
                    assessments.delete_bioimpedance(patient.id, existing_record.id)
            for bio_data in bioimpedance_data:
                matching_bio = next((record for record in existing_bioimpedance if record.date == bio_data.date), None)
                if matching_bio:
                    assessments.update_bioimpedance(patient.id, matching_bio.id, BioimpedanceUpdate(**bio_data.model_dump()))
                else:
                    assessments.create_bioimpedance(patient.id, bio_data)

            diary_data = FoodDiaryEntryCreate(**profile["diary"])
            existing_diary = diary_repository.list_by_patient(patient.id)
            matching_diary = next(
                (item for item in existing_diary if item.date == diary_data.date and item.meal_type == diary_data.meal_type),
                None,
            )
            if matching_diary:
                diary.update(patient.id, matching_diary.id, FoodDiaryEntryUpdate(**diary_data.model_dump()))
            else:
                diary.create(patient.id, diary_data)

            plan_data = MealPlanCreate(**profile["plan"])
            existing_plans = plan_repository.list_by_patient(patient.id)
            if existing_plans:
                plans.update_plan(patient.id, existing_plans[0].id, plan_data)
            else:
                plans.create_plan(patient.id, plan_data)
            seeded.append((patient.id, patient.full_name, patient.email or ""))
    return seeded


if __name__ == "__main__":
    for patient_id, full_name, email in seed_demo_patients():
        print(f"{patient_id}: {full_name} <{email}>")
