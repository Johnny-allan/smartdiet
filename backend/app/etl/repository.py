from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.etl.models import ImportJob, ImportLog


class ImportJobRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def start(self, source_name: str, source_version: str | None = None, notes: str | None = None) -> ImportJob:
        job = ImportJob(
            source_name=source_name,
            source_version=source_version,
            status="running",
            started_at=datetime.now(UTC),
            notes=notes,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def finish(self, job: ImportJob, status: str, notes: str | None = None) -> ImportJob:
        job.status = status
        job.finished_at = datetime.now(UTC)
        if notes is not None:
            job.notes = notes
        self.db.commit()
        self.db.refresh(job)
        return job

    def log(self, job: ImportJob, level: str, message: str) -> ImportLog:
        entry = ImportLog(job_id=job.id, level=level, message=message, created_at=datetime.now(UTC))
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry
