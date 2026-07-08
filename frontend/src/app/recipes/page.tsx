import { RecipesWorkspace } from "@/modules/workspace/functional-pages";
import { AppShell } from "@/shared/layout/app-shell";

export default function RecipesPage() {
  return (
    <AppShell>
      <RecipesWorkspace />
    </AppShell>
  );
}
