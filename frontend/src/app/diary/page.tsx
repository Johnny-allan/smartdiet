import { DiaryWorkspace } from "@/modules/workspace/functional-pages";
import { AppShell } from "@/shared/layout/app-shell";

export default function DiaryPage() {
  return (
    <AppShell>
      <DiaryWorkspace />
    </AppShell>
  );
}
