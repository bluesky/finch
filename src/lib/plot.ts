import type React from 'react';
import type { PlotParams } from 'react-plotly.js';
import PlotImport from 'react-plotly.js';

/**
 * `react-plotly.js` is CommonJS and exports the component as `exports.default`.
 * finch's `dist/` is true ESM, so under Node's interop rules a consumer's bundler
 * resolves the default import to the whole `module.exports` object rather than to
 * the component. Normalizing here is correct under both interop conventions, so
 * every finch component must import `Plot` from this module instead of the package.
 */
const Plot = ((PlotImport as unknown as { default?: unknown }).default ??
    PlotImport) as React.ComponentType<PlotParams>;

export default Plot;
export type { PlotParams };
