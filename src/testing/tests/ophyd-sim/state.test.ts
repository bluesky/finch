import { describe, it, expect, vi } from 'vitest';
import { SimState } from '../../../lib/ophyd-sim/core/state';

describe('SimState', () => {
    it('subscribe-then-set delivers the new value', () => {
        const state = new SimState(() => 1000);
        const listener = vi.fn();
        state.subscribe('IOC:m1', listener);
        listener.mockClear();

        state.set('IOC:m1', 5);
        expect(listener).toHaveBeenCalledWith({
            name: 'IOC:m1',
            value: 5,
            timestamp: 1000,
        });
    });

    it('subscribing after seed replays the latest value synchronously', () => {
        const state = new SimState(() => 1000);
        state.seed('IOC:m1', 42);

        const listener = vi.fn();
        state.subscribe('IOC:m1', listener);

        expect(listener).toHaveBeenCalledWith({
            name: 'IOC:m1',
            value: 42,
            timestamp: 1000,
        });
    });

    it('set returns false and does not notify when value is unchanged', () => {
        const state = new SimState(() => 0);
        state.seed('IOC:m1', 5);
        const listener = vi.fn();
        state.subscribe('IOC:m1', listener);
        listener.mockClear();

        const changed = state.set('IOC:m1', 5);
        expect(changed).toBe(false);
        expect(listener).not.toHaveBeenCalled();
    });

    it('unsubscribe stops further notifications', () => {
        const state = new SimState(() => 0);
        const listener = vi.fn();
        const unsub = state.subscribe('IOC:m1', listener);
        unsub();
        listener.mockClear();

        state.set('IOC:m1', 5);
        expect(listener).not.toHaveBeenCalled();
    });

    it('one subscriber throwing does not stop others', () => {
        const state = new SimState(() => 0);
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const ok = vi.fn();
        state.subscribe('IOC:m1', () => {
            throw new Error('boom');
        });
        state.subscribe('IOC:m1', ok);

        state.set('IOC:m1', 5);
        expect(ok).toHaveBeenCalled();
        errSpy.mockRestore();
    });
});
