import { describe, it, expect } from 'vitest';
import {
    geometryToPlotlyShape,
    markersToScatterTrace,
    parsePlotlyPath,
    plotlyShapeToGeometry,
    SCATTER_GL_THRESHOLD,
} from '../../utils/plotlyShapes';
import { flattenPoints, hitTestGeometry } from '../../utils/annotationGeometry';

describe('geometryToPlotlyShape / plotlyShapeToGeometry', () => {
    it('round-trips a rectangle', () => {
        const rect = { type: 'rect' as const, x0: 1, y0: 2, x1: 30, y1: 40 };
        const shape = geometryToPlotlyShape(rect)!;
        expect(shape).toMatchObject({
            type: 'rect',
            x0: 1,
            y0: 2,
            x1: 30,
            y1: 40,
            xref: 'x',
            yref: 'y',
        });
        expect(plotlyShapeToGeometry(shape)).toEqual(rect);
    });

    it('maps an ellipse to a Plotly circle and back', () => {
        const ellipse = { type: 'ellipse' as const, x0: 0, y0: 0, x1: 10, y1: 4 };
        const shape = geometryToPlotlyShape(ellipse)!;
        expect(shape.type).toBe('circle');
        expect(plotlyShapeToGeometry(shape)).toEqual(ellipse);
    });

    it('round-trips a polygon as a closed path', () => {
        const polygon = {
            type: 'polygon' as const,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10],
            ] as [number, number][],
        };
        const shape = geometryToPlotlyShape(polygon)!;
        expect(shape.type).toBe('path');
        expect(shape.path).toBe('M0,0L10,0L10,10L0,10Z');
        // Marked as a filled closed path, as Plotly's drawclosedpath emits it.
        expect(shape.fillrule).toBe('evenodd');
        expect(plotlyShapeToGeometry(shape)).toEqual(polygon);
    });

    it('leaves open line paths without a fill rule', () => {
        const line = {
            type: 'line' as const,
            points: [
                [0, 0],
                [1, 1],
                [2, 0],
            ] as [number, number][],
        };
        expect(geometryToPlotlyShape(line)!.fillrule).toBeUndefined();
    });

    it('maps a two-point line to a Plotly line and a longer one to an open path', () => {
        const two = {
            type: 'line' as const,
            points: [
                [0, 0],
                [5, 5],
            ] as [number, number][],
        };
        expect(geometryToPlotlyShape(two)).toMatchObject({
            type: 'line',
            x0: 0,
            y0: 0,
            x1: 5,
            y1: 5,
        });
        expect(plotlyShapeToGeometry(geometryToPlotlyShape(two)!)).toEqual(two);

        const three = {
            type: 'line' as const,
            points: [
                [0, 0],
                [5, 5],
                [10, 0],
            ] as [number, number][],
        };
        const shape = geometryToPlotlyShape(three)!;
        expect(shape).toMatchObject({ type: 'path', path: 'M0,0L5,5L10,0' });
        expect(plotlyShapeToGeometry(shape)).toEqual(three);
    });

    it('carries stroke, width, dash and fill into Plotly styling', () => {
        const shape = geometryToPlotlyShape(
            { type: 'rect', x0: 0, y0: 0, x1: 1, y1: 1 },
            { stroke: '#ff0000', strokeWidth: 3, dash: [4, 3], fill: '#00ff00', fillOpacity: 0.5 },
        )!;
        expect(shape.line).toEqual({ color: '#ff0000', width: 3, dash: '4px,3px' });
        expect(shape.fillcolor).toBe('rgba(0, 255, 0, 0.5)');
    });

    it('parses the closed paths Plotly emits for drawclosedpath', () => {
        expect(plotlyShapeToGeometry({ type: 'path', path: 'M10.5,20L30,20L30,40Z' })).toEqual({
            type: 'polygon',
            points: [
                [10.5, 20],
                [30, 20],
                [30, 40],
            ],
        });
    });

    it('returns null for curves and unknown shape types', () => {
        expect(plotlyShapeToGeometry({ type: 'path', path: 'M0,0C1,1 2,2 3,3Z' })).toBeNull();
        expect(plotlyShapeToGeometry({ type: 'spline' })).toBeNull();
        expect(plotlyShapeToGeometry({ type: 'path' })).toBeNull();
    });
});

describe('parsePlotlyPath', () => {
    it('handles H, V and relative commands', () => {
        expect(parsePlotlyPath('M0,0H10V5h-10z')).toEqual({
            rings: [
                [
                    [0, 0],
                    [10, 0],
                    [10, 5],
                    [0, 5],
                ],
            ],
            closed: [true],
        });
        expect(parsePlotlyPath('m1,1l2,0l0,2')?.rings[0]).toEqual([
            [1, 1],
            [3, 1],
            [3, 3],
        ]);
    });

    it('accepts exponents and negative numbers', () => {
        expect(parsePlotlyPath('M-1e1,2.5L.5,-3')?.rings[0]).toEqual([
            [-10, 2.5],
            [0.5, -3],
        ]);
    });
});

describe('markersToScatterTrace', () => {
    it('builds a named marker trace with the mapped symbol', () => {
        const trace = markersToScatterTrace({
            id: 'cp',
            label: 'Ring 1',
            points: [
                [1, 2],
                [3, 4],
            ],
            color: '#123456',
            symbol: 'x',
            size: 7,
        });
        expect(trace).toMatchObject({
            type: 'scatter',
            mode: 'markers',
            name: 'Ring 1',
            x: [1, 3],
            y: [2, 4],
            marker: { symbol: 'x-thin', size: 7, color: '#123456', line: { color: '#123456' } },
        });
    });

    it('switches to WebGL for large point sets unless told otherwise', () => {
        const many = new Float32Array((SCATTER_GL_THRESHOLD + 1) * 2);
        expect(markersToScatterTrace({ id: 'a', points: many }).type).toBe('scattergl');
        expect(markersToScatterTrace({ id: 'a', points: many }, { gl: false }).type).toBe(
            'scatter',
        );
        expect(markersToScatterTrace({ id: 'a', points: [1, 1] }).name).toBe('a');
    });
});

describe('flattenPoints', () => {
    it('flattens pairs and passes flat input through without copying', () => {
        expect(
            Array.from(
                flattenPoints([
                    [1, 2],
                    [3, 4],
                ]),
            ),
        ).toEqual([1, 2, 3, 4]);
        const flat = new Float32Array([1, 2]);
        expect(flattenPoints(flat)).toBe(flat);
    });
});

describe('hitTestGeometry', () => {
    it('hits inside rectangles and ellipses', () => {
        expect(hitTestGeometry({ type: 'rect', x0: 10, y0: 10, x1: 0, y1: 0 }, 5, 5, 0)).toBe(true);
        expect(hitTestGeometry({ type: 'rect', x0: 0, y0: 0, x1: 10, y1: 10 }, 11, 5, 0)).toBe(
            false,
        );
        const ellipse = { type: 'ellipse' as const, x0: 0, y0: 0, x1: 10, y1: 10 };
        expect(hitTestGeometry(ellipse, 5, 5, 0)).toBe(true);
        expect(hitTestGeometry(ellipse, 0.5, 0.5, 0)).toBe(false);
    });

    it('hits inside a polygon by even-odd, including a concave one', () => {
        // A U shape: the notch between the arms is outside.
        const polygon = {
            type: 'polygon' as const,
            points: [
                [0, 0],
                [3, 0],
                [3, 7],
                [7, 7],
                [7, 0],
                [10, 0],
                [10, 10],
                [0, 10],
            ] as [number, number][],
        };
        expect(hitTestGeometry(polygon, 1, 5, 0)).toBe(true);
        expect(hitTestGeometry(polygon, 5, 3, 0)).toBe(false);
        expect(hitTestGeometry(polygon, 5, 9, 0)).toBe(true);
    });

    it('hits lines within the tolerance', () => {
        const line = {
            type: 'line' as const,
            points: [
                [0, 0],
                [10, 0],
            ] as [number, number][],
        };
        expect(hitTestGeometry(line, 5, 1, 1.5)).toBe(true);
        expect(hitTestGeometry(line, 5, 3, 1.5)).toBe(false);
    });
});
