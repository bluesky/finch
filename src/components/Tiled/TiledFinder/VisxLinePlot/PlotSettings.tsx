import React, { useCallback, useMemo, useState } from 'react';
import { lightTheme, darkTheme, XYChartTheme } from '@visx/xychart';
import { PatternLines } from '@visx/pattern';
import { GlyphProps } from '@visx/xychart/lib/types';
import { AnimationTrajectory } from '@visx/react-spring/lib/types';
import { GlyphCross, GlyphDot, GlyphStar } from '@visx/glyph';
import { curveLinear, curveStep, curveCardinal } from '@visx/curve';
import { RenderTooltipGlyphProps } from '@visx/xychart/lib/components/Tooltip';
import customTheme from './customTheme';
import userPrefersReducedMotion from './userPrefersReducedMotion';
import getAnimatedOrUnanimatedComponents from './getAnimatedOrUnanimatedComponents';
//import charline from phosphor icons
import { ChartLine, X } from '@phosphor-icons/react';
import PlotSettingsRow, { SettingConfig } from './PlotSettingsRow';

import './Controls.css';

const linearScaleConfig = { type: 'linear', zero: false } as const;
const numTicks = 4;
const selectedDatumPatternId = 'xychart-selected-datum';

type DataPoint = Record<string, number>;
type Accessor = (d: DataPoint, index?: number) => number | string;

type SimpleScaleConfig = { type: 'band' | 'linear'; paddingInner?: number };
type CustomDomaineScaleConfig = {
    type: 'band' | 'linear';
    domain: [number, number];
    paddingInner?: number;
};

type ProvidedProps = {
    accessors: {
        x: Record<string, Accessor>;
        y: Record<string, Accessor>;
    };
    animationTrajectory?: AnimationTrajectory;
    annotationDataKey: string | null;
    annotationDatum?: DataPoint;
    annotationLabelPosition: { dx: number; dy: number };
    annotationType?: 'line' | 'circle';
    colorAccessorFactory: (key: string) => (d: DataPoint) => string | null;
    config: {
        x: SimpleScaleConfig | CustomDomaineScaleConfig;
        y: SimpleScaleConfig;
    };
    curve: typeof curveLinear | typeof curveCardinal | typeof curveStep;
    data: DataPoint[];
    editAnnotationLabelPosition: boolean;
    numTicks: number;
    setAnnotationDataIndex: (index: number) => void;
    setAnnotationDataKey: (key: string | null) => void;
    setAnnotationLabelPosition: (position: { dx: number; dy: number }) => void;
    renderAreaSeries: boolean;
    renderAreaStack: boolean;
    renderBarGroup: boolean;
    renderBarSeries: boolean;
    renderBarStack: boolean;
    renderGlyph: React.FC<GlyphProps<DataPoint>>;
    renderGlyphSeries: boolean;
    enableTooltipGlyph: boolean;
    renderTooltipGlyph: React.FC<RenderTooltipGlyphProps<DataPoint>>;
    renderHorizontally: boolean;
    renderLineSeries: boolean;
    sharedTooltip: boolean;
    showGridColumns: boolean;
    showGridRows: boolean;
    showHorizontalCrosshair: boolean;
    showTooltip: boolean;
    showVerticalCrosshair: boolean;
    snapTooltipToDatumX: boolean;
    snapTooltipToDatumY: boolean;
    stackOffset?: 'wiggle' | 'expand' | 'diverging' | 'silhouette';
    theme: XYChartTheme;
    xAxisOrientation: 'top' | 'bottom';
    yAxisOrientation: 'left' | 'right';
    xAxisLabel: string;
    dataKeys: string[];
} & ReturnType<typeof getAnimatedOrUnanimatedComponents>;

type PlotSettingsProps = {
    children: (props: ProvidedProps) => React.ReactNode;
    data: DataPoint[];
    dataKeys: string[];
    setSelectedDataKeys: React.Dispatch<React.SetStateAction<string[]>>;
    domain?: [number, number];
};

export default function PlotSettings({
    children,
    data,
    dataKeys,
    setSelectedDataKeys,
    domain,
}: PlotSettingsProps) {
    const [settings, setSettings] = useState({
        xAxisKey: Object.keys(data[0]).includes('time') ? 'time' : ('__index' as string),
        theme: lightTheme,
        useAnimatedComponents: !userPrefersReducedMotion(),
        animationTrajectory: 'center' as AnimationTrajectory | undefined,
        gridRows: false,
        gridColumns: false,
        xAxisOrientation: 'bottom' as 'top' | 'bottom',
        yAxisOrientation: 'left' as 'left' | 'right',
        renderHorizontally: false,
        showTooltip: true,
        annotationDataKey: null as string | null,
        annotationType: 'circle' as 'line' | 'circle',
        showVerticalCrosshair: true,
        showHorizontalCrosshair: false,
        snapTooltipToDatumX: true,
        snapTooltipToDatumY: true,
        sharedTooltip: true,
        renderBarStackOrGroup: 'none' as 'bar' | 'barstack' | 'bargroup' | 'none',
        renderAreaLineOrStack: 'line' as 'line' | 'area' | 'areastack' | 'none',
        stackOffset: undefined as 'wiggle' | 'expand' | 'diverging' | 'silhouette' | undefined,
        renderGlyphSeries: false,
        editAnnotationLabelPosition: false,
        annotationLabelPosition: { dx: -40, dy: -20 },
        annotationDataIndex: 0,
        glyphComponent: 'star' as 'star' | 'cross' | 'circle' | '🍍',
        curveType: 'linear' as 'linear' | 'cardinal' | 'step',
        enableTooltipGlyph: false,
        tooltipGlyphComponent: 'star' as 'star' | 'cross' | 'circle' | '🍍',
    });
    const [showSettings, setShowSettings] = useState<boolean>(false);

    // Generic settings updater
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateSetting = useCallback((key: string, value: any) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Handle special cases for settings that affect other settings
    const handleSettingsChange = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (key: string, value: any) => {
            if (
                key === 'renderAreaLineOrStack' &&
                (value === 'line' || value === 'area' || value === 'areastack')
            ) {
                setSettings((prev) => ({
                    ...prev,
                    [key]: value,
                    renderBarStackOrGroup:
                        prev.renderBarStackOrGroup === 'barstack' ||
                        prev.renderBarStackOrGroup === 'bargroup'
                            ? 'none'
                            : prev.renderBarStackOrGroup,
                }));
            } else if (key === 'renderAreaLineOrStack' && value === 'areastack') {
                setSettings((prev) => ({
                    ...prev,
                    [key]: value,
                    renderBarStackOrGroup: 'none',
                }));
            } else {
                updateSetting(key, value);
            }
        },
        [updateSetting],
    );

    const allowableDataKeys = useMemo(() => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]).filter((key) => key !== '__index');
    }, [data]);

    // Settings configuration
    const settingsConfig: Record<string, SettingConfig> = useMemo(
        () => ({
            xAxis: {
                type: 'radio',
                currentValue: settings.xAxisKey,
                options: [
                    { value: '__index', label: 'Array Index' },
                    ...allowableDataKeys.map((key) => ({
                        value: key,
                        label: key,
                        disabled: dataKeys.includes(key), // Disable if already selected as Y-axis
                    })),
                ],
            },
            theme: {
                type: 'radio',
                currentValue:
                    settings.theme === lightTheme
                        ? 'light'
                        : settings.theme === darkTheme
                          ? 'dark'
                          : 'custom',
                options: [
                    { value: 'light', label: 'light' },
                    { value: 'dark', label: 'dark' },
                    { value: 'custom', label: 'custom' },
                ],
            },
            renderAreaLineOrStack: {
                type: 'radio',
                currentValue: settings.renderAreaLineOrStack,
                options: [
                    { value: 'line', label: 'line' },
                    { value: 'area', label: 'area' },
                    { value: 'areastack', label: 'area stack' },
                    { value: 'none', label: 'none' },
                ],
            },
            curveType: {
                type: 'radio',
                currentValue: settings.curveType,
                options: [
                    {
                        value: 'linear',
                        label: 'linear',
                        disabled: settings.renderAreaLineOrStack === 'none',
                    },
                    {
                        value: 'cardinal',
                        label: 'cardinal (smooth)',
                        disabled: settings.renderAreaLineOrStack === 'none',
                    },
                    {
                        value: 'step',
                        label: 'step',
                        disabled: settings.renderAreaLineOrStack === 'none',
                    },
                ],
            },
            renderGlyphSeries: {
                type: 'checkbox',
                currentValue: settings.renderGlyphSeries,
                options: [{ value: true, label: 'render glyphs' }],
            },
            glyphComponent: {
                type: 'radio',
                currentValue: settings.glyphComponent,
                options: [
                    { value: 'circle', label: 'circle', disabled: !settings.renderGlyphSeries },
                    { value: 'star', label: 'star', disabled: !settings.renderGlyphSeries },
                    { value: 'cross', label: 'cross', disabled: !settings.renderGlyphSeries },
                    { value: '🍍', label: '🍍', disabled: !settings.renderGlyphSeries },
                ],
            },
            showTooltip: {
                type: 'checkbox',
                currentValue: settings.showTooltip,
                options: [{ value: true, label: 'show tooltip' }],
            },
            showVerticalCrosshair: {
                type: 'checkbox',
                currentValue: settings.showVerticalCrosshair,
                options: [{ value: true, label: 'vertical crosshair' }],
            },
            showHorizontalCrosshair: {
                type: 'checkbox',
                currentValue: settings.showHorizontalCrosshair,
                options: [{ value: true, label: 'horizontal crosshair' }],
            },
            grid: {
                type: 'radio',
                currentValue: `${settings.gridRows}-${settings.gridColumns}`,
                options: [
                    { value: 'true-false', label: 'rows' },
                    { value: 'false-true', label: 'columns' },
                    { value: 'true-true', label: 'both' },
                    { value: 'false-false', label: 'none' },
                ],
            },
            useAnimatedComponents: {
                type: 'checkbox',
                currentValue: settings.useAnimatedComponents,
                options: [{ value: true, label: 'use animated components' }],
            },
        }),
        [settings, allowableDataKeys, dataKeys],
    );

    // Handle special theme changes
    const handleThemeChange = useCallback(
        (value: string | boolean) => {
            if (value === 'light') updateSetting('theme', lightTheme);
            else if (value === 'dark') updateSetting('theme', darkTheme);
            else if (value === 'custom') updateSetting('theme', customTheme);
        },
        [updateSetting],
    );

    // Handle grid changes
    const handleGridChange = useCallback(
        (value: string | boolean) => {
            const [rows, columns] = (value as string).split('-');
            updateSetting('gridRows', rows === 'true');
            updateSetting('gridColumns', columns === 'true');
        },
        [updateSetting],
    );

    const accessors = useMemo(() => {
        const xAccessors: Record<string, Accessor> = {};
        const yAccessors: Record<string, Accessor> = {};

        dataKeys.forEach((key) => {
            // X-axis: use selected key or default to index
            xAccessors[key] = (d, index = 0) => {
                if (settings.xAxisKey === '__index') {
                    return d?.__index || index;
                }
                return Number(d[settings.xAxisKey]) || 0;
            };
            // Y-axis uses the actual data value for that key
            yAccessors[key] = (d) => Number(d[key]) || 0;
        });

        return { x: xAccessors, y: yAccessors };
    }, [dataKeys, settings.xAxisKey]);

    const config = useMemo(
        () => ({
            x: domain
                ? ({ type: 'linear', domain: domain, zero: false } as const)
                : linearScaleConfig,
            y: linearScaleConfig,
        }),
        [domain],
    );

    const glyphOutline = settings.theme.gridStyles.stroke;

    const renderGlyph = useCallback(
        ({
            x,
            y,
            size,
            color,
            onPointerMove,
            onPointerOut,
            onPointerUp,
        }: GlyphProps<DataPoint>) => {
            const handlers = { onPointerMove, onPointerOut, onPointerUp };
            if (settings.glyphComponent === 'star') {
                return (
                    <GlyphStar
                        left={x}
                        top={y}
                        stroke={glyphOutline}
                        fill={color}
                        size={size * 10}
                        {...handlers}
                    />
                );
            }
            if (settings.glyphComponent === 'circle') {
                return (
                    <GlyphDot
                        left={x}
                        top={y}
                        stroke={glyphOutline}
                        fill={color}
                        r={size / 2}
                        {...handlers}
                    />
                );
            }
            if (settings.glyphComponent === 'cross') {
                return (
                    <GlyphCross
                        left={x}
                        top={y}
                        stroke={glyphOutline}
                        fill={color}
                        size={size * 10}
                        {...handlers}
                    />
                );
            }
            return (
                <text x={x} y={y} dx="-0.75em" dy="0.25em" fontSize={14} {...handlers}>
                    🍍
                </text>
            );
        },
        [settings.glyphComponent, glyphOutline],
    );
    const renderTooltipGlyph = useCallback(
        ({
            x,
            y,
            size,
            color,
            onPointerMove,
            onPointerOut,
            onPointerUp,
            isNearestDatum,
        }: RenderTooltipGlyphProps<DataPoint>) => {
            const handlers = { onPointerMove, onPointerOut, onPointerUp };
            if (settings.tooltipGlyphComponent === 'star') {
                return (
                    <GlyphStar
                        left={x}
                        top={y}
                        stroke={glyphOutline}
                        fill={color}
                        size={size * 10}
                        {...handlers}
                    />
                );
            }
            if (settings.tooltipGlyphComponent === 'circle') {
                return (
                    <GlyphDot
                        left={x}
                        top={y}
                        stroke={glyphOutline}
                        fill={color}
                        r={size}
                        {...handlers}
                    />
                );
            }
            if (settings.tooltipGlyphComponent === 'cross') {
                return (
                    <GlyphCross
                        left={x}
                        top={y}
                        stroke={glyphOutline}
                        fill={color}
                        size={size * 10}
                        {...handlers}
                    />
                );
            }
            return (
                <text x={x} y={y} dx="-0.75em" dy="0.25em" fontSize={14} {...handlers}>
                    {isNearestDatum ? '🍍' : '🍌'}
                </text>
            );
        },
        [settings.tooltipGlyphComponent, glyphOutline],
    );

    const colorAccessorFactory = useCallback(
        (dataKey: string) => (d: DataPoint) =>
            settings.annotationDataKey === dataKey && d === data[settings.annotationDataIndex]
                ? `url(#${selectedDatumPatternId})`
                : null,
        [settings.annotationDataIndex, settings.annotationDataKey, data],
    );

    const canSnapTooltipToDatum =
        settings.renderBarStackOrGroup !== 'barstack' &&
        settings.renderAreaLineOrStack !== 'areastack';

    return (
        <>
            {children({
                accessors,
                animationTrajectory: settings.animationTrajectory,
                annotationDataKey: settings.annotationDataKey,
                annotationDatum: data[settings.annotationDataIndex],
                annotationLabelPosition: settings.annotationLabelPosition,
                annotationType: settings.annotationType,
                colorAccessorFactory,
                config,
                curve:
                    (settings.curveType === 'cardinal' && curveCardinal) ||
                    (settings.curveType === 'step' && curveStep) ||
                    curveLinear,
                data,
                editAnnotationLabelPosition: settings.editAnnotationLabelPosition,
                numTicks,
                renderAreaSeries: settings.renderAreaLineOrStack === 'area',
                renderAreaStack: settings.renderAreaLineOrStack === 'areastack',
                renderBarGroup: settings.renderBarStackOrGroup === 'bargroup',
                renderBarSeries: settings.renderBarStackOrGroup === 'bar',
                renderBarStack: settings.renderBarStackOrGroup === 'barstack',
                renderGlyph,
                renderGlyphSeries: settings.renderGlyphSeries,
                enableTooltipGlyph: settings.enableTooltipGlyph,
                renderTooltipGlyph,
                renderHorizontally: settings.renderHorizontally,
                renderLineSeries: settings.renderAreaLineOrStack === 'line',
                setAnnotationDataIndex: (index: number) =>
                    updateSetting('annotationDataIndex', index),
                setAnnotationDataKey: (key: string | null) =>
                    updateSetting('annotationDataKey', key),
                setAnnotationLabelPosition: (position: { dx: number; dy: number }) =>
                    updateSetting('annotationLabelPosition', position),
                sharedTooltip: settings.sharedTooltip,
                showGridColumns: settings.gridColumns,
                showGridRows: settings.gridRows,
                showHorizontalCrosshair: settings.showHorizontalCrosshair,
                showTooltip: settings.showTooltip,
                showVerticalCrosshair: settings.showVerticalCrosshair,
                snapTooltipToDatumX: canSnapTooltipToDatum && settings.snapTooltipToDatumX,
                snapTooltipToDatumY: canSnapTooltipToDatum && settings.snapTooltipToDatumY,
                stackOffset: settings.stackOffset,
                theme: settings.theme,
                xAxisOrientation: settings.xAxisOrientation,
                yAxisOrientation: settings.yAxisOrientation,
                xAxisLabel: settings.xAxisKey === '__index' ? 'Index' : settings.xAxisKey, // Add this line
                dataKeys,
                ...getAnimatedOrUnanimatedComponents(settings.useAnimatedComponents),
            })}

            <svg className="pattern-lines">
                <PatternLines
                    id={selectedDatumPatternId}
                    width={6}
                    height={6}
                    orientation={['diagonalRightToLeft']}
                    stroke={settings.theme?.axisStyles.x.bottom.axisLine.stroke}
                    strokeWidth={1.5}
                />
            </svg>

            <div className="w-full flex flex-col justify-center gap-8 pl-4">
                <span
                    className="flex gap-2 items-center w-full hover:cursor-pointer hover:text-slate-500"
                    onClick={() => setShowSettings(!showSettings)}
                >
                    <ChartLine size={24} /> {showSettings ? 'Hide' : 'Show'} Plot Settings
                </span>

                <div className={'controls' + (showSettings ? '' : ' hidden')}>
                    <PlotSettingsRow title="X-Axis" className="items-start">
                        <div className="flex flex-col gap-2">
                            <select
                                className="w-36 border border-slate-200"
                                value={settings.xAxisKey}
                                onChange={(e) => updateSetting('xAxisKey', e.target.value)}
                            >
                                <option value="__index">Array Index</option>
                                {allowableDataKeys.map((key) => (
                                    <option key={key} value={key} disabled={dataKeys.includes(key)}>
                                        {key} {dataKeys.includes(key) ? '(used in Y-axis)' : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-600">
                                Current:{' '}
                                {settings.xAxisKey === '__index'
                                    ? 'Array Index'
                                    : settings.xAxisKey}
                            </p>
                        </div>
                    </PlotSettingsRow>
                    <PlotSettingsRow title="Values" className="items-start">
                        <div className="flex flex-wrap">
                            <select
                                className="w-36 h-24 flex-shrink-0 border border-slate-200"
                                multiple
                                value={dataKeys}
                                onChange={(e) => {
                                    const clickedValue = e.target.value;

                                    // Toggle the clicked item
                                    setSelectedDataKeys((prev) => {
                                        if (prev.includes(clickedValue)) {
                                            // Remove if already selected
                                            return prev.filter((key) => key !== clickedValue);
                                        } else {
                                            // Add if not selected
                                            return [...prev, clickedValue];
                                        }
                                    });
                                }}
                            >
                                {allowableDataKeys.map((key) => (
                                    <option className="pl-2 text-ellipsis" key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                            <div className="flex flex-wrap items-start">
                                {dataKeys.map((key) => (
                                    <span
                                        onClick={() =>
                                            setSelectedDataKeys((prev) =>
                                                prev.filter((k) => k !== key),
                                            )
                                        }
                                        key={key}
                                        className="flex items-center mx-2 hover:cursor-pointer text-slate-400 hover:text-red-500"
                                    >
                                        {key} <X size={12} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </PlotSettingsRow>

                    <PlotSettingsRow
                        title="Theme"
                        setting={settingsConfig.theme}
                        handleChange={handleThemeChange}
                    />

                    <PlotSettingsRow
                        title="Series"
                        setting={settingsConfig.renderAreaLineOrStack}
                        handleChange={(value) =>
                            handleSettingsChange('renderAreaLineOrStack', value)
                        }
                    />

                    <PlotSettingsRow
                        title="Curve Shape"
                        setting={settingsConfig.curveType}
                        handleChange={(value) => updateSetting('curveType', value)}
                    />

                    <PlotSettingsRow
                        title="Glyph Series"
                        setting={settingsConfig.renderGlyphSeries}
                        handleChange={(value) => updateSetting('renderGlyphSeries', value)}
                    />

                    <PlotSettingsRow
                        title="Glyph Type"
                        setting={settingsConfig.glyphComponent}
                        handleChange={(value) => updateSetting('glyphComponent', value)}
                    />

                    <PlotSettingsRow
                        title="Tooltip"
                        setting={settingsConfig.showTooltip}
                        handleChange={(value) => updateSetting('showTooltip', value)}
                    />

                    <PlotSettingsRow
                        title="Grid"
                        setting={settingsConfig.grid}
                        handleChange={handleGridChange}
                    />

                    <PlotSettingsRow
                        title="Animation"
                        setting={settingsConfig.useAnimatedComponents}
                        handleChange={(value) => updateSetting('useAnimatedComponents', value)}
                    />
                </div>
            </div>
        </>
    );
}
