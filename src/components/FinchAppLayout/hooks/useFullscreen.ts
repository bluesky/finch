import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';

/** Search param that puts the layout in fullscreen, as in `/test/experiment?fullscreen`. */
export const FULLSCREEN_PARAM = 'fullscreen';

/** Key that leaves fullscreen. */
export const FULLSCREEN_EXIT_KEY = 'Escape';

/**
 * Whether a keydown is already handled elsewhere and should not leave fullscreen.
 *
 * Radix menus, popovers and selects call `preventDefault` on the Escape that closes them,
 * and a field being edited may use Escape itself, so neither should also exit.
 */
function isHandledElsewhere(event: KeyboardEvent) {
    if (event.defaultPrevented) {
        return true;
    }
    const target = event.target as HTMLElement | null;
    return (
        !!target &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    );
}

/**
 * Reads and controls fullscreen mode, which lives in the url as `?fullscreen`.
 *
 * Keeping it in the url means a fullscreen view can be bookmarked or opened on a wall
 * display, and it works the same under `BrowserRouter` and `HashRouter`
 * (`#/test?fullscreen`). Pass `listenForExitKey` to leave fullscreen on Escape.
 */
export function useFullscreen({ listenForExitKey = false } = {}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const isFullscreen = searchParams.has(FULLSCREEN_PARAM);

    const setFullscreen = useCallback(
        (value: boolean) => {
            setSearchParams(
                (params) => {
                    const next = new URLSearchParams(params);
                    if (value) {
                        next.set(FULLSCREEN_PARAM, '');
                    } else {
                        next.delete(FULLSCREEN_PARAM);
                    }
                    return next;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const enterFullscreen = useCallback(() => setFullscreen(true), [setFullscreen]);
    const exitFullscreen = useCallback(() => setFullscreen(false), [setFullscreen]);

    useEffect(() => {
        if (!listenForExitKey || !isFullscreen) {
            return;
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === FULLSCREEN_EXIT_KEY && !isHandledElsewhere(event)) {
                exitFullscreen();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [listenForExitKey, isFullscreen, exitFullscreen]);

    return { isFullscreen, enterFullscreen, exitFullscreen };
}
