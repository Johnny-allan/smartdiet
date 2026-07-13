import type { ReactNode } from "react";

import { Header } from "@/shared/layout/header";
import { Sidebar } from "@/shared/layout/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-background text-graphite">
      <Sidebar />
      <div className="lg:pl-[264px]">
        <Header />
        <main className="mx-auto min-w-0 w-full max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
