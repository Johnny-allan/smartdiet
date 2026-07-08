import type { ReactNode } from "react";

import { Header } from "@/shared/layout/header";
import { Sidebar } from "@/shared/layout/sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-graphite">
      <Sidebar />
      <div className="lg:pl-[264px]">
        <Header />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
