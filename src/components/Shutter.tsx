import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CaretDown, Check } from '@phosphor-icons/react';
import useOphydPVSocket from '../api/ophyd/useOphydPVSocket';
import { cn } from '@/lib/utils';

type ShutterState = 'open' | 'closed' | 'unknown' | 'disconnected';

type ShutterProps = {
    /** EPICS process variable name for the shutter device. Defaults to 'bl531:LJT4:1:AO0'. */
    pv?: string;
    /** The numeric PV value that indicates the shutter is open. Defaults to 0. */
    valueWhenOpen?: number;
    /** The numeric PV value that indicates the shutter is closed. Defaults to 5. */
    valueWhenClosed?: number;
    /** Additional CSS classes applied to the root container div. */
    className?: string;
    /** Additional CSS classes applied to the inner content row (e.g. to adjust padding/height). */
    classNameContent?: string;
    /** Additional CSS classes applied to the dropdown control panel. */
    classNameDropdown?: string;
    /** Additional CSS classes applied to the status circle when the shutter is open. */
    classNameStatusCircleOpen?: string;
    /** Additional CSS classes applied to the status circle when the shutter is closed. */
    classNameStatusCircleClosed?: string;
    /** Additional CSS classes applied to the status circle when the device is disconnected or in an unknown state. */
    classNameStatusCircleDisconnected?: string;
};

/** Per-state presentation: the status circle, the state pill, and the readable label. */
const STATE_STYLES: Record<
    ShutterState,
    { circle: string; pill: string; label: string; status: string }
> = {
    open: {
        circle: 'bg-green-500 animate-pulse',
        pill: 'bg-green-100 text-green-700',
        label: 'Open',
        status: 'HUTCH SHUTTER OPEN',
    },
    closed: {
        circle: 'bg-yellow-300',
        pill: 'bg-yellow-100 text-yellow-800',
        label: 'Closed',
        status: 'HUTCH SHUTTER CLOSED',
    },
    unknown: {
        circle: 'bg-gray-400',
        pill: 'bg-gray-100 text-gray-600',
        label: 'Unknown',
        status: 'HUTCH SHUTTER UNKNOWN',
    },
    disconnected: {
        circle: 'bg-gray-400',
        pill: 'bg-gray-100 text-gray-600',
        label: 'Disconnected',
        status: 'HUTCH SHUTTER DISCONNECTED',
    },
};

export default function Shutter({
    pv = 'bl531:LJT4:1:AO0',
    valueWhenOpen = 0,
    valueWhenClosed = 5,
    className = '',
    classNameContent = '',
    classNameDropdown = '',
    classNameStatusCircleOpen = '',
    classNameStatusCircleClosed = '',
    classNameStatusCircleDisconnected = '',
    ...props
}: ShutterProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    // Screen-space position for the portaled menu (fixed-positioned).
    const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number }>({
        top: 0,
        left: 0,
        width: 0,
    });
    const deviceList = useMemo(() => [pv], [pv]);
    const { devices, handleSetValueRequest } = useOphydPVSocket(deviceList);

    // The menu is portaled to <body> so it overlays sibling components instead of
    // being clipped by an ancestor's overflow/stacking context. That means we must
    // position it manually from the trigger's on-screen rect.
    useLayoutEffect(() => {
        if (!isDropdownOpen) return;

        const updatePosition = () => {
            const rect = dropdownRef.current?.getBoundingClientRect();
            if (!rect) return;
            setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isDropdownOpen]);

    // Close dropdown when clicking outside the trigger or the portaled menu.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                menuRef.current &&
                !menuRef.current.contains(target)
            ) {
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
    const currentValue = useMemo(() => parseFloat(shutter?.value as string) || 0, [shutter?.value]);
    const isOpen = useMemo(() => currentValue === valueWhenOpen, [currentValue, valueWhenOpen]);
    const isClosed = useMemo(
        () => currentValue === valueWhenClosed,
        [currentValue, valueWhenClosed],
    );

    const state: ShutterState = useMemo(() => {
        if (shutter?.connected === false) return 'disconnected';
        if (isOpen) return 'open';
        if (isClosed) return 'closed';
        return 'unknown';
    }, [shutter?.connected, isOpen, isClosed]);

    const styles = STATE_STYLES[state];

    // Circle color is state-driven; the per-state className overrides keep the
    // existing customization points working.
    const circleOverride =
        state === 'open'
            ? classNameStatusCircleOpen
            : state === 'closed'
              ? classNameStatusCircleClosed
              : classNameStatusCircleDisconnected;

    // Formatted PV readout. Handles a 0 value (which is falsy) instead of
    // dropping to '--', trims pointless trailing decimals, and appends units.
    const valueLabel = useMemo(() => {
        const raw = shutter?.value;
        if (shutter?.connected === false || raw === undefined || raw === null || raw === '') {
            return '--';
        }
        const num = Number(raw);
        if (!Number.isFinite(num)) return String(raw);
        const formatted = Number.isInteger(num) ? num.toString() : num.toFixed(2);
        return shutter?.units ? `${formatted} ${shutter.units}` : formatted;
    }, [shutter?.value, shutter?.connected, shutter?.units]);

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
        <div
            className={cn(
                'relative rounded-lg border border-gray-200 bg-white shadow-sm',
                className,
            )}
            ref={dropdownRef}
            {...props}
        >
            <div className={cn('flex items-center gap-3 px-3 py-3', classNameContent)}>
                <div
                    className={cn('h-6 w-6 shrink-0 rounded-full', styles.circle, circleOverride)}
                />
                <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-sky-900">{styles.status}</span>
                        <span
                            className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                styles.pill,
                            )}
                        >
                            {styles.label}
                        </span>
                    </div>
                    <span className="text-xs text-slate-500">
                        <span className="font-mono">{pv}</span>
                        <span className="mx-1 text-slate-300">·</span>
                        <span className="tabular-nums">{valueLabel}</span>
                    </span>
                </div>
                <button
                    onClick={handleDropdownToggle}
                    className="rounded p-1.5 text-slate-600 transition-colors hover:bg-gray-100"
                    aria-label="Open shutter controls"
                    aria-expanded={isDropdownOpen}
                >
                    <CaretDown
                        size={16}
                        className={`transform transition-transform ${
                            isDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>
            </div>

            {/*
             * Dropdown menu, portaled to <body> as a fixed-position overlay so it
             * renders above sibling components regardless of ancestor overflow or
             * stacking contexts (e.g. when the shutter lives in the app header).
             */}
            {isDropdownOpen &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: 'fixed',
                            top: menuPos.top,
                            left: menuPos.left,
                            width: menuPos.width,
                        }}
                        className={cn(
                            'z-50 overflow-hidden rounded-md border border-gray-200 bg-white text-slate-800 shadow-lg',
                            classNameDropdown,
                        )}
                    >
                        <button
                            onClick={handleOpenShutter}
                            className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-gray-50"
                        >
                            <span className="flex items-center gap-2 text-sm text-slate-800">
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                Open Shutter
                            </span>
                            {isOpen && <Check size={16} className="text-green-600" />}
                        </button>
                        <button
                            onClick={handleCloseShutter}
                            className="flex w-full items-center justify-between border-t border-gray-100 px-3 py-2 text-left transition-colors hover:bg-gray-50"
                        >
                            <span className="flex items-center gap-2 text-sm text-slate-800">
                                <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                                Close Shutter
                            </span>
                            {isClosed && <Check size={16} className="text-green-600" />}
                        </button>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
