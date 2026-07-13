from datetime import date, time
from types import SimpleNamespace

from app.reports import router as reports
from app.reports.router import _build_simple_pdf


def test_meal_plan_pdf_builder_creates_valid_multipage_pdf() -> None:
    pdf = _build_simple_pdf(["SmartDiet - Cardapio", *[f"Linha {index}" for index in range(120)]])

    assert pdf.startswith(b"%PDF-1.4")
    assert b"q 1 1 1 rg 0 0 595 842 re f Q" in pdf
    assert b"/Type /Page" in pdf
    assert b"/Count 4" in pdf
    assert b"/BaseFont /Helvetica-Bold" in pdf
    assert b"Pagina 1/4" in pdf
    assert pdf.endswith(b"%%EOF\n")


def test_clinical_report_pdf_builder_accepts_professional_sections() -> None:
    pdf = _build_simple_pdf(
        [
            "SmartDiet - Relatorio clinico do paciente",
            "Paciente: Marina Costa",
            "Observacoes do cadastro: acompanhamento individual",
            "Anamnese",
            "Focos e metas",
            "Avaliacoes fisicas",
            "Bioimpedancia",
            "Plano alimentar",
            "Receitas vinculadas",
            "Diario alimentar",
        ]
    )

    assert pdf.startswith(b"%PDF-1.4")
    assert b"Relatorio clinico" in pdf
    assert b"Documento de apoio profissional" in pdf
    assert b"Receitas vinculadas" in pdf
    assert b"acompanhamento individual" in pdf
    assert b"/Count 1" in pdf


def test_clinical_download_uses_the_selected_patients_complete_saved_record(monkeypatch) -> None:
    patient = SimpleNamespace(
        full_name="Paciente Exportacao Real",
        status="active",
        birth_date=date(1990, 5, 10),
        gender="Feminino",
        email="paciente@example.com",
        phone="11999999999",
        notes="Observacao exclusiva da ficha 77",
    )
    anamnesis = SimpleNamespace(
        main_goal="Objetivo clinico exclusivo",
        clinical_history="Historico clinico completo",
        family_history=None,
        allergies="Alergia registrada",
        intolerances=None,
        medications=None,
        diseases=None,
        surgeries=None,
        sleep_quality=None,
        stress_level=None,
        bowel_function=None,
        water_intake=None,
        alcohol_use=None,
        smoking=None,
        physical_activity="Caminhada",
        food_preferences="Arroz e feijao",
        food_restrictions="Sem lactose",
        objective_type="Manutencao",
    )
    assessment = SimpleNamespace(
        date=date(2026, 7, 13), weight_kg=70, height_cm=165, bmi=25.7,
        waist_cm=80, hip_cm=95, body_fat_percent=28, notes="Avaliacao exclusiva",
    )
    bio = SimpleNamespace(
        date=date(2026, 7, 13), body_fat_percent=28, fat_mass_kg=19.6,
        lean_mass_kg=50.4, total_body_water_l=35, visceral_fat_level=7,
        basal_metabolic_rate_kcal=1450, notes="Bio exclusiva",
    )
    item = SimpleNamespace(grams=120, notes="Arroz integral salvo")
    meal = SimpleNamespace(meal_type="Almoco", time=time(12, 30), notes="Orientacao do almoco", items=[item])
    plan = SimpleNamespace(
        title="Plano individual 77", start_date=None, end_date=None, target_kcal=1800,
        target_protein_g=100, target_carbs_g=220, target_fat_g=60,
        notes="Plano salvo automaticamente", meals=[meal],
    )

    monkeypatch.setattr(reports, "PatientRepository", lambda db: SimpleNamespace(get=lambda patient_id: patient if patient_id == 77 else None))
    monkeypatch.setattr(reports, "AnamnesisRepository", lambda db: SimpleNamespace(get_by_patient=lambda patient_id: anamnesis))
    monkeypatch.setattr(reports, "MealPlanRepository", lambda db: SimpleNamespace(list_by_patient=lambda patient_id: [plan]))
    monkeypatch.setattr(reports, "DiaryRepository", lambda db: SimpleNamespace(list_by_patient=lambda patient_id: []))
    monkeypatch.setattr(reports, "PatientGoalRepository", lambda db: SimpleNamespace(list_by_patient=lambda patient_id: []))
    monkeypatch.setattr(reports, "RecipeRepository", lambda db: SimpleNamespace(list_by_patient=lambda patient_id: []))
    monkeypatch.setattr(
        reports,
        "AssessmentRepository",
        lambda db: SimpleNamespace(
            list_physical=lambda patient_id: [assessment],
            list_bioimpedance=lambda patient_id: [bio],
        ),
    )

    lines = reports._patient_report_lines(77, object())
    pdf = _build_simple_pdf(lines)

    assert any("Paciente Exportacao Real" in line for line in lines)
    assert any("Observacao exclusiva da ficha 77" in line for line in lines)
    assert any("Historico clinico completo" in line for line in lines)
    assert any("Plano individual 77" in line for line in lines)
    assert any("Arroz integral salvo" in line for line in lines)
    assert b"Paciente Exportacao Real" in pdf
    assert b"Arroz integral salvo" in pdf


def test_patient_meal_plan_download_is_concise_and_uses_latest_measurements(monkeypatch) -> None:
    patient = SimpleNamespace(
        full_name="Paciente Resumo",
        email="nao-deve-sair@example.com",
        phone="11999999999",
    )
    assessment = SimpleNamespace(weight_kg=70, height_cm=165)
    bio = SimpleNamespace(
        date=date(2026, 7, 13),
        body_fat_percent=28,
        fat_mass_kg=19.6,
        lean_mass_kg=50.4,
        muscle_mass_kg=27.5,
        total_body_water_l=35,
        visceral_fat_level=7,
        basal_metabolic_rate_kcal=1450,
    )
    meal = SimpleNamespace(
        meal_type="Lanche da tarde",
        time=time(16, 30),
        items=[
            SimpleNamespace(grams=100, notes="Banana"),
            SimpleNamespace(grams=120, notes="Substituicao para Banana: Mamao"),
        ],
    )
    plan = SimpleNamespace(title="Plano resumido", meals=[meal])

    monkeypatch.setattr(reports, "PatientRepository", lambda db: SimpleNamespace(get=lambda patient_id: patient))
    monkeypatch.setattr(reports, "MealPlanRepository", lambda db: SimpleNamespace(list_by_patient=lambda patient_id: [plan]))
    monkeypatch.setattr(
        reports,
        "AssessmentRepository",
        lambda db: SimpleNamespace(
            list_physical=lambda patient_id: [assessment],
            list_bioimpedance=lambda patient_id: [bio],
        ),
    )

    lines = reports._patient_meal_plan_lines(77, object())
    content = "\n".join(lines)

    assert "Paciente: Paciente Resumo" in content
    assert "Peso: 70 kg" in content
    assert "Altura: 165 cm" in content
    assert "Cafe da tarde | 16:30" in content
    assert "- 100 g | Banana" in content
    assert "Substituicoes\n- 120 g | Substituicao para Banana: Mamao" in content
    assert "nao-deve-sair@example.com" not in content
    assert "11999999999" not in content
