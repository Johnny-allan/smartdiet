"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SmartSearchProps = {
  placeholder: string;
};

export function SmartSearch({ placeholder }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [store, setStore] = useState<{
    patients?: Array<{ id: string; name: string; goal?: string }>;
    recipes?: Array<{ id: string; title: string; ingredients?: string }>;
    assessments?: Array<{ id: string; date: string; bmi?: string }>;
  }>({});

  useEffect(() => {
    const raw = window.localStorage.getItem("smartdiet-store");
    if (raw) {
      setStore(JSON.parse(raw));
    }
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];

    return [
      ...(store.patients ?? []).map((item) => ({
        title: item.name,
        description: item.goal ?? "Paciente",
        href: "/patients",
        type: "Paciente",
      })),
      ...(store.recipes ?? []).map((item) => ({
        title: item.title,
        description: item.ingredients ?? "Receita",
        href: "/recipes",
        type: "Receita",
      })),
      ...(store.assessments ?? []).map((item) => ({
        title: `Avaliacao ${item.date}`,
        description: item.bmi ? `IMC ${item.bmi}` : "Avaliacao",
        href: "/assessments",
        type: "Avaliacao",
      })),
    ]
      .filter((item) => `${item.title} ${item.description} ${item.type}`.toLowerCase().includes(needle))
      .slice(0, 8);
  }, [query, store]);

  return (
    <div className="relative block w-full max-w-[420px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/50" />
      <input
        className="h-10 w-full rounded-smart border border-line bg-surface pl-10 pr-3 text-[14px] text-graphite shadow-subtle transition duration-200 placeholder:text-graphite/45 hover:border-sage focus:border-petrol"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={query}
      />
      {query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-smart border border-line bg-surface shadow-smart">
          {results.length > 0 ? (
            results.map((item) => (
              <Link
                className="block border-b border-line px-4 py-3 transition duration-200 last:border-b-0 hover:bg-mist"
                href={item.href}
                key={`${item.type}-${item.title}`}
                onClick={() => setQuery("")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[14px] font-semibold text-graphite">{item.title}</p>
                  <span className="shrink-0 rounded-smart bg-background px-2 py-1 text-[11px] font-semibold text-forest">
                    {item.type}
                  </span>
                </div>
                <p className="mt-1 truncate text-[12px] text-graphite/65">{item.description}</p>
              </Link>
            ))
          ) : (
            <div className="px-4 py-3 text-[13px] text-graphite/65">Nenhum resultado encontrado.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
