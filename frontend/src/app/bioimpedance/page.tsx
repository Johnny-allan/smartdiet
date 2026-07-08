import { BioimpedanceWorkspace } from "@/modules/workspace/functional-pages";
import { AppShell } from "@/shared/layout/app-shell";

export default function BioimpedancePage() {
  return (
    <AppShell>
      <BioimpedanceWorkspace />
    </AppShell>
  );
}
