"use client";

import { Bell, Menu, Plus, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SmartSearch } from "@/shared/components/smart-search";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/patients": "Pacientes",
  "/anamnesis": "Anamnese",
  "/assessments": "Avaliacoes",
  "/bioimpedance": "Bioimpedancia",
  "/foods": "Alimentos",
  "/recipes": "Receitas",
  "/meal-plans": "Plano alimentar",
  "/substitutions": "Substituicoes",
  "/diary": "Diario alimentar",
  "/reports": "Relatorios",
  "/etl": "ETL alimentar",
};

const routeSearchPlaceholders: Record<string, string> = {
  "/": "Buscar paciente, alimento ou receita",
  "/patients": "Buscar paciente por nome, objetivo ou status",
  "/anamnesis": "Buscar anamnese, restricao ou objetivo",
  "/assessments": "Buscar avaliacao ou marcador clinico",
  "/bioimpedance": "Buscar registro de bioimpedancia",
  "/foods": "Buscar alimento ou sinonimo",
  "/recipes": "Buscar receita vinculada ao paciente",
  "/meal-plans": "Buscar refeicao ou item do plano",
  "/substitutions": "Buscar substituicao alimentar",
  "/diary": "Buscar registro do diario",
  "/reports": "Buscar relatorio ou paciente",
  "/etl": "Buscar importacao ou dados",
};

type WorkspaceSettings = {
  preferBrazilianFoods: boolean;
  compactFoodCards: boolean;
  showFoodSodium: boolean;
  softDarkMode: boolean;
};

const defaultSettings: WorkspaceSettings = {
  preferBrazilianFoods: true,
  compactFoodCards: false,
  showFoodSodium: true,
  softDarkMode: false,
};

const mobileNavItems = [
  { label: "Dashboard", href: "/" },
  { label: "Pacientes", href: "/patients" },
  { label: "Anamnese", href: "/anamnesis" },
  { label: "Avaliacoes", href: "/assessments" },
  { label: "Bioimpedancia", href: "/bioimpedance" },
  { label: "Alimentos", href: "/foods" },
  { label: "Receitas", href: "/recipes" },
  { label: "Plano alimentar", href: "/meal-plans" },
  { label: "Diario", href: "/diary" },
  { label: "Relatorios", href: "/reports" },
  { label: "ETL", href: "/etl" },
];

export function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? "SmartDiet";
  const searchPlaceholder = routeSearchPlaceholders[pathname] ?? "Buscar no SmartDiet";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);

  useEffect(() => {
    const raw = window.localStorage.getItem("smartdiet-settings");
    if (raw) {
      const value = { ...defaultSettings, ...(JSON.parse(raw) as Partial<WorkspaceSettings>) };
      setSettings(value);
      document.documentElement.dataset.theme = value.softDarkMode ? "dark" : "light";
    }
  }, []);

  function updateSettings(next: Partial<WorkspaceSettings>) {
    const value = { ...settings, ...next };
    setSettings(value);
    document.documentElement.dataset.theme = value.softDarkMode ? "dark" : "light";
    window.localStorage.setItem("smartdiet-settings", JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("smartdiet-settings-changed", { detail: value }));
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-background/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-smart border border-line bg-surface text-graphite transition duration-200 hover:border-sage hover:text-forest lg:hidden"
            title="Menu"
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-forest">Clinica SmartDiet</p>
            <h1 className="truncate text-[22px] font-semibold leading-7 text-graphite">{title}</h1>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <SmartSearch placeholder={searchPlaceholder} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            className="hidden h-10 items-center gap-2 rounded-smart bg-forest px-3 text-[14px] font-semibold text-white shadow-subtle transition duration-200 hover:bg-petrol sm:inline-flex"
            href="/patients"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo paciente
          </Link>
          <div className="relative">
            <button
              className="grid h-10 w-10 place-items-center rounded-smart border border-line bg-surface text-graphite transition duration-200 hover:border-sage hover:text-forest"
              title="Notificacoes"
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setSettingsOpen(false);
              }}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-12 w-[320px] rounded-smart border border-line bg-surface p-4 text-left shadow-smart">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold text-graphite">Notificacoes</p>
                    <p className="mt-1 text-[12px] leading-5 text-graphite/65">Alertas operacionais do workspace local.</p>
                  </div>
                  <button
                    className="h-8 rounded-smart border border-line bg-background px-3 text-[12px] font-semibold text-graphite/70 hover:border-sage hover:text-forest"
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Fechar
                  </button>
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="rounded-smart border border-line bg-background p-3">
                    <p className="text-[13px] font-semibold text-graphite">API local ativa</p>
                    <p className="mt-1 text-[12px] leading-5 text-graphite/65">Use o painel enquanto backend e frontend estiverem em execucao.</p>
                  </div>
                  <div className="rounded-smart border border-line bg-background p-3">
                    <p className="text-[13px] font-semibold text-graphite">Base alimentar</p>
                    <p className="mt-1 text-[12px] leading-5 text-graphite/65">Consulta brasileira habilitada para prescricao e calculo de porcoes.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              className="grid h-10 w-10 place-items-center rounded-smart border border-line bg-surface text-graphite transition duration-200 hover:border-sage hover:text-forest"
              title="Configuracoes"
              type="button"
              onClick={() => {
                setSettingsOpen((open) => !open);
                setNotificationsOpen(false);
              }}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </button>
            {settingsOpen ? (
              <div className="absolute right-0 top-12 w-[320px] rounded-smart border border-line bg-surface p-4 text-left shadow-smart">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold text-graphite">Configuracoes</p>
                    <p className="mt-1 text-[12px] leading-5 text-graphite/65">Preferencias rapidas do workspace.</p>
                  </div>
                  <button
                    className="h-8 rounded-smart border border-line bg-background px-3 text-[12px] font-semibold text-graphite/70 hover:border-sage hover:text-forest"
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Fechar
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  <label className="flex items-center justify-between gap-3 rounded-smart border border-line bg-background px-3 py-2 text-[13px] font-medium text-graphite">
                    Modo escuro suave
                    <input
                      checked={settings.softDarkMode}
                      className="h-4 w-4 accent-terracotta"
                      type="checkbox"
                      onChange={(event) => updateSettings({ softDarkMode: event.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-smart border border-line bg-background px-3 py-2 text-[13px] font-medium text-graphite">
                    Priorizar bases brasileiras
                    <input
                      checked={settings.preferBrazilianFoods}
                      className="h-4 w-4 accent-forest"
                      type="checkbox"
                      onChange={(event) => updateSettings({ preferBrazilianFoods: event.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-smart border border-line bg-background px-3 py-2 text-[13px] font-medium text-graphite">
                    Lista compacta de alimentos
                    <input
                      checked={settings.compactFoodCards}
                      className="h-4 w-4 accent-forest"
                      type="checkbox"
                      onChange={(event) => updateSettings({ compactFoodCards: event.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-smart border border-line bg-background px-3 py-2 text-[13px] font-medium text-graphite">
                    Exibir sodio na busca
                    <input
                      checked={settings.showFoodSodium}
                      className="h-4 w-4 accent-forest"
                      type="checkbox"
                      onChange={(event) => updateSettings({ showFoodSodium: event.target.checked })}
                    />
                  </label>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    className="flex-1 rounded-smart bg-forest px-3 py-2 text-center text-[12px] font-semibold text-white hover:bg-petrol"
                    href="/foods"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Alimentos
                  </Link>
                  <Link
                    className="flex-1 rounded-smart border border-line bg-background px-3 py-2 text-center text-[12px] font-semibold text-forest hover:border-sage hover:bg-mist"
                    href="/etl"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Dados
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {mobileOpen ? (
        <div className="border-t border-line bg-surface px-4 py-3 shadow-subtle lg:hidden">
          <div className="grid gap-2 sm:grid-cols-2">
            {mobileNavItems.map((item) => (
              <Link
                className={`rounded-smart px-3 py-2 text-[14px] font-medium transition duration-200 ${
                  pathname === item.href ? "bg-forest text-white" : "text-graphite hover:bg-mist hover:text-forest"
                }`}
                href={item.href}
                key={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
