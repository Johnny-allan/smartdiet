import { PatientRecordPage } from "@/modules/patient-care/patient-care-pages";
import { AppShell } from "@/shared/layout/app-shell";

export default function PatientsPage() {
  return (
    <AppShell>
      <PatientRecordPage />
    </AppShell>
  );
}
