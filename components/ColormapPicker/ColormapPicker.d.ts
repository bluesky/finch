import { ColormapDef } from './colormaps';
export type ColormapPickerProps = {
    /** The id of the currently selected colormap */
    value: string;
    /** Called with the id of the colormap the user selects */
    onChange: (id: string) => void;
    /** Override the list of available colormaps; defaults to the built-in set.
     *  The default list is exported as COLORMAPS and can be filtered:
     *  `colormaps={COLORMAPS.filter(c => ['viridis', 'magma'].includes(c.id))}`
     *  See the ColormapPicker Storybook docs for how to define a custom colormap. */
    colormaps?: ColormapDef[];
    /** Additional CSS classes applied to the container (e.g. "max-h-48" to constrain height and enable scroll) */
    className?: string;
};
/**
 * A palette-style colormap selector. Renders a scrollable list of gradient swatches
 * and calls `onChange` with the selected colormap's `id` string.
 *
 * This component is renderer-agnostic — the `id` values from `COLORMAPS` do not
 * necessarily match the colorscale names expected by a specific renderer. For Plotly,
 * use `COLORMAPSPLOTLY` instead: its `id` values are the exact strings Plotly expects
 * for its `colorscale` prop, so the selected value can be passed through directly.
 */
export default function ColormapPicker({ value, onChange, colormaps, className, }: ColormapPickerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ColormapPicker.d.ts.map