import { Activity, Apple, CalendarDays, ClipboardCheck, Scale, Users } from "lucide-react";

import { MetricCard } from "@/shared/components/metric-card";
import { NutritionBadge } from "@/shared/components/nutrition-badge";
import { SmartCard } from "@/shared/components/smart-card";
import { importedFoods, meals, metrics, patients, timeline } from "@/modules/dashboard/data";

const metricIcons = [Users, CalendarDays, Scale];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => (
          <MetricCard
            icon={metricIcons[index]}
            key={metric.label}
            label={metric.label}
            tone={metric.tone}
            trend={metric.trend}
            value={metric.value}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <SmartCard className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold text-graphite">Pacientes em foco</h2>
              <p className="truncate text-[13px] text-graphite/65">Fluxos clinicos prioritarios</p>
            </div>
            <ClipboardCheck className="h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
          </div>
          {patients.length > 0 ? (
            <div className="overflow-x-auto smart-scrollbar">
              <table className="min-w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-background text-[12px] font-semibold uppercase text-graphite/60">
                    <th className="px-5 py-3">Paciente</th>
                    <th className="px-5 py-3">Objetivo</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Proxima acao</th>
                    <th className="px-5 py-3">Marcador</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr className="border-b border-line text-[14px]" key={patient.name}>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-graphite">{patient.name}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-graphite/75">{patient.goal}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-smart bg-mist px-2 py-1 text-[12px] font-semibold text-forest">
                          {patient.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-graphite/75">{patient.nextAction}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-graphite">{patient.lastMetric}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <div className="rounded-smart border border-dashed border-line bg-background p-5 text-center">
                <p className="text-[14px] font-semibold text-graphite">Nenhum paciente cadastrado</p>
                <p className="mt-1 text-[13px] leading-5 text-graphite/65">Use a tela Pacientes para iniciar o workspace com dados reais.</p>
              </div>
            </div>
          )}
        </SmartCard>

        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold text-graphite">Linha do tempo</h2>
              <p className="truncate text-[13px] text-graphite/65">Eventos clinicos recentes</p>
            </div>
            <Activity className="h-5 w-5 shrink-0 text-petrol" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-4">
            {timeline.map((item) => (
              <div className="grid grid-cols-[72px_1fr] gap-3" key={item.title}>
                <span className="text-[13px] font-semibold text-forest">{item.time}</span>
                <div className="border-l border-sage pl-4">
                  <p className="text-[14px] font-semibold text-graphite">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-5 text-graphite/70">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </SmartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold text-graphite">Base brasileira</h2>
              <p className="truncate text-[13px] text-graphite/65">Dados brasileiros para prescricao</p>
            </div>
            <Apple className="h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
          </div>
          <div className="mt-5 space-y-3">
            {importedFoods.map((food) => (
              <article
                className="rounded-smart border border-line bg-background p-4 transition duration-200 hover:border-sage hover:bg-surface"
                key={food.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold text-graphite">{food.name}</h3>
                    <p className="mt-1 truncate text-[12px] font-medium text-forest">Base brasileira</p>
                  </div>
                  <span className="shrink-0 rounded-smart bg-surface px-2 py-1 text-[12px] font-semibold text-petrol">
                    {food.kcal}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <NutritionBadge label="P" value={food.protein} />
                  <NutritionBadge label="C" value={food.carbs} />
                  <NutritionBadge label="G" value={food.fat} />
                </div>
              </article>
            ))}
          </div>
        </SmartCard>

        <SmartCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold text-graphite">Plano alimentar</h2>
              <p className="truncate text-[13px] text-graphite/65">Seis refeicoes obrigatorias</p>
            </div>
            <span className="rounded-smart bg-forest px-3 py-1 text-[12px] font-semibold text-white">2190 kcal</span>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {meals.map((meal) => (
              <article
                className="min-h-[148px] rounded-smart border border-line bg-background p-4 transition duration-200 hover:border-sage hover:bg-surface"
                key={meal.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold text-graphite">{meal.name}</h3>
                    <p className="mt-1 truncate text-[12px] text-graphite/65">{meal.items}</p>
                  </div>
                  <span className="shrink-0 rounded-smart bg-mist px-2 py-1 text-[12px] font-semibold text-forest">
                    {meal.time}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <NutritionBadge label="kcal" value={meal.kcal} />
                  <NutritionBadge label="P" value={meal.protein} />
                  <NutritionBadge label="C" value={meal.carbs} />
                  <NutritionBadge label="G" value={meal.fat} />
                </div>
              </article>
            ))}
          </div>
        </SmartCard>
      </section>
    </div>
  );
}
