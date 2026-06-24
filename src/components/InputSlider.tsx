import { cn } from '@/lib/utils';

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
    /** A function that is called with the newest value */
    onChange?: (value: number) => void;
    /** Tailwind ClassNames applied to parent container */
    className?: string;
};

export default function InputSlider({
    label,
    min,
    max,
    value,
    units,
    shorthandUnits,
    marks,
    step = 1,
    showFill = false,
    showSideInput = true,
    onChange = () => {},
    className = '',
    ...props
}: InputSliderProps) {
    //todo: create thumb className with a few different options, no way to control thumb style without direct CSS
    const _thumbStyleCSS = ``;

    //todo: create slider className with a few different options, no way to control all aspects of slider style without direct CSS
    const _sliderStyleCSS = ``;

    //todo: implement
    const _tickMarkSizes = {
        small: '',
        medium: '',
        large: '',
    };

    //todo: implement
    const _thumbInputSizes = {
        small: '',
        medium: '',
        large: '',
    };

    //todo: make this variable based on a thumb size
    const thumbWidth = 16; //pixels

    const handleInputChange = (newValue: number) => {
        if (newValue < min) newValue = min;
        if (newValue > max) newValue = max;
        onChange(newValue);
    };

    const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        handleInputChange(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        handleInputChange(newValue);
    };

    // if (marks) {
    //     for ( let i = 0; i < marks?.length; i++) {
    //         const val = marks[i];
    //         const _cssStyle = `calc(${((val - min) / (max - min)) * 100}% + ${(-((val - min) / (max - min))*8) + thumbWidth/2}px)`
    //     }
    // }

    type TickMarkProps = {
        mark: number;
        displayValue?: boolean;
    };
    const TickMark = ({ mark, displayValue = true }: TickMarkProps) => {
        return (
            <div
                className="absolute -top-2 w-[1px] h-4 bg-gray-400"
                style={{ left: generateLeftOffsetString(mark) }}
            >
                {displayValue && (
                    <p className="absolute text-center text-xs top-2 -translate-x-1/2 translate-y-full whitespace-nowrap">
                        {mark} {shorthandUnits}
                    </p>
                )}
            </div>
        );
    };

    const generateLeftOffsetString = (mark: number) => {
        return `calc(${((mark - min) / (max - min)) * 100}% + ${-((mark - min) / (max - min)) * thumbWidth + thumbWidth / 2}px)`;
    };

    const isIndexFirstOrLast = (array: number[], index: number): boolean => {
        return array.length - 1 === index || index === 0 ? true : false;
    };

    return (
        <div
            className={cn(
                `flex items-center pt-4 pb-4 pr-2 min-h-12 group min-w-96 w-full`,
                className,
            )}
            {...props}
        >
            {/** Optional Label on Left of Slider*/}
            {label && <label className="font-medium text-gray-700 w-fit pr-2">{label}</label>}

            {/** Main Slider Component with ticks and thumb input*/}
            <div className="flex-grow flex items-center relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    step={step}
                    onChange={handleDrag}
                    className={`${showFill ? 'appearance-auto' : 'appearance-none'} w-full absolute z-10 appearance-nonee hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none`}
                />
                {/** Thumb Input Number */}
                <div
                    className="absolute z-0 -top-8 w-12 h-24"
                    style={{
                        left: `calc(${((value - min) / (max - min)) * 100}% + ${-((value - min) / (max - min)) * thumbWidth + thumbWidth / 2}px)`,
                    }}
                >
                    <div className="relative ">
                        <div className="absolute w-[0] h-4 top-1 bg-gray-400"></div>
                        <div className="absolute -translate-x-1/2 left-2 -y-translate-full -top-0">
                            <input
                                type="number"
                                value={value}
                                className="w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
                {/** Optional TickMarks */}
                {marks && (
                    <div className="absolute z-0 w-full">
                        {marks.map((mark, index) => (
                            <TickMark
                                mark={mark}
                                key={index.toString()}
                                displayValue={isIndexFirstOrLast(marks, index)}
                            />
                        ))}
                    </div>
                )}
                {/** Min Tickmark with value label */}
                {(!marks || !marks.includes(min)) && (
                    <TickMark mark={min} displayValue={true} key={min.toString()} />
                )}
                {/** Max Tickmark with value label */}
                {(!marks || !marks.includes(max)) && (
                    <TickMark mark={max} displayValue={true} key={max.toString()} />
                )}
            </div>

            {/** Optional Input Box on Right of Slider*/}
            {showSideInput && (
                <div className="w-fit pl-2 text-gray-700 flex justify-center items-center">
                    <input
                        type="number"
                        value={value}
                        className="text-center text-md w-12 border appearance-none bg-white/50"
                        onChange={handleChange}
                    />
                    <p className="pl-1">{units}</p>
                </div>
            )}
        </div>
    );
}
