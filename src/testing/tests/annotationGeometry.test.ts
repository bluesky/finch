import { describe, expect, it } from 'vitest';
import { normalizeBox, pointsToPath } from '@/utils/annotationGeometry';

describe('annotation geometry', () => {
    it('normalizes box corners', () => {
        expect(normalizeBox({ x0: 5, y0: 9, x1: 1, y1: 2 })).toEqual({
            x0: 1,
            y0: 2,
            x1: 5,
            y1: 9,
        });
    });

    it('builds paths with and without closing and holes', () => {
        expect(
            pointsToPath(
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                ],
                false,
            ),
        ).toBe('M0,0L1,0L1,1');
        expect(
            pointsToPath(
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                ],
                true,
                [
                    [
                        [0.2, 0.2],
                        [0.4, 0.2],
                        [0.4, 0.4],
                    ],
                ],
            ),
        ).toBe('M0,0L1,0L1,1ZM0.2,0.2L0.4,0.2L0.4,0.4Z');
    });
});
