import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { tailwindIcons } from '../../assets/icons';
import { Tooltip } from 'react-tooltip';
import { AllowedDevices } from './types/types';

type MultiSelectInputProps = { 
    label: string;
    isItemInArray: (item: string) => boolean;
    addItem: (item: string) => void;
    removeItem: (item: string) => void;
    selectedItems: string[];
    allowedDevices: AllowedDevices;
    description: string | undefined;
    required: boolean;
    className?: string;
    styles?: string;
};
export default function MultiSelectInput(
    {
        label='', 
        isItemInArray,
        addItem=()=>{}, 
        removeItem=()=>{}, 
        selectedItems=[], 
        allowedDevices, 
        description='', 
        required=false, 
        styles='',
        className
    }: MultiSelectInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [availableItems, setAvailableItems] = useState(Object.keys(allowedDevices));
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [isWiggling, setIsWiggling] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setDropdownVisible(true);
    };

    const handleItemClick = (item:string) => {
        //TODO: refactor this to take an arg that does not close dropdown if we came from an 'enter' key

        if (!isItemInArray(item)) { 
            addItem(item);
            setAvailableItems(availableItems.filter((i) => i !== item));
            setInputValue('');
            setDropdownVisible(false);
        }
    };



    const handleRemoveItem = (item: string) => {
        removeItem(item);
        setAvailableItems([...availableItems, item]);
    };



    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const matchingItem = availableItems.find((item) => item.toLowerCase() === inputValue.toLowerCase());
            if (matchingItem) {
                handleItemClick(matchingItem);
            } else {
                setIsWiggling(true);
                setTimeout(() => setIsWiggling(false), 500); // Remove the class after the animation
            }
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div ref={containerRef} className={cn("relative w-full max-w-96 border-2 border-slate-300 rounded-lg mt-2 h-fit", className)}>
            <p id={label + 'ParamInputTooltip'} className="text-sm pl-4 text-gray-500 border-b border-dashed border-slate-300">{`${label} ${required ? '(required)' : '(optional)'}`}</p> 
            <Tooltip anchorSelect={'#' + label + 'ParamInputTooltip'} children={<p className="whitespace-pre-wrap">{description}</p>} place="top" variant="info" style={{'maxWidth' : "500px", 'height': 'fit-content'}} delayShow={400}/>
            <div className="flex flex-wrap justify-around rounded p-2">
                {selectedItems.map((item) => ( 
                    <div key={item} className="flex items-center bg-[#DCEAF1] text-sky-900 pl-2 pr-1 py-1 m-1 rounded">
                        <span>{item}</span>
                        <button
                            onClick={() => handleRemoveItem(item)}
                            className="ml-2 text-slate-600 hover:text-red-700 h-6 aspect-square"
                        >
                            {tailwindIcons.xCircle}
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setDropdownVisible(true)}
                    className={`flex-1 border-none focus:outline-none min-w-36 pl-2 ${isWiggling ? 'animate-wiggle' : ''}`}
                />
            </div>
            {dropdownVisible && (
                <ul className="z-10 absolute w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto">
                    {availableItems
                        .filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
                        .map((item) => (
                            <li
                                key={item}
                                onClick={() => handleItemClick(item)}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                            >
                                {item}
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}

