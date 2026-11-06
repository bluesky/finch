import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

/** Search param that puts the layout in fullscreen, as in `/test/experiment?fullscreen`. */
export const FULLSCREEN_PARAM = 'fullscreen';

/**
 * Adds or removes the fullscreen param from a search string, keeping every other param.
 *
 * Returns the search with its leading `?`, or an empty string when no params remain.
 */
export function withFullscreenParam(search: string, isFullscreen: boolean) {
    const params = new URLSearchParams(search);
    if (isFullscreen) {
        params.set(FULLSCREEN_PARAM, '');
    } else {
        params.delete(FULLSCREEN_PARAM);
    }
    // Writes a bare `fullscreen` rather than `fullscreen=`, matching the url people type.
    const next = params
        .toString()
        .replace(new RegExp(`(^|&)${FULLSCREEN_PARAM}=(?=&|$)`), `$1${FULLSCREEN_PARAM}`);
    return next ? `?${next}` : '';
}

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
    const location = useLocation();
    const navigate = useNavigate();
    const isFullscreen = new URLSearchParams(location.search).has(FULLSCREEN_PARAM);

    // Navigates rather than calling `setSearchParams`, which would drop the hash.
    const setFullscreen = useCallback(
        (value: boolean) => {
            navigate(
                {
                    pathname: location.pathname,
                    search: withFullscreenParam(location.search, value),
                    hash: location.hash,
                },
                { replace: true },
            );
        },
        [navigate, location.pathname, location.search, location.hash],
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
