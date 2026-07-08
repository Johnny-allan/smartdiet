import type { LucideIcon } from "lucide-react";

import { SmartCard } from "@/shared/components/smart-card";

type ModuleStat = {
  label: string;
  value: string;
};

type ModuleItem = {
  title: string;
  description: string;
  meta: string;
};

type ModulePageProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  stats: ModuleStat[];
  items: ModuleItem[];
};

export function ModulePage({ title, subtitle, icon: Icon, stats, items }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-smart border border-line bg-surface p-6 shadow-subtle md:flex-row md:items-center">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-forest">SmartDiet Beta</p>
          <h2 className="mt-1 text-[28px] font-semibold leading-9 text-graphite">{title}</h2>
          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-graphite/70">{subtitle}</p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-smart bg-mist text-forest">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <SmartCard className="p-5" key={stat.label}>
            <p className="text-[13px] font-medium text-graphite/65">{stat.label}</p>
            <p className="mt-2 text-[26px] font-semibold leading-none text-graphite">{stat.value}</p>
          </SmartCard>
        ))}
      </section>

      <SmartCard className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[16px] font-semibold text-graphite">Fluxo principal</h3>
          <span className="rounded-smart bg-background px-3 py-1 text-[12px] font-semibold text-forest">Preparado</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((item) => (
            <article
              className="min-h-[112px] rounded-smart border border-line bg-background p-4 transition duration-200 hover:border-sage hover:bg-surface"
              key={item.title}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-[14px] font-semibold text-graphite">{item.title}</h4>
                  <p className="mt-2 text-[13px] leading-5 text-graphite/70">{item.description}</p>
                </div>
                <span className="shrink-0 rounded-smart bg-mist px-2 py-1 text-[12px] font-semibold text-forest">
                  {item.meta}
                </span>
              </div>
            </article>
          ))}
        </div>
      </SmartCard>
    </div>
  );
}
