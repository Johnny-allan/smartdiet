from app.reports.router import _build_simple_pdf


def test_meal_plan_pdf_builder_creates_valid_multipage_pdf() -> None:
    pdf = _build_simple_pdf(["SmartDiet - Cardapio", *[f"Linha {index}" for index in range(120)]])

    assert pdf.startswith(b"%PDF-1.4")
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
    assert b"/Count 1" in pdf
