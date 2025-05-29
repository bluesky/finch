export type InputSliderProps = {
    /** Slider label */
    label?: string;
    /** Lowest possible value */
    min: number;
    /** Greatest possible value */
    max: number;
    /** Current value of slider */
    value: number;
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
    /** Should the input bar be filled up with blue color up to the thumb? */
    showFill?: boolean;
    /**Tailwind ClassName */
    width?: `w-${string}`;
    /** How big should the text and tick marks be? */
    size?: 'small' | 'medium' | 'large';
    /** A function that is called with the newest value */
    onChange?: (value: number) => void;
    /** Tailwind ClassNames applied to parent container */
    styles?: string;
};
export default function InputSlider({ label, min, max, value, units, shorthandUnits, marks, step, showFill, size, width, showSideInput, onChange, styles, ...props }: InputSliderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=InputSlider.d.ts.map