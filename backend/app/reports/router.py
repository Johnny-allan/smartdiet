from textwrap import wrap

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.assessment.repository import AssessmentRepository
from app.clinical.repository import AnamnesisRepository, PatientGoalRepository
from app.core.database import get_db
from app.core.exceptions import NotFoundError
from app.diary.repository import DiaryRepository
from app.patients.repository import PatientRepository
from app.plans.repository import MealPlanRepository
from app.recipes.repository import RecipeRepository
from app.reports.schemas import PatientReportSummary
from app.shared.responses import ApiResponse

router = APIRouter(prefix="/patients/{patient_id}/reports", tags=["reports"])


@router.get("/summary", response_model=ApiResponse[PatientReportSummary])
def patient_report_summary(patient_id: int, db: Session = Depends(get_db)) -> ApiResponse[PatientReportSummary]:
    patient = PatientRepository(db).get(patient_id)
    if patient is None:
        raise NotFoundError("Patient not found")
    assessment_repo = AssessmentRepository(db)
    assessments = assessment_repo.list_physical(patient_id)
    bioimpedances = assessment_repo.list_bioimpedance(patient_id)
    anamnesis = AnamnesisRepository(db).get_by_patient(patient_id)
    plans = MealPlanRepository(db).list_by_patient(patient_id)
    diary = DiaryRepository(db).list_by_patient(patient_id)
    goals = PatientGoalRepository(db).list_by_patient(patient_id)
    latest_assessment = assessments[0] if assessments else None
    latest_bioimpedance = bioimpedances[0] if bioimpedances else None
    return ApiResponse(
        data=PatientReportSummary(
            patient_id=patient_id,
            patient_name=patient.full_name,
            patient_status=patient.status,
            sections=["summary", "anamnesis", "goals", "assessments", "bioimpedance", "meal_plan", "recipes", "diary"],
            export_pdf_available=True,
            main_goal=anamnesis.main_goal if anamnesis else None,
            clinical_history=anamnesis.clinical_history if anamnesis else None,
            food_restrictions=anamnesis.food_restrictions if anamnesis else None,
            latest_weight_kg=str(latest_assessment.weight_kg) if latest_assessment else None,
            latest_bmi=str(latest_assessment.bmi) if latest_assessment else None,
            latest_body_fat_percent=(
                str(latest_bioimpedance.body_fat_percent)
                if latest_bioimpedance and latest_bioimpedance.body_fat_percent is not None
                else str(latest_assessment.body_fat_percent)
                if latest_assessment and latest_assessment.body_fat_percent is not None
                else None
            ),
            latest_assessment_date=(
                str(latest_assessment.date)
                if latest_assessment
                else str(latest_bioimpedance.date)
                if latest_bioimpedance
                else None
            ),
            active_meal_plan=plans[0].title if plans else None,
            assessment_count=len(assessments),
            bioimpedance_count=len(bioimpedances),
            meal_plan_count=len(plans),
            diary_count=len(diary),
            goal_count=len(goals),
        )
    )


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


SECTION_TITLES = {
    "Resumo",
    "Anamnese",
    "Avaliacoes fisicas",
    "Bioimpedancia",
    "Plano alimentar",
    "Diario alimentar",
    "Focos e metas",
    "Receitas vinculadas",
    "Dados do paciente",
    "Objetivo",
    "Restricoes e preferencias",
    "Substituicoes",
}


def _pdf_text(value: str) -> bytes:
    return _pdf_escape(value).encode("latin-1", errors="replace")


def _build_simple_pdf(
    lines: list[str],
    footer: str = "Documento de apoio profissional. Revisao humana obrigatoria.",
) -> bytes:
    page_size = 38
    pages = [lines[index : index + page_size] for index in range(0, len(lines), page_size)] or [[]]

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    ]
    page_object_numbers: list[int] = []
    for page_index, page_lines in enumerate(pages):
        content = bytearray()
        content.extend(b"q 1 1 1 rg 0 0 595 842 re f Q\n")
        content.extend(b"q 0.184 0.435 0.310 rg 0 790 595 52 re f Q\n")
        content.extend(b"q 0.658 0.835 0.729 rg 0 786 595 4 re f Q\n")
        content.extend(b"BT /F2 16 Tf 46 812 Td (SmartDiet) Tj ET\n")
        content.extend(b"BT /F1 9 Tf 46 798 Td (Inteligencia Nutricional) Tj ET\n")
        content.extend(f"BT /F1 9 Tf 500 26 Td (Pagina {page_index + 1}/{len(pages)}) Tj ET\n".encode("ascii"))

        y = 752
        for line_index, line in enumerate(page_lines):
            if not line:
                y -= 10
                continue

            clipped_line = line[:110]
            is_title = page_index == 0 and line_index == 0
            is_section = clipped_line in SECTION_TITLES
            if is_title:
                content.extend(b"BT /F2 17 Tf 46 ")
                content.extend(str(y).encode("ascii"))
                content.extend(b" Td (")
                content.extend(_pdf_text(clipped_line))
                content.extend(b") Tj ET\n")
                y -= 24
            elif is_section:
                y -= 4
                content.extend(b"q 0.933 0.961 0.941 rg 40 ")
                content.extend(str(y - 7).encode("ascii"))
                content.extend(b" 515 21 re f Q\n")
                content.extend(b"BT /F2 11 Tf 50 ")
                content.extend(str(y).encode("ascii"))
                content.extend(b" Td (")
                content.extend(_pdf_text(clipped_line))
                content.extend(b") Tj ET\n")
                y -= 24
            else:
                content.extend(b"BT /F1 10 Tf 50 ")
                content.extend(str(y).encode("ascii"))
                content.extend(b" Td (")
                content.extend(_pdf_text(clipped_line))
                content.extend(b") Tj ET\n")
                y -= 15

        content.extend(b"BT /F1 8 Tf 46 44 Td (")
        content.extend(_pdf_text(footer))
        content.extend(b") Tj ET\n")
        stream = bytes(content)
        page_number = len(objects) + 1
        content_number = page_number + 1
        page_object_numbers.append(page_number)
        objects.append(
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_number} 0 R >>".encode(
                "ascii"
            )
        )
        objects.append(b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream")

    kids = " ".join(f"{page_number} 0 R" for page_number in page_object_numbers)
    objects[1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_object_numbers)} >>".encode("ascii")
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer << /Root 1 0 R /Size {len(objects) + 1} >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    )
    return bytes(pdf)


def _add_section(lines: list[str], title: str, section_lines: list[str]) -> None:
    lines.extend(["", title])
    if section_lines:
        lines.extend(section_lines)
    else:
        lines.append("Sem registros para esta secao.")


def _wrap_optional(value: object | None, width: int = 90) -> list[str]:
    if value is None or value == "":
        return []
    return wrap(str(value), width=width)


def _seven_skinfold_sum(item: object) -> object:
    fields = (
        "chest_skinfold_mm",
        "midaxillary_skinfold_mm",
        "triceps_skinfold_mm",
        "subscapular_skinfold_mm",
        "abdominal_skinfold_mm",
        "suprailiac_skinfold_mm",
        "thigh_skinfold_mm",
    )
    values = [getattr(item, field, None) for field in fields]
    measured = [value for value in values if value is not None]
    return sum(measured) if measured else "-"


def _patient_report_lines(patient_id: int, db: Session) -> list[str]:
    patient = PatientRepository(db).get(patient_id)
    if patient is None:
        raise NotFoundError("Patient not found")

    assessment_repo = AssessmentRepository(db)
    anamnesis = AnamnesisRepository(db).get_by_patient(patient_id)
    plans = MealPlanRepository(db).list_by_patient(patient_id)
    diary_entries = DiaryRepository(db).list_by_patient(patient_id)
    assessments = assessment_repo.list_physical(patient_id)
    bioimpedances = assessment_repo.list_bioimpedance(patient_id)
    goals = PatientGoalRepository(db).list_by_patient(patient_id)
    recipes = RecipeRepository(db).list_by_patient(patient_id)

    lines = [
        "SmartDiet - Relatorio clinico do paciente",
        f"Paciente: {patient.full_name}",
        f"Status: {patient.status}",
    ]
    if patient.birth_date:
        lines.append(f"Nascimento: {patient.birth_date}")
    if patient.email:
        lines.append(f"Email: {patient.email}")
    if patient.phone:
        lines.append(f"Telefone: {patient.phone}")
    if patient.gender:
        lines.append(f"Genero: {patient.gender}")
    if patient.notes:
        lines.extend(_wrap_optional(f"Observacoes do cadastro: {patient.notes}"))
    lines.extend(["", "Documento de apoio profissional. Revisao humana obrigatoria antes de prescricao."])

    anamnesis_lines: list[str] = []
    if anamnesis:
        anamnesis_fields = [
            ("Objetivo principal", anamnesis.main_goal),
            ("Historico clinico", anamnesis.clinical_history),
            ("Historico familiar", anamnesis.family_history),
            ("Alergias", anamnesis.allergies),
            ("Intolerancias", anamnesis.intolerances),
            ("Medicamentos", anamnesis.medications),
            ("Doencas", anamnesis.diseases),
            ("Cirurgias", anamnesis.surgeries),
            ("Sono", anamnesis.sleep_quality),
            ("Estresse", anamnesis.stress_level),
            ("Funcao intestinal", anamnesis.bowel_function),
            ("Ingestao de agua", anamnesis.water_intake),
            ("Alcool", anamnesis.alcohol_use),
            ("Tabagismo", anamnesis.smoking),
            ("Atividade fisica", anamnesis.physical_activity),
            ("Preferencias alimentares", anamnesis.food_preferences),
            ("Restricoes alimentares", anamnesis.food_restrictions),
            ("Tipo de objetivo", anamnesis.objective_type),
        ]
        for label, value in anamnesis_fields:
            if value:
                anamnesis_lines.extend(_wrap_optional(f"{label}: {value}"))
    _add_section(lines, "Anamnese", anamnesis_lines)

    _add_section(
        lines,
        "Focos e metas",
        [
            f"{item.focus} | {item.metric}: atual {item.current_value or '-'} {item.unit or ''} | meta {item.target_value or '-'} {item.unit or ''} | {item.status}"
            for item in goals
        ],
    )

    _add_section(
        lines,
        "Avaliacoes fisicas",
        [
            f"{item.date} | peso {item.weight_kg} kg | altura {item.height_cm} cm | IMC {item.bmi} | cintura {item.waist_cm or '-'} cm | quadril {item.hip_cm or '-'} cm | gordura {item.body_fat_percent or '-'}% | 7 dobras: {_seven_skinfold_sum(item)} mm | {item.notes or 'Sem observacoes'}"
            for item in assessments[:6]
        ],
    )

    _add_section(
        lines,
        "Bioimpedancia",
        [
            f"{item.date} | gordura {item.body_fat_percent or '-'}% | massa gorda {item.fat_mass_kg or '-'} kg | massa magra {item.lean_mass_kg or '-'} kg | agua {item.total_body_water_l or '-'} L | visceral {item.visceral_fat_level or '-'} | TMB {item.basal_metabolic_rate_kcal or '-'} kcal | {item.notes or 'Sem observacoes'}"
            for item in bioimpedances[:1]
        ],
    )

    meal_plan_lines: list[str] = []
    if plans:
        plan = plans[0]
        meal_plan_lines.append(plan.title)
        if plan.start_date or plan.end_date:
            meal_plan_lines.append(f"Periodo: {plan.start_date or '-'} a {plan.end_date or '-'}")
        if plan.target_kcal:
            meal_plan_lines.append(f"Meta energetica: {plan.target_kcal} kcal")
        if plan.target_protein_g:
            meal_plan_lines.append(f"Meta de proteinas: {plan.target_protein_g} g")
        if plan.target_carbs_g:
            meal_plan_lines.append(f"Meta de carboidratos: {plan.target_carbs_g} g")
        if plan.target_fat_g:
            meal_plan_lines.append(f"Meta de gorduras: {plan.target_fat_g} g")
        meal_plan_lines.extend(_wrap_optional(plan.notes))
        for meal in plan.meals:
            meal_plan_lines.append(f"{meal.meal_type} | {meal.time.strftime('%H:%M') if meal.time else 'Horario livre'}")
            meal_plan_lines.extend(_wrap_optional(meal.notes))
            for item in meal.items:
                meal_plan_lines.extend(_wrap_optional(f"- {item.grams} g | {item.notes or 'Item sem descricao'}"))
    _add_section(lines, "Plano alimentar", meal_plan_lines)

    _add_section(
        lines,
        "Receitas vinculadas",
        [
            f"{item.title} | {item.servings} porcao(oes) | {item.description or 'Sem descricao'}"
            for item in recipes
        ],
    )

    _add_section(
        lines,
        "Diario alimentar",
        [
            f"{item.date} | {item.meal_type} | {item.grams} g | {item.notes or 'Registro sem observacao'}"
            for item in diary_entries[:10]
        ],
    )

    return lines


def _patient_meal_plan_lines(patient_id: int, db: Session) -> list[str]:
    patient = PatientRepository(db).get(patient_id)
    if patient is None:
        raise NotFoundError("Patient not found")

    plans = MealPlanRepository(db).list_by_patient(patient_id)
    if not plans:
        raise NotFoundError("Meal plan not found")

    assessment_repo = AssessmentRepository(db)
    assessments = assessment_repo.list_physical(patient_id)
    bioimpedances = assessment_repo.list_bioimpedance(patient_id)
    latest_assessment = assessments[0] if assessments else None
    latest_bioimpedance = bioimpedances[0] if bioimpedances else None
    plan = plans[0]

    lines = [
        "SmartDiet - Resumo alimentar",
        "",
        "Resumo",
        f"Paciente: {patient.full_name}",
        f"Peso: {latest_assessment.weight_kg} kg" if latest_assessment and latest_assessment.weight_kg else "Peso: Nao registrado",
        f"Altura: {latest_assessment.height_cm} cm" if latest_assessment and latest_assessment.height_cm else "Altura: Nao registrada",
        f"Plano: {plan.title}",
        "",
        "Bioimpedancia",
    ]

    if latest_bioimpedance:
        lines.extend(
            [
                f"Data: {latest_bioimpedance.date}",
                f"Gordura corporal: {latest_bioimpedance.body_fat_percent or '-'}%",
                f"Massa gorda: {latest_bioimpedance.fat_mass_kg or '-'} kg",
                f"Massa magra: {latest_bioimpedance.lean_mass_kg or '-'} kg",
                f"Massa muscular: {latest_bioimpedance.muscle_mass_kg or '-'} kg",
                f"TMB: {latest_bioimpedance.basal_metabolic_rate_kcal or '-'} kcal",
            ]
        )
    else:
        lines.append("Sem bioimpedancia registrada.")

    lines.extend(["", "Plano alimentar"])
    meal_labels = {"Lanche da tarde": "Cafe da tarde"}
    for meal in plan.meals:
        label = meal_labels.get(meal.meal_type, meal.meal_type)
        lines.append(f"{label} | {meal.time.strftime('%H:%M') if meal.time else 'Horario livre'}")
        regular_items = [
            item for item in meal.items if not (item.notes or "").lower().startswith("substituicao para ")
        ]
        substitutions = [
            item for item in meal.items if (item.notes or "").lower().startswith("substituicao para ")
        ]
        if regular_items:
            for item in regular_items:
                lines.extend(_wrap_optional(f"- {item.grams} g | {item.notes or 'Alimento sem descricao'}"))
        else:
            lines.append("- Nenhum alimento cadastrado.")
        if substitutions:
            lines.append("Substituicoes")
            for item in substitutions:
                lines.extend(_wrap_optional(f"- {item.grams} g | {item.notes}"))

    return lines


@router.get("/meal-plan.pdf")
def patient_meal_plan_pdf(patient_id: int, db: Session = Depends(get_db)) -> Response:
    content = _build_simple_pdf(
        _patient_meal_plan_lines(patient_id, db),
        footer="Plano alimentar individual. Siga as orientacoes do nutricionista.",
    )
    filename = f"cardapio-paciente-{patient_id}.pdf"
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/clinical-summary.pdf")
def patient_clinical_summary_pdf(patient_id: int, db: Session = Depends(get_db)) -> Response:
    content = _build_simple_pdf(_patient_report_lines(patient_id, db))
    filename = f"relatorio-clinico-paciente-{patient_id}.pdf"
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
