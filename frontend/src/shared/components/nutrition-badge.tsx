type NutritionBadgeProps = {
  label: string;
  value: string;
};

export function NutritionBadge({ label, value }: NutritionBadgeProps) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-smart border border-line bg-background px-2 text-[12px] font-medium text-graphite">
      <span className="text-graphite/60">{label}</span>
      <span>{value}</span>
    </span>
  );
}
