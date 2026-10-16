import { TiledApiKeyLocation, TiledApiKeyScheme } from '../../api/tiled';
/**
 * Server and credentials for a Tiled dev harness.
 *
 * Presentational: it owns the form state and hands back a committed config. What a harness does
 * with that is its own business — `TestTiled` builds a client directly, the query playground feeds
 * it to a `TiledApiProvider`.
 *
 * **Apply is explicit.** Committing on every keystroke would rebuild the client, which in the
 * playground remounts every live query and fires a request per character typed. The form stages
 * edits and the bar says when they are uncommitted.
 */
export interface TiledConnectionConfig {
    /** Must include the `/api/v1` segment; nothing appends it. */
    baseUrl: string;
    /** Prefix prepended to relative paths. Part of the cache scope, which is why it is here. */
    initialPath: string;
    apiKey: string;
    apiKeyScheme: TiledApiKeyScheme;
    apiKeyLocation: TiledApiKeyLocation;
    /** Sent as `Authorization: Bearer …`; takes precedence over the API key. */
    accessToken: string;
    /** The other half of the session, so the 401 refresh path can be exercised by hand. */
    refreshToken: string;
    /**
     * Whether tokens go to `localStorage` rather than to an in-memory store.
     *
     * Off by default, and that default matters: the browser keys (`tiledAccessToken` /
     * `tiledRefreshToken`) are **shared with the `<Tiled>` viewer component**, so an experimental
     * token typed here would otherwise change the session for the rest of the app.
     */
    useBrowserStorage: boolean;
}
export interface TiledConnectionBarProps {
    /** The committed config — what the harness is actually using. */
    applied: TiledConnectionConfig;
    onApply: (config: TiledConnectionConfig) => void;
    /**
     * Drops a persisted copy of this config, if the harness keeps one.
     *
     * Supplying it renders *Forget*. The harness owns the storage — see `tiledConnectionStorage` —
     * because what a committed config is worth saving to is its business, not the form's.
     */
    onForget?: () => void;
    /** Rendered beside the controls: version, auth mode, whatever the harness knows. */
    status?: React.ReactNode;
    /** Extra controls (sweep buttons, counters) rendered on the action row. */
    actions?: React.ReactNode;
}
export default function TiledConnectionBar({ applied, onApply, onForget, status, actions, }: TiledConnectionBarProps): import("react/jsx-runtime").JSX.Element;
/** A config pointing nowhere, for a harness that has not read its Finch config yet. */
export declare function emptyTiledConnection(baseUrl?: string): TiledConnectionConfig;
//# sourceMappingURL=TiledConnectionBar.d.ts.map