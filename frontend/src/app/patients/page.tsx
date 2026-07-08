import { PatientsWorkspace } from "@/modules/workspace/functional-pages";
import { AppShell } from "@/shared/layout/app-shell";

export default function PatientsPage() {
  return (
    <AppShell>
      <PatientsWorkspace />
    </AppShell>
  );
}
