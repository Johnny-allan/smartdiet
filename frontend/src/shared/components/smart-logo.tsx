export function SmartLogo() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="smart-logo-mark shrink-0 text-[22px]" aria-hidden="true">
        S
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold leading-5 text-graphite">SmartDiet</p>
        <p className="truncate text-[12px] font-medium leading-4 text-forest">Inteligencia Nutricional</p>
      </div>
    </div>
  );
}
