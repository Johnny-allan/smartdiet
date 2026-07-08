from pydantic import BaseModel


class PatientReportSummary(BaseModel):
    patient_id: int
    sections: list[str]
    export_pdf_available: bool
