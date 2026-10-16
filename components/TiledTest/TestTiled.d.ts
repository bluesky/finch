/**
 * Manual test harness for the Tiled client — every registry endpoint, runnable against a live
 * server.
 *
 * The counterpart to `QServerTest/TestQserver.tsx`, and the thing that makes the client's coverage
 * something you can *see* rather than only read about in a test report. `TiledRegistry.test.ts`
 * proves every spec operation has an implementation; this proves the implementations work.
 *
 * It builds its **own client** rather than using the app-wide one, so changing the URL or key here
 * cannot leak into the rest of the page. The defaults come from `FinchConfigProvider`.
 */
export default function TestTiled(): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TestTiled.d.ts.map