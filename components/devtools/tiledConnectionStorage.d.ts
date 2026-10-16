import { TiledConnectionConfig } from './TiledConnectionBar';
/**
 * Distinguishes harnesses, so they keep separate connections.
 *
 * `playground` is `TiledQueryPlayground`. `endpoint-harness` is reserved for `TestTiled`, which
 * shares the bar but does not persist yet — the name is here so that wiring it up later cannot
 * accidentally land on the playground's entry. `websocket` is `TiledWebsocket`.
 */
export type TiledConnectionStorageKey = 'playground' | 'endpoint-harness' | 'websocket';
/**
 * The stored config, with any field that is missing or malformed taken from `fallback`.
 *
 * Returns `fallback` untouched when nothing is stored, when the entry is not an object, or when
 * `localStorage` is unavailable — Safari private mode and a blocked third-party context both throw
 * on access rather than returning null.
 */
export declare function loadTiledConnection(harness: TiledConnectionStorageKey, fallback: TiledConnectionConfig): TiledConnectionConfig;
/** Writes the committed config. Failures are swallowed: a full quota must not break Apply. */
export declare function saveTiledConnection(harness: TiledConnectionStorageKey, config: TiledConnectionConfig): void;
/** Removes the stored config, including the credentials in it. */
export declare function clearTiledConnection(harness: TiledConnectionStorageKey): void;
/** True when a config is stored, so the bar can say whether *Forget* would do anything. */
export declare function hasStoredTiledConnection(harness: TiledConnectionStorageKey): boolean;
//# sourceMappingURL=tiledConnectionStorage.d.ts.map