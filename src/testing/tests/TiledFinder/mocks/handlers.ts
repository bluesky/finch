import { HttpResponse, http } from 'msw';
import { mockTiledResponse, mockTiledResponseFolder, mockTiledInfoResponse } from './responses';

export const tiledHandlers = [
    http.get('https://tiled-demo.blueskyproject.io/api/v1/search/sampleFolder', () => {
        return HttpResponse.json(mockTiledResponseFolder, { status: 200 });
    }),
    http.get(
        'https://tiled-demo.blueskyproject.io/api/v1/array/full/sampleFolder/image',
        async () => {
            try {
                const imageRes = await fetch('/images/als_logo_wheel.png'); // same-origin relative path
                const arrayBuffer = await imageRes.arrayBuffer();

                return new HttpResponse(arrayBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': 'image/png',
                    },
                });
            } catch (err) {
                console.error('Failed to fetch image:', err);
                return new HttpResponse('Image fetch failed', { status: 500 });
            }
        },
    ),
    http.get('https://tiled-demo.blueskyproject.io/api/v1/search', () => {
        return HttpResponse.json(mockTiledResponse, { status: 200 });
    }),
    http.get('https://tiled-demo.blueskyproject.io/api/v1', () => {
        return HttpResponse.json(mockTiledInfoResponse, { status: 200 });
    }),
];
