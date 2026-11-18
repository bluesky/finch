import React from 'react';
import { useMemo } from 'react';
import PlotSettings from './PlotSettings';
import CustomChartBackground from './CustomChartBackground';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
//import Portal from '@visx/tooltip/lib/Portal';

export type XYChartProps = {
    defaultHeight?: number;
    plotData: Record<string, number>[];
    domain?: [number, number];
};

export default function VisxLinePlot({ plotData, domain, defaultHeight = 400 }: XYChartProps) {
    const dataWithIndex = useMemo(() => {
        if (!domain) {
            return plotData.map((d, index) => ({ ...d, __index: index }));
        }
        const [minIndex, maxIndex] = domain;
        const startIndex = Math.max(0, Math.floor(minIndex));
        const endIndex = Math.min(plotData.length - 1, Math.floor(maxIndex));
        return plotData.slice(startIndex, endIndex + 1).map((d, arrayIndex) => ({
            ...d,
            __index: startIndex + arrayIndex, // Preserve original indices
        }));
    }, [plotData, domain]);

    const [selectedDataKeys, setSelectedDataKeys] = React.useState<string[]>(
        plotData ? [Object.keys(plotData[0])[0] as string] : [],
    ); //auto display the first key

    return (
        <ParentSize
            style={{ minHeight: defaultHeight }}
            initialSize={{ width: 400, height: defaultHeight }}
        >
            {() => (
                <PlotSettings
                    data={dataWithIndex}
                    dataKeys={selectedDataKeys}
                    setSelectedDataKeys={setSelectedDataKeys}
                >
                    {({
                        accessors,
                        animationTrajectory,
                        annotationDataKey,
                        annotationDatum,
                        annotationLabelPosition,
                        annotationType,
                        colorAccessorFactory,
                        config,
                        curve,
                        data,
                        editAnnotationLabelPosition,
                        numTicks,
                        renderAreaSeries,
                        renderAreaStack,
                        renderBarGroup,
                        renderGlyph,
                        renderGlyphSeries,
                        enableTooltipGlyph,
                        renderTooltipGlyph,
                        renderHorizontally,
                        renderLineSeries,
                        setAnnotationDataIndex,
                        setAnnotationDataKey,
                        setAnnotationLabelPosition,
                        sharedTooltip,
                        showGridColumns,
                        showGridRows,
                        showHorizontalCrosshair,
                        showTooltip,
                        showVerticalCrosshair,
                        snapTooltipToDatumX,
                        snapTooltipToDatumY,
                        stackOffset,
                        theme,
                        xAxisOrientation,
                        yAxisOrientation,
                        dataKeys,
                        Annotation,
                        AreaSeries,
                        AreaStack,
                        Axis,
                        GlyphSeries,
                        Grid,
                        LineSeries,
                        AnnotationCircleSubject,
                        AnnotationConnector,
                        AnnotationLabel,
                        AnnotationLineSubject,
                        Tooltip,
                        XYChart,
                        xAxisLabel,
                    }) => (
                        <XYChart
                            theme={theme}
                            xScale={config.x}
                            yScale={config.y}
                            height={Math.max(400, defaultHeight)}
                            captureEvents={!editAnnotationLabelPosition}
                            onPointerUp={(d) => {
                                if (dataKeys.includes(d.key)) {
                                    setAnnotationDataKey(d.key);
                                    setAnnotationDataIndex(d.index);
                                }
                            }}
                        >
                            <CustomChartBackground />
                            <Grid
                                key={`grid-${animationTrajectory}`}
                                rows={showGridRows}
                                columns={showGridColumns}
                                animationTrajectory={animationTrajectory}
                                numTicks={numTicks}
                            />

                            {renderLineSeries && (
                                <>
                                    {dataKeys.map((key) => (
                                        <LineSeries
                                            key={key}
                                            dataKey={key}
                                            data={data}
                                            xAccessor={accessors.x[key]}
                                            yAccessor={accessors.y[key]}
                                            curve={curve}
                                        />
                                    ))}
                                </>
                            )}

                            {renderAreaSeries && (
                                <>
                                    {dataKeys.map((key) => (
                                        <AreaSeries
                                            key={key}
                                            dataKey={key}
                                            data={data}
                                            xAccessor={accessors.x[key]}
                                            yAccessor={accessors.y[key]}
                                            curve={curve}
                                            fillOpacity={0.4}
                                        />
                                    ))}
                                </>
                            )}

                            {renderAreaStack && (
                                <AreaStack offset={stackOffset}>
                                    {dataKeys.map((key) => (
                                        <AreaSeries
                                            key={key}
                                            dataKey={key}
                                            data={data}
                                            xAccessor={accessors.x[key]}
                                            yAccessor={accessors.y[key]}
                                            curve={curve}
                                        />
                                    ))}
                                </AreaStack>
                            )}

                            {renderGlyphSeries && (
                                <>
                                    {dataKeys.map((key) => (
                                        <GlyphSeries
                                            key={key}
                                            dataKey={key}
                                            data={data}
                                            xAccessor={accessors.x[key]}
                                            yAccessor={accessors.y[key]}
                                            renderGlyph={renderGlyph}
                                            colorAccessor={colorAccessorFactory(key)}
                                        />
                                    ))}
                                </>
                            )}

                            <Axis
                                key={`x-axis-${animationTrajectory}-${renderHorizontally}`}
                                orientation={
                                    renderHorizontally ? yAxisOrientation : xAxisOrientation
                                }
                                numTicks={numTicks}
                                animationTrajectory={animationTrajectory}
                                label={xAxisLabel}
                            />
                            <Axis
                                key={`y-axis-${animationTrajectory}-${renderHorizontally}`}
                                label="Values"
                                orientation={
                                    renderHorizontally ? xAxisOrientation : yAxisOrientation
                                }
                                numTicks={numTicks}
                                animationTrajectory={animationTrajectory}
                            />

                            {annotationDataKey &&
                                annotationDatum &&
                                dataKeys.includes(annotationDataKey) && (
                                    <Annotation
                                        dataKey={annotationDataKey}
                                        datum={annotationDatum}
                                        dx={annotationLabelPosition.dx}
                                        dy={annotationLabelPosition.dy}
                                        editable={editAnnotationLabelPosition}
                                        canEditSubject={false}
                                        onDragEnd={({ dx, dy }) =>
                                            setAnnotationLabelPosition({ dx, dy })
                                        }
                                    >
                                        <AnnotationConnector />
                                        {annotationType === 'circle' ? (
                                            <AnnotationCircleSubject />
                                        ) : (
                                            <AnnotationLineSubject />
                                        )}
                                        <AnnotationLabel
                                            title={annotationDataKey}
                                            subtitle={`Index: ${data.indexOf(annotationDatum)}, Value: ${annotationDatum[annotationDataKey]}`}
                                            width={135}
                                            backgroundProps={{
                                                stroke: theme.gridStyles.stroke,
                                                strokeOpacity: 0.5,
                                                fillOpacity: 0.8,
                                            }}
                                        />
                                    </Annotation>
                                )}

                            {showTooltip && (
                                <Tooltip
                                    showHorizontalCrosshair={showHorizontalCrosshair}
                                    showVerticalCrosshair={showVerticalCrosshair}
                                    snapTooltipToDatumX={snapTooltipToDatumX}
                                    snapTooltipToDatumY={snapTooltipToDatumY}
                                    showDatumGlyph={
                                        (snapTooltipToDatumX || snapTooltipToDatumY) &&
                                        !renderBarGroup
                                    }
                                    showSeriesGlyphs={sharedTooltip && !renderBarGroup}
                                    renderGlyph={
                                        enableTooltipGlyph ? renderTooltipGlyph : undefined
                                    }
                                    renderTooltip={({ tooltipData, colorScale }) => {
                                        const nearestDatum = tooltipData?.nearestDatum;
                                        if (!nearestDatum) return null;

                                        const index = data.indexOf(nearestDatum.datum);
                                        const keysToShow = sharedTooltip
                                            ? Object.keys(tooltipData?.datumByKey ?? {}).filter(
                                                  (key) => dataKeys.includes(key),
                                              )
                                            : [nearestDatum.key].filter(
                                                  (key) => key && dataKeys.includes(key),
                                              );

                                        return (
                                            <div
                                                style={{
                                                    padding: '8px',
                                                    background: 'white',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                <div>
                                                    <strong>Index:</strong> {index}
                                                </div>
                                                <br />
                                                {keysToShow.map((key) => {
                                                    const value = nearestDatum.datum[key];
                                                    return (
                                                        <div key={key}>
                                                            <span
                                                                style={{
                                                                    color: colorScale?.(key),
                                                                    fontWeight:
                                                                        nearestDatum.key === key
                                                                            ? 'bold'
                                                                            : 'normal',
                                                                    textDecoration:
                                                                        nearestDatum.key === key
                                                                            ? 'underline'
                                                                            : 'none',
                                                                }}
                                                            >
                                                                {key}:
                                                            </span>{' '}
                                                            {value == null ||
                                                            Number.isNaN(Number(value))
                                                                ? '–'
                                                                : Number(value).toFixed(2)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }}
                                />
                            )}
                        </XYChart>
                    )}
                </PlotSettings>
            )}
        </ParentSize>
    );
}
