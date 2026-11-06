import { Navigate, useLocation } from 'react-router';

/**
 * Redirects to a tab, keeping the current query and hash.
 *
 * A bare `<Navigate>` would drop them, so a url like `/data?fullscreen` would land on
 * the first tab without its params.
 */
export default function RedirectToTab({ to }: { to: string }) {
    const { search, hash } = useLocation();
    return <Navigate to={{ pathname: to, search, hash }} replace />;
}
