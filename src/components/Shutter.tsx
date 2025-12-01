import { useEffect, useMemo, useState, useRef } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import useOphydSocket from '../hooks/useOphydSocket';

type ShutterProps = {
    pv?: string;
    valueWhenOpen?: number;
    valueWhenClosed?: number;
    className?: string;
};

export default function Shutter({ 
    pv = 'bl531:LJT4:1:AO0',
    valueWhenOpen = 0,
    valueWhenClosed = 5,
    className = ''
}: ShutterProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const deviceList = useMemo(() => [pv], [pv]);
    const { devices, handleSetValueRequest } = useOphydSocket(deviceList);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);
    
    const shutter = devices[pv];
    console.log({shutter})
    const currentValue = useMemo(() => parseFloat(shutter?.value as string) || 0, [shutter?.value]);
    const isOpen = useMemo(() => currentValue === valueWhenOpen, [currentValue, valueWhenOpen]);
    const isClosed = useMemo(() => currentValue === valueWhenClosed, [currentValue, valueWhenClosed]);

    const getStatusCircle = () => {
        if (isOpen) {
            return (
                <div className={`w-6 h-6 rounded-full animate-pulse bg-green-500`} />
            );
        } else if (isClosed) {
            return (
                <div className={`w-6 h-6 rounded-full animate-pulse bg-yellow-300`} />
            );
        } else {
            // Unknown state - gray circle, non-flashing
            return <div className="w-6 h-6 rounded-full bg-gray-400" />;
        }
    };
    
    const getStatusText = () => {
        if (isOpen) return 'HUTCH SHUTTER OPEN';
        if (isClosed) return 'HUTCH SHUTTER CLOSED';
        return 'HUTCH SHUTTER UNKNOWN';
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleOpenShutter = () => {
        handleSetValueRequest(pv, valueWhenOpen);
        setIsDropdownOpen(false);
    };

    const handleCloseShutter = () => {
        handleSetValueRequest(pv, valueWhenClosed);
        setIsDropdownOpen(false);
    };
    
    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="flex items-center gap-3 p-2">
                {getStatusCircle()}
                <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-sky-900">{getStatusText()}</span>
                    <span className="text-xs text-slate-500">
                        {pv}: {shutter.value || '--'}
                        {shutter?.connected === false && ' (Disconnected)'}
                    </span>
                </div>
                <button
                    onClick={handleDropdownToggle}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Open shutter controls"
                >
                    <CaretDown 
                        size={16} 
                        className={`transform transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                        }`} 
                    />
                </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                        onClick={handleOpenShutter}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-sm">Open Shutter</span>
                        {isOpen && <Check size={16} className="text-green-600" />}
                    </button>
                    <button
                        onClick={handleCloseShutter}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                        <span className="text-sm">Close Shutter</span>
                        {isClosed && <Check size={16} className="text-green-600" />}
                    </button>
                </div>
            )}
        </div>
    );
}