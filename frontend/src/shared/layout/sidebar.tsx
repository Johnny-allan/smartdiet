"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Apple,
  BookOpen,
  ClipboardList,
  Database,
  Gauge,
  LayoutDashboard,
  NotebookTabs,
  Scale,
  ScrollText,
  Salad,
  Users,
} from "lucide-react";

import { SmartLogo } from "@/shared/components/smart-logo";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pacientes", href: "/patients", icon: Users },
  { label: "Anamnese", href: "/anamnesis", icon: NotebookTabs },
  { label: "Avaliacoes", href: "/assessments", icon: Activity },
  { label: "Bioimpedancia", href: "/bioimpedance", icon: Scale },
  { label: "Alimentos", href: "/foods", icon: Apple },
  { label: "Receitas", href: "/recipes", icon: BookOpen },
  { label: "Plano alimentar", href: "/meal-plans", icon: Salad },
  { label: "Diario", href: "/diary", icon: ClipboardList },
  { label: "Relatorios", href: "/reports", icon: ScrollText },
  { label: "ETL", href: "/etl", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[264px] border-r border-line bg-surface px-4 py-5 lg:block">
      <SmartLogo />
      <nav className="smart-scrollbar mt-8 max-h-[calc(100vh-220px)] space-y-1 overflow-y-auto pr-1" aria-label="Principal">
        {navItems.map((item) => (
          <Link
            className={`flex h-10 w-full items-center gap-3 rounded-smart px-3 text-left text-[14px] font-medium transition duration-200 ${
              pathname === item.href
                ? "bg-forest text-white shadow-subtle"
                : "text-graphite hover:bg-mist hover:text-forest"
            }`}
            href={item.href}
            key={item.label}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-5 left-4 right-4 rounded-smart border border-sage/70 bg-mist p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-smart bg-surface text-forest">
            <Gauge className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-graphite">Beta local</p>
            <p className="truncate text-[12px] text-graphite/65">API preparada</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
