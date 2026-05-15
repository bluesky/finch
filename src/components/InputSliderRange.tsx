import { useState } from 'react';
import { cn } from '@/lib/utils';

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

export default function InputSliderRange({
    label,
    min,
    max,
    value,
    units,
    shorthandUnits,
    marks,
    step = 1,
    allowValueOverlap = false,
    showSideInput = true,
    onChange = () => {},
    isDisabled = false,
    className = '',
    ...props
}: InputSliderRangeProps) {
    //todo: remove this
    const [_currentValue, setCurrentValue] = useState(value);

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

    const handleInputChange = (index: 0 | 1, newValue: number) => {
        if (newValue < min) newValue = min;
        if (newValue > max) newValue = max;
        const newRange: [number, number] = [...value];
        newRange[index] = newValue;
        //prevent the range from being reversed
        if (allowValueOverlap) {
            if (newRange[0] > newRange[1]) {
                return;
            }
        } else {
            if (newRange[0] >= newRange[1]) {
                return;
            }
        }
        setCurrentValue(newRange);
        onChange(newRange);
    };

    const handleDrag = (index: 0 | 1, e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;
        const newValue = Number(e.target.value);
        const newRange: [number, number] = [...value];
        newRange[index] = newValue;
        handleInputChange(index, newValue);
    };

    const handleChange = (index: 0 | 1, e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;
        const newValue = Number(e.target.value);
        const newRange: [number, number] = [...value];
        newRange[index] = newValue;
        handleInputChange(index, newValue);
    };

    const calculatePositionStyle = (value: number) => {
        const positionStyle = `calc(${((value - min) / (max - min)) * 100}% + ${-((value - min) / (max - min)) * thumbWidth + thumbWidth / 2}px)`;
        return positionStyle;
    };

    const calculateTrackWidthStyle = (value: [number, number]) => {
        const maxValue = Math.max(value[0], value[1]);
        const minValue = Math.min(value[0], value[1]);
        const trackWidthStyle = `calc(${((maxValue - minValue) / (max - min)) * 100}% + ${-((maxValue - minValue) / (max - min)) * thumbWidth}px)`;
        return trackWidthStyle;
    };

    // if (marks) {
    //     for ( let i = 0; i < marks?.length; i++) {
    //         const val = marks[i];
    //         const _cssStyle = `calc(${((val - min) / (max - min)) * 100}% + ${(-((val - min) / (max - min))*8) + thumbWidth/2}px)`
    //         console.log(cssStyle);
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
                `flex items-center pt-4 pb-4 pr-2 min-h-12 group w-full min-w-96`,
                className,
            )}
            {...props}
        >
            {/** Optional Label on Left of Slider*/}
            {label && <label className="font-medium text-gray-700 w-fit pr-2">{label}</label>}

            {/** Optional Input Box on Left of Slider*/}
            {showSideInput && (
                <div className="w-fit pl-2 text-gray-700 flex justify-center items-center">
                    <input
                        type="number"
                        value={value[0]}
                        className="text-center text-md w-12 border appearance-none bg-white/50"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(0, e)}
                    />
                    <p className="pl-1">{units}</p>
                </div>
            )}

            {/** Container for two superimposed sliders to create a single 'range' slider with two thumbs*/}
            <div className="relative flex-grow">
                <div className="w-full absolute top-0 left-0">
                    {/** First Main Slider Component with ticks and thumb input*/}
                    <div className="flex-grow flex items-center relative">
                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={value[0]}
                            step={step}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDrag(0, e)}
                            style={{ pointerEvents: 'none' }} // disables track and thumb
                            className={`range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-slate-400/50 h-2 rounded-lg focus:outline-none`}
                        />
                        {/** Thumb Input Number */}
                        <div
                            className="absolute z-0 -top-8 w-12 h-24"
                            style={{ left: calculatePositionStyle(value[0]) }}
                        >
                            <div className="relative ">
                                <div className="absolute w-[0] h-4 top-1 bg-gray-400"></div>
                                <div className="absolute -translate-x-1/2 left-2 -y-translate-full -top-0">
                                    <input
                                        type="number"
                                        value={value[0]}
                                        className="w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleChange(0, e)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/** Optional TickMarks Part of First Slider*/}
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
                </div>

                {/** Second Slider Component with thumb input only, no ticks*/}
                <div className="w-full absolute top-0 left-0">
                    <div className="flex-grow flex items-center relative">
                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={value[1]}
                            step={step}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDrag(1, e)}
                            style={{ pointerEvents: 'none' }} // disables track and thumb
                            className={`range-slider appearance-none w-full absolute z-10  hover:cursor-pointer bg-transparent h-2 rounded-lg focus:outline-none`}
                        />
                        <style>{`
                                .range-slider::-webkit-slider-thumb {
                                    pointer-events: auto;
                                }
                                .range-slider::-moz-range-thumb {
                                    pointer-events: auto;
                                }
                            `}</style>
                        {/** Thumb Input Number */}
                        <div
                            className="absolute z-0 -top-8 w-12 h-24"
                            style={{ left: calculatePositionStyle(value[1]) }}
                        >
                            <div className="relative ">
                                <div className="absolute w-[0] h-4 top-1 bg-gray-400"></div>
                                <div className="absolute -translate-x-1/2 left-2 -y-translate-full -top-0">
                                    <input
                                        type="number"
                                        value={value[1]}
                                        className="w-16 text-center text-xs appearance-none bg-transparent py-[1px] group-hover:border border-slate-400"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleChange(1, e)
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The highilghted bar in between the thumbs */}
                <span
                    className="absolute z-0 top-0 h-2 bg-blue-700/80 -translate-y-1/2"
                    style={{
                        left: calculatePositionStyle(Math.min(value[0], value[1])),
                        width: calculateTrackWidthStyle(value),
                    }}
                ></span>
            </div>

            {/** Optional Input Box on Right of Slider*/}
            {showSideInput && (
                <div className="w-fit pl-2 text-gray-700 flex justify-center items-center">
                    <input
                        type="number"
                        value={value[1]}
                        className="text-center text-md w-12 border appearance-none bg-white/50"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(1, e)}
                    />
                    <p className="pl-1">{units}</p>
                </div>
            )}
        </div>
    );
}
