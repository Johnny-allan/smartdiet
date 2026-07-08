import { AppShell } from "@/shared/layout/app-shell";
import { Dashboard } from "@/modules/dashboard/dashboard";

export default function Home() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
