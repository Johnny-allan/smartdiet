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
    if PatientRepository(db).get(patient_id) is None:
        raise NotFoundError("Patient not found")
    return ApiResponse(
        data=PatientReportSummary(
            patient_id=patient_id,
            sections=["summary", "anamnesis", "goals", "assessments", "bioimpedance", "meal_plan", "recipes", "diary"],
            export_pdf_available=True,
        )
    )


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


SECTION_TITLES = {
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
}


def _pdf_text(value: str) -> bytes:
    return _pdf_escape(value).encode("latin-1", errors="replace")


def _build_simple_pdf(lines: list[str]) -> bytes:
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

        content.extend(
            b"BT /F1 8 Tf 46 44 Td (Documento de apoio profissional. Revisao humana obrigatoria.) Tj ET\n"
        )
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


def _extract_adherence(notes: str | None) -> str | None:
    if not notes:
        return None
    for line in notes.splitlines():
        normalized = line.lower()
        if "aderencia" in normalized or "adherence" in normalized:
            return line.split(":", 1)[-1].strip() if ":" in line else line.strip()
    return None


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
            f"{item.date} | peso {item.weight_kg} kg | altura {item.height_cm} cm | IMC {item.bmi} | cintura {item.waist_cm or '-'} cm | quadril {item.hip_cm or '-'} cm | gordura {item.body_fat_percent or '-'}% | {item.notes or 'Sem observacoes'}"
            for item in assessments[:6]
        ],
    )

    _add_section(
        lines,
        "Bioimpedancia",
        [
            f"{item.date} | gordura {item.body_fat_percent or '-'}% | massa gorda {item.fat_mass_kg or '-'} kg | massa magra {item.lean_mass_kg or '-'} kg | agua {item.total_body_water_l or '-'} L | visceral {item.visceral_fat_level or '-'} | TMB {item.basal_metabolic_rate_kcal or '-'} kcal | {item.notes or 'Sem observacoes'}"
            for item in bioimpedances[:6]
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


@router.get("/meal-plan.pdf")
def patient_meal_plan_pdf(patient_id: int, db: Session = Depends(get_db)) -> Response:
    patient = PatientRepository(db).get(patient_id)
    if patient is None:
        raise NotFoundError("Patient not found")

    plans = MealPlanRepository(db).list_by_patient(patient_id)
    if not plans:
        raise NotFoundError("Meal plan not found")
    plan = plans[0]
    anamnesis = AnamnesisRepository(db).get_by_patient(patient_id)
    diary_entries = DiaryRepository(db).list_by_patient(patient_id)
    bioimpedances = AssessmentRepository(db).list_bioimpedance(patient_id)
    latest_bioimpedance = bioimpedances[0] if bioimpedances else None
    adherence_values = [value for value in (_extract_adherence(item.notes) for item in diary_entries) if value]

    lines = [
        "SmartDiet - Cardapio do paciente",
        f"Paciente: {patient.full_name}",
        "",
        "Dados do paciente",
        f"Plano: {plan.title}",
    ]
    if patient.birth_date:
        lines.append(f"Nascimento: {patient.birth_date}")
    if patient.gender:
        lines.append(f"Genero: {patient.gender}")
    if patient.phone:
        lines.append(f"Telefone: {patient.phone}")
    if patient.email:
        lines.append(f"Email: {patient.email}")
    if patient.notes:
        lines.extend(_wrap_optional(f"Observacoes do cadastro: {patient.notes}"))
    if anamnesis and anamnesis.main_goal:
        lines.extend(_wrap_optional(f"Objetivo alimentar: {anamnesis.main_goal}"))
    if anamnesis and anamnesis.food_restrictions:
        lines.extend(_wrap_optional(f"Restricoes/preferencias: {anamnesis.food_restrictions}"))
    if anamnesis and anamnesis.food_preferences:
        lines.extend(_wrap_optional(f"Preferencias alimentares: {anamnesis.food_preferences}"))
    if anamnesis and anamnesis.physical_activity:
        lines.extend(_wrap_optional(f"Rotina/atividade: {anamnesis.physical_activity}"))
    if plan.target_kcal:
        lines.append(f"Meta energetica do cardapio: {plan.target_kcal} kcal")
    if plan.target_protein_g:
        lines.append(f"Meta de proteinas: {plan.target_protein_g} g")
    if plan.target_carbs_g:
        lines.append(f"Meta de carboidratos: {plan.target_carbs_g} g")
    if plan.target_fat_g:
        lines.append(f"Meta de gorduras: {plan.target_fat_g} g")
    lines.append(f"Registros no diario alimentar: {len(diary_entries)}")
    lines.append(f"Aderencia registrada: {adherence_values[0] if adherence_values else 'Sem registro de aderencia'}")
    lines.append("")

    lines.append("Bioimpedancia")
    if latest_bioimpedance:
        lines.append(f"Data: {latest_bioimpedance.date}")
        lines.append(f"Gordura corporal: {latest_bioimpedance.body_fat_percent or '-'}%")
        lines.append(f"Massa gorda: {latest_bioimpedance.fat_mass_kg or '-'} kg")
        lines.append(f"Massa magra: {latest_bioimpedance.lean_mass_kg or '-'} kg")
        lines.append(f"Agua corporal: {latest_bioimpedance.total_body_water_l or '-'} L")
        lines.append(f"Gordura visceral: {latest_bioimpedance.visceral_fat_level or '-'}")
        lines.append(f"TMB: {latest_bioimpedance.basal_metabolic_rate_kcal or '-'} kcal")
    else:
        lines.append("Sem bioimpedancia registrada.")
    lines.append("")

    for meal in plan.meals:
        lines.append(f"{meal.meal_type} | {meal.time.strftime('%H:%M') if meal.time else 'Horario livre'}")
        if meal.notes:
            lines.extend(wrap(meal.notes, width=90))
        for item in meal.items:
            item_line = f"- {item.grams} g"
            if item.notes:
                item_line += f" | {item.notes}"
            lines.extend(wrap(item_line, width=90))
        lines.append("")

    content = _build_simple_pdf(lines)
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
