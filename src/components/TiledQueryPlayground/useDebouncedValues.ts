import { useEffect, useRef, useState } from 'react';

/**
 * Settle a value before anything expensive reads it.
 *
 * Query inputs feed straight into a hook's arguments, which means they feed into its **query key** —
 * so without this, typing a 53-character node path produced 53 keys: 53 cache entries, and a request
 * fired and cancelled for each one. The inspector filled with `tablePath: "4"`, `"4e"`, `"4e4"` and
 * the real request was the last of a burst.
 *
 * Debouncing here rather than in the editors keeps typing instant — the editors hold their own text
 * locally — while the hook sees a value that has stopped moving.
 *
 * The delay is deliberately short. Long enough to coalesce typing, short enough that nobody wonders
 * whether the tool is broken; the usual advice of 500ms+ is for autocomplete against someone else's
 * rate limit, not for a dev harness pointed at a server on the same machine.
 */
const DEFAULT_DELAY_MS = 250;

export function useDebouncedValue<T>(value: T, delay = DEFAULT_DELAY_MS): T {
    const [settled, setSettled] = useState(value);
    // Compared by value: the caller rebuilds the values object on every keystroke, so an identity
    // check would reset the timer forever and never settle.
    const serialized = JSON.stringify(value);
    const latest = useRef(value);
    latest.current = value;

    useEffect(() => {
        const timer = setTimeout(() => setSettled(latest.current), delay);
        return () => clearTimeout(timer);
    }, [serialized, delay]);

    return settled;
}

/** Whether a debounced value is still catching up, for a "settling" hint in the UI. */
export function isSettling<T>(value: T, settled: T): boolean {
    return JSON.stringify(value) !== JSON.stringify(settled);
}
