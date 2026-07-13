import { clsx } from "clsx";
import type { ReactNode } from "react";

type SmartCardProps = {
  children: ReactNode;
  className?: string;
};

export function SmartCard({ children, className }: SmartCardProps) {
  return (
    <section
      className={clsx(
        "min-w-0 rounded-smart border border-line bg-surface shadow-subtle transition duration-200 ease-out hover:shadow-smart",
        className,
      )}
    >
      {children}
    </section>
  );
}
