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
export default function IFrame({ width, height, isSizeResponsive, addBackground, className, title, url, timeoutMs, ...props }: IFrameProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=IFrame.d.ts.map