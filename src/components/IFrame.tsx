import { cn } from '@/lib/utils';
import useResizeObserver from '@/hooks/useResizeObserver';
import { useEffect, useState } from 'react';

export type IFrameProps = {
    /** URL of the page to embed. Omitting it renders a placeholder. */
    url?: string;
    /** Fixed pixel width of the iframe. Ignored when `isSizeResponsive` is `true`. Defaults to `1000`. */
    width?: number;
    /** Fixed pixel height of the iframe. Ignored when `isSizeResponsive` is `true`. Defaults to `1000`. */
    height?: number;
    /** When `true`, the iframe fills its container using a `ResizeObserver` instead of fixed dimensions. Defaults to `false`. */
    isSizeResponsive?: boolean;
    /** When `true`, wraps the iframe in a padded stone-colored background card. Defaults to `true`. */
    addBackground?: boolean;
    /** Additional class names applied to the outer `<section>` element. */
    className?: string;
    /** Accessible title forwarded to the `<iframe>` element. */
    title?: string;
    /** Milliseconds to wait for the iframe `onLoad` event before showing the error/retry overlay. Defaults to `4000`. */
    timeoutMs?: number;
};

export default function IFrame({
    width = 1000,
    height = 1000,
    isSizeResponsive = false,
    addBackground = true,
    className,
    title = '',
    url,
    timeoutMs = 4000,
    ...props
}: IFrameProps) {
    const { containerRef, dimensions } = useResizeObserver();

    const [loaded, setLoaded] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const iframeWidth = isSizeResponsive ? dimensions.width : width;
    const iframeHeight = isSizeResponsive ? dimensions.height : height;

    useEffect(() => {
        if (!url) return;

        setLoaded(false);
        setTimedOut(false);

        const timer = setTimeout(() => {
            setTimedOut(true);
        }, timeoutMs);

        return () => clearTimeout(timer);
    }, [url, reloadKey, timeoutMs]);

    const showError = timedOut && !loaded;
    const showLoading = !loaded && !timedOut;

    return (
        <section
            ref={containerRef}
            className={cn(
                `
                ${isSizeResponsive ? 'w-full h-full min-h-0 flex-grow' : 'w-fit h-fit'} 
                ${addBackground ? 'p-6 bg-stone-400/50 flex items-center justify-center rounded-sm' : 'p-0'} 
                m-auto shadow-lg
                `,
                className,
            )}
            {...props}
        >
            {!url ? (
                <div
                    style={{ width: `${iframeWidth}px`, height: `${iframeHeight}px` }}
                    className="bg-black text-white flex flex-col justify-center gap-8"
                >
                    <p className="text-2xl text-center">IFrame Component</p>
                    <p className="text-lg text-center">
                        Provide a url in the component to render the website here
                    </p>
                </div>
            ) : (
                <div
                    style={{ width: `${iframeWidth}px`, height: `${iframeHeight}px` }}
                    className="relative"
                >
                    {/* Loading */}
                    {showLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-lg">
                            Loading preview...
                        </div>
                    )}

                    {/* Iframe */}
                    <iframe
                        key={reloadKey}
                        src={url}
                        title={title}
                        width={iframeWidth}
                        height={iframeHeight}
                        onLoad={() => setLoaded(true)}
                        className={cn(
                            'transition-opacity duration-200',
                            loaded ? 'opacity-100' : 'opacity-0',
                        )}
                    />
                    {/* Error */}
                    {showError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white text-center gap-4 p-4">
                            <p className="text-lg font-semibold">
                                Could not load the page at {url}
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setReloadKey((k) => k + 1)}
                                    className="px-4 py-2 bg-white text-black rounded"
                                >
                                    Retry
                                </button>

                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border border-white rounded"
                                >
                                    Open in new tab
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
