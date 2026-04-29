import { cn } from "@/lib/utils";
import { COLORMAPS, type ColormapDef } from "./colormaps";

export type ColormapPickerProps = {
  /** The id of the currently selected colormap */
  value: string;
  /** Called with the id of the colormap the user selects */
  onChange: (id: string) => void;
  /** Override the list of available colormaps; defaults to the built-in set.
   *  The default list is exported as COLORMAPS and can be filtered:
   *  `colormaps={COLORMAPS.filter(c => ['viridis', 'magma'].includes(c.id))}` */
  colormaps?: ColormapDef[];
  /** Tailwind max-height class to enable scrolling, e.g. "max-h-48" or "max-h-[200px]" */
  maxHeight?: string;
  /** Additional CSS classes applied to the container */
  className?: string;
};

export default function ColormapPicker({
  value,
  onChange,
  colormaps = COLORMAPS,
  maxHeight,
  className,
}: ColormapPickerProps) {
  return (
    <div className={cn("px-3 py-3 space-y-1.5 overflow-y-auto", maxHeight, className)}>
      {colormaps.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded border text-xs hover:cursor-pointer",
            value === c.id
              ? "border-sky-700 bg-sky-50"
              : "border-slate-200 hover:bg-slate-50"
          )}
        >
          <span className="font-mono text-[11px] text-muted-foreground w-14 text-left shrink-0">
            {c.label}
          </span>
          <span
            className="h-3 flex-1 rounded"
            style={{ background: `linear-gradient(90deg, ${c.stops})` }}
          />
        </button>
      ))}
    </div>
  );
}
