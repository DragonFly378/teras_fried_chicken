import { Flame } from "lucide-react";

interface SpiceLevelProps {
  level: number; // 1-5
}

export function SpiceLevel({ level }: SpiceLevelProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-body text-tfc-muted mr-1">Pedas</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <Flame
          key={i}
          className={`w-3.5 h-3.5 ${
            i < level ? "text-tfc-red" : "text-tfc-brown/15"
          }`}
          strokeWidth={1.5}
          fill={i < level ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}
