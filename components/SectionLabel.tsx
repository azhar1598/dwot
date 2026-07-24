type SectionLabelProps = {
  index?: string;
  children: React.ReactNode;
};

export default function SectionLabel({ index, children }: SectionLabelProps) {
  return (
    <div className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">
      {index && <span className="text-accent">{index}</span>}
      <span>{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
