interface SectionLabelProps {
  text: string;
}

export function SectionLabel({ text }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-[1px] bg-tfc-orange" />
      <span className="text-xs font-body font-medium tracking-[0.2em] uppercase text-tfc-orange">
        {text}
      </span>
    </div>
  );
}
