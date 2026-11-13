import { useState, useEffect, useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import InputSlider from './ui/InputSlider';
import Button from './ui/Button';
import { TiledSearchItem, ArrayStructure, Slider } from './types';
import { generateSearchPath, onPopoutClick, createSliders, detectRGBInfo } from './utils';
import { useTiledArrayAsPngQuery, useTiledArrayImagePath } from '@/api/tiled';
import { ArrowUpRight, PaletteIcon } from '@phosphor-icons/react';

type PreviewNDArrayProps = {
    arrayItem: TiledSearchItem<ArrayStructure>;
    url?: string;
    isFullWidth?: boolean;
    handleSelectClick?: (item: TiledSearchItem<ArrayStructure>, currentSlice: number[]) => void;
};

export default function PreviewNDArray({
    arrayItem,
    url,
    isFullWidth,
    handleSelectClick,
}: PreviewNDArrayProps) {
    const [sliders, setSliders] = useState<Slider[]>([]);
    // The selected frame, tagged with the item/mode it was chosen for. Reading it through `frameKey`
    // means a stale stack from the previous item is never requested against the new one.
    const [frame, setFrame] = useState<{ key: string; stack: number[] } | null>(null);
    const [userToggledRGB, setUserToggledRGB] = useState(false);

    const shape = arrayItem.attributes.structure.shape;
    const rgbInfo = detectRGBInfo(arrayItem, userToggledRGB);

    // In RGB mode the channel dim is absorbed into the image, so one fewer slider
    const sliderCount = rgbInfo.isRGB ? shape.length - 3 : shape.length - 2;
    // For channelFirst arrays ([3, H, W, ...]) the first dim is channel — skip it for sliders
    const shapeForSliders = rgbInfo.channelFirst ? shape.slice(1) : shape;

    const searchPath = generateSearchPath(arrayItem);
    const frameKey = `${searchPath}|${sliderCount}|${rgbInfo.channelFirst}`;
    const stack = frame?.key === frameKey ? frame.stack : null;

    const handleSliderChange = (newValue: number, slider: Slider) => {
        if (!stack) return;
        const next = [...stack];
        next[slider.index] = newValue;
        setFrame({ key: frameKey, stack: next });
        setSliders((prevState) => {
            const newState = [...prevState];
            newState[slider.index].value = newValue;
            return newState;
        });
    };

    const requestOptions = useMemo(() => (url ? { baseUrl: url } : undefined), [url]);
    const imageOptions = useMemo(
        () => ({
            stack: stack ?? undefined,
            ...(rgbInfo.isRGB ? { isRGB: true } : {}),
            ...(rgbInfo.channelFirst ? { channelFirst: true } : {}),
        }),
        [stack, rgbInfo.isRGB, rgbInfo.channelFirst],
    );

    const {
        data: blob,
        isPending,
        isPlaceholderData,
        error,
    } = useTiledArrayAsPngQuery(
        searchPath,
        // `arrayItem` lets the client downsample large frames; it is not part of the cache key.
        { ...imageOptions, arrayItem },
        // Keep the previous frame up (under the spinner) while the next one loads.
        { enabled: stack !== null, placeholderData: keepPreviousData },
        requestOptions,
    );
    const isLoading = (isPending && !error) || isPlaceholderData;
    const imagePath = useTiledArrayImagePath(searchPath, imageOptions, requestOptions);
    // Without a stack the URL would ask for the whole N-D array, so only offer it once a frame is set.
    const popoutUrl = stack ? imagePath : '';

    useEffect(() => {
        if (error) console.error(error);
    }, [error]);

    // One object URL per blob, released when the blob changes or the preview unmounts.
    const [imageUrl, setImageUrl] = useState('');
    useEffect(() => {
        if (!blob) {
            setImageUrl('');
            return;
        }
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [blob]);

    // Reset toggle when the viewed item changes
    useEffect(() => {
        setUserToggledRGB(false);
    }, [arrayItem]);

    // Start each item (or RGB mode, which changes the slider count) on its middle frame.
    useEffect(() => {
        if (!arrayItem) return;

        setSliders(createSliders(sliderCount, shapeForSliders));
        setFrame({
            key: frameKey,
            stack: shapeForSliders.slice(0, sliderCount).map((dim) => Math.floor(dim / 2)),
        });
        // `shapeForSliders` is a fresh array each render; `frameKey` already captures what matters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arrayItem, frameKey]);

    return (
        <>
            <div className="flex flex-col w-full space-y-2">
                <p className="text-sky-900 text-center">{arrayItem.id}</p>
                <div
                    className={`${sliderCount > 2 ? '' : ''} flex flex-col items-center justify-center w-full space-x-4`}
                >
                    <div
                        className={`relative bg-slate-300 aspect-square max-h-full min-w-72 ${isFullWidth ? 'w-7/12' : 'w-1/2'}`}
                    >
                        {popoutUrl && (
                            <div
                                onClick={() => onPopoutClick(popoutUrl)}
                                className="absolute top-2 right-2 w-6 aspect-square hover:cursor-pointer hover:text-slate-500"
                            >
                                <ArrowUpRight className="w-full h-full" />
                            </div>
                        )}
                        {rgbInfo.canToggleRGB && (
                            <div
                                onClick={() => setUserToggledRGB((prev) => !prev)}
                                title="Change view to RGB"
                                className={`absolute top-9 right-2 w-6 aspect-square hover:cursor-pointer ${userToggledRGB ? 'text-sky-600' : 'hover:text-slate-500'}`}
                            >
                                <PaletteIcon className="w-full h-full" />
                            </div>
                        )}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-300 z-10">
                                <svg
                                    className="animate-spin h-10 w-10 text-slate-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            </div>
                        )}
                        {imageUrl && <img src={imageUrl} className="w-full h-full" />}
                        <p className="text-sm text-center text-slate-500">{`True Dimensions:  [${arrayItem.attributes.structure.shape.join(', ')}]`}</p>
                    </div>
                    <div
                        className={`${sliderCount > 0 ? 'min-w-72 max-w-full w-1/2' : 'hidden'} flex flex-col space-y-4 pt-6 px-4`}
                    >
                        {sliders.map((slider, index) =>
                            slider.min !== slider.max ? (
                                <InputSlider
                                    key={index}
                                    showSideInput={false}
                                    min={slider.min}
                                    max={slider.max}
                                    value={slider.value}
                                    onChange={(newValue) => handleSliderChange(newValue, slider)}
                                />
                            ) : (
                                <p className="text-xs text-center">{slider.min}</p>
                            ),
                        )}
                    </div>
                </div>
            </div>
            {handleSelectClick && (
                <Button
                    text="Select"
                    size="medium"
                    cb={() =>
                        handleSelectClick(
                            arrayItem,
                            sliders.map((slider) => slider.value),
                        )
                    }
                />
            )}
        </>
    );
}
