import type { ReactNode } from "react";

type BenchProps = {
  className?: string;
  /** Rendered sitting on the bench's top surface, in front of the judge (e.g. a filed document). */
  children?: ReactNode;
};

export default function Bench({ className = "", children }: BenchProps) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="mx-auto h-4 w-64 bg-background-raised sm:w-80" />
      <div className="mx-auto h-8 w-72 border-t border-line bg-background-raised sm:w-96" />
      <div className="mx-auto h-1 w-80 bg-line sm:w-[26rem]" />
      {children && (
        <div className="pointer-events-none absolute inset-x-0 -top-4 flex justify-center">{children}</div>
      )}
    </div>
  );
}
