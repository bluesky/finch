import { Eye, EyeSlash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { ResolvedMaskClass } from './types';

export type MaskOverlayCanvasLegendProps = Omit<
    React.ComponentPropsWithoutRef<'ul'>,
    'onToggle'
> & {
    /** Classes to list, in display order. */
    classes: ResolvedMaskClass[];
    /** Called with the class id and its next visibility when a row's toggle is clicked. */
    onToggle?: (classId: number, visible: boolean) => void;
    /** Render the visibility toggles. When `false`, rows are labels only. Defaults to `true`. */
    interactive?: boolean;
    /** Additional CSS classes applied to the list element. */
    className?: string;
    /** Additional CSS classes applied to each row. */
    classNameRow?: string;
};

/**
 * The class legend for {@link MaskOverlayCanvas}: a color swatch, a label and a
 * visibility toggle per class.
 *
 * Exported separately so it can be placed outside the canvas — in a sidebar, for
 * instance — while still being driven by the same resolved class list.
 */
export default function MaskOverlayCanvasLegend({
    classes,
    onToggle,
    interactive = true,
    className,
    classNameRow,
    ...props
}: MaskOverlayCanvasLegendProps) {
    return (
        <ul
            aria-label="Mask classes"
            className={cn('flex flex-col gap-1 text-slate-700', className)}
            {...props}
        >
            {classes.map((cls) => (
                <li key={cls.id} className={cn('flex items-center gap-2', classNameRow)}>
                    <span
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 rounded-sm border border-black/10"
                        style={{ backgroundColor: cls.color }}
                    />
                    <span
                        className={cn(
                            'flex-1 truncate text-xs',
                            cls.visible ? 'text-slate-700' : 'font-light text-slate-400',
                        )}
                    >
                        {cls.label}
                    </span>
                    {interactive && (
                        <button
                            type="button"
                            aria-label={`${cls.visible ? 'Hide' : 'Show'} ${cls.label}`}
                            aria-pressed={!cls.visible}
                            onClick={() => onToggle?.(cls.id, !cls.visible)}
                            className="shrink-0 rounded p-0.5 text-slate-500 hover:cursor-pointer hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                            {cls.visible ? <Eye size={14} /> : <EyeSlash size={14} />}
                        </button>
                    )}
                </li>
            ))}
        </ul>
    );
}
