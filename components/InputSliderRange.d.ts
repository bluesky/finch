export type InputSliderRangeProps = {
    /** Slider label */
    label?: string;
    /** Lowest possible value */
    min: number;
    /** Greatest possible value */
    max: number;
    /** Current value of slider */
    value: [number, number];
    /** Unit type */
    units?: string;
    /** An extra unit label underneath the min/max tickmark value */
    shorthandUnits?: string;
    /**Should we show the input box on the right of the slider? */
    showSideInput?: boolean;
    /** An array representing where vertical tick marks should be */
    marks?: number[];
    /** The spacing between snap points for the slider thumb, defaults to 1 */
    step?: number;
    /** Is it allowed to have the min value equal the max value? */
    allowValueOverlap?: boolean;
    /** A function that is called with the newest value */
    onChange?: (value: [number, number]) => void;
    /** Should the slider be disabled? */
    isDisabled?: boolean;
    /** Tailwind ClassNames applied to parent container */
    className?: string;
};
export default function InputSliderRange({ label, min, max, value, units, shorthandUnits, marks, step, allowValueOverlap, showSideInput, onChange, isDisabled, className, ...props }: InputSliderRangeProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=InputSliderRange.d.ts.map