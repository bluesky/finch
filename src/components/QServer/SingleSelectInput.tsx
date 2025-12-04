
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { tailwindIcons } from '../../assets/icons';
import { Tooltip } from 'react-tooltip';
import { ParameterInput, AllowedDevices } from './types/types';

type SingleSelectInputProps = {
    label: string;
    isItemInArray: (item: string) => boolean;
    addItem: (item: string) => void;
    clearItem: () => void;
    allowedDevices: AllowedDevices;
    description?: string;
    required: boolean;
    styles?: string;
    className?: string;
    value: string;
};
export default function SingleSelectInput(
    {
        label='', 
        isItemInArray, 
        addItem=()=>{}, 
        clearItem=()=>{}, 
        allowedDevices, 
        description='', 
        required=false, 
        styles='', 
        className='',
        value
    }: SingleSelectInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [availableItems, setAvailableItems] = useState(Object.keys(allowedDevices));
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleInputClick = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleItemClick = (item:string) => {
        //refactor this to take an arg that does not close dropdown if we came from an 'enter' key

        if (!isItemInArray(item)) { 
            addItem(item);
            setAvailableItems(availableItems.filter((i) => i !== item));
            setInputValue('');
            setDropdownVisible(false);
        }
    };



    //only used for optional, not yet implemented
    const handleDeleteClick = (e:MouseEvent) => {
        console.log({e})
        e.preventDefault();
        clearItem();
        setAvailableItems(Object.keys(allowedDevices));
    };



    const handleClickOutside = (event:MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setDropdownVisible(false);
        }
    };


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} className={cn("relative w-5/12 max-w-96 border-2 border-slate-300 rounded-lg mt-2 h-fit", className)}>
            <p id={label+'ParamInputTooltip'} className="text-sm pl-4 text-gray-500 border-b border-dashed border-slate-300">{`${label} ${required ? '(required)' : '(optional)'}`}</p>
            <Tooltip anchorSelect={'#' + label + 'ParamInputTooltip'} children={<p className="whitespace-pre-wrap">{description}</p>} place="top" variant="info" style={{'maxWidth' : "500px", 'height': 'fit-content'}} delayShow={400}/> 
            <div className={` flex rounded p-2 hover:cursor-pointer`} onClick={handleInputClick}>
                <div className="w-10/12 flex justify-center">
                    <p className={`${value.length === 0 ? '' : 'px-2 py-1'} w-fit bg-[#DCEAF1] text-sky-900 rounded`}>{value}</p>
                </div>
                <div className="w-2/12">{dropdownVisible ? tailwindIcons.chevronUp : tailwindIcons.chevronDown}</div>

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