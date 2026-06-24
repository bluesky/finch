type HistogramProps = {
    /** EPICS PV name for the histogram array data. */
    arrayPV: string;
    /** EPICS PV name for the acquire control (1 = start, 0 = stop). */
    acquirePV: string;
    /** EPICS PV name for the exposure setting (default value is in seconds) */
    exposurePV: string;
    /** When `true`, renders the `HistogramDeviceController` below the plot. */
    showDeviceController?: boolean;
    /** When `true`, renders plot settings controls inside `HistogramPlot`. */
    showPlotSettings?: boolean;
    /** Additional class names applied to the `HistogramPlot` element. */
    classNameHistogramPlot?: string;
    /** Additional class names applied to the outer container element. */
    classNameContainer?: string;
    /** Additional class names applied to the `HistogramDeviceController` element. */
    classNameDeviceController?: string;
    /** Additional class names applied to the plot settings element inside `HistogramPlot`. */
    classNamePlotSettings?: string;
    /** When `true`, ignores PV props and simulates histogram data that updates every second. */
    demo?: boolean;
    /** Number of significant figures for sum displays in the plot. Defaults to `6`. */
    precision?: number;
    /** Title displayed at the top of the plot */
    title?: string;
};
export default function Histogram({ arrayPV, acquirePV, exposurePV, showDeviceController, showPlotSettings, classNameContainer, classNameDeviceController, classNameHistogramPlot, classNamePlotSettings, demo, precision, title, }: HistogramProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Histogram.d.ts.map