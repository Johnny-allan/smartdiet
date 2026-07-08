import type { LucideIcon } from "lucide-react";

import { SmartCard } from "@/shared/components/smart-card";

type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone: "forest" | "petrol" | "terracotta";
};

const toneClasses = {
  forest: "bg-mist text-forest",
  petrol: "bg-petrol/10 text-petrol",
  terracotta: "bg-terracotta/10 text-terracotta",
};

export function MetricCard({ label, value, trend, icon: Icon, tone }: MetricCardProps) {
  return (
    <SmartCard className="min-h-[128px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-graphite/70">{label}</p>
          <p className="mt-2 text-[28px] font-semibold leading-none text-graphite">{value}</p>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-smart ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-[13px] font-medium text-forest">{trend}</p>
    </SmartCard>
  );
}
