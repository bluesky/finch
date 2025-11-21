import { useEffect, useMemo, useState } from 'react';
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
    const deviceList = useMemo(() => [pv], [pv]);
    const { devices } = useOphydSocket(deviceList);
    
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
    
    return (
        <div className={`flex items-center gap-3 p-2 ${className}`}>
            {getStatusCircle()}
            <div className="flex flex-col">
                <span className="text-sm font-medium">{getStatusText()}</span>
                <span className="text-xs text-gray-500">
                    {pv}: {shutter.value || '--'}
                    {shutter?.connected === false && ' (Disconnected)'}
                </span>
            </div>
        </div>
    );
}