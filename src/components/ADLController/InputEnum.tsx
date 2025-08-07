import { useState, useRef, useEffect, CSSProperties } from 'react';
import { tailwindIcons } from '@/assets/icons';

type InputEnumProps = {
    label?: string;
    onSubmit?: (input: number) => void;
    isDisabled?: boolean;
    style?: CSSProperties;
    val?: number | string | boolean;
    enums?: string[] | null;
};

export default function InputEnum({ 
    label = '',
    onSubmit = (input) => { console.log('submit ' + input) },
    isDisabled = false,
    style,
    val,
    enums = ['blank1', 'blank2'] 
}: InputEnumProps) {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const containerRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: { target: any; }) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (typeof val !== 'number') {
        return null; 
    }

    const getCurrentEnum = () => {
        if (val === undefined || !enums || val < 0 || val >= enums.length) return '';
        return enums[val];
    };

    const handleInputClick = () => {
        if (!isDisabled) setDropdownVisible(!dropdownVisible);
    };

    const handleEnumClick = (index: number) => {
        if (val !== index) {
            onSubmit(index);
        }
        setDropdownVisible(false);
    };

    return (
        <div ref={containerRef} className={`${isDisabled ? 'text-slate-400' : 'text-black'} w-1/2 border bg-white border-slate-300 flex w-full max-w-64`} style={style}>
            <div className={` flex flex-col w-full`} onClick={handleInputClick}>
                <div className="flex w-full justify-between">
                    <div className="flex-grow">
                        <p className='text-xs'>{getCurrentEnum()}</p>
                    </div>
                    <div className="flex-shrink-0">{dropdownVisible ? tailwindIcons.chevronUp : tailwindIcons.chevronDown}</div>
                </div>
                <span className="relative w-full">
                    {dropdownVisible && (
                        <ul className="z-10 absolute w-full top-0 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto">
                            {enums ? enums
                                .map((item, index) => (
                                    <li
                                        key={item}
                                        onClick={() => handleEnumClick(index)}
                                        className={`p-2 cursor-pointer hover:bg-gray-200 ${val === index ? 'bg-gray-100 font-medium' : ''}`}
                                    >
                                        {item}
                                    </li>
                                )) : null}
                        </ul>
                    )}
                </span>
            </div>
        </div>
    );
}