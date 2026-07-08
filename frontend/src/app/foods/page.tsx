import { FoodsWorkspace } from "@/modules/workspace/functional-pages";
import { AppShell } from "@/shared/layout/app-shell";

export default function FoodsPage() {
  return (
    <AppShell>
      <FoodsWorkspace />
    </AppShell>
  );
}
