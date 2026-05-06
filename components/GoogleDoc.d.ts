export type doc = {
    title: string;
    url: string;
    description?: string;
};
type GoogleDocProps = {
    /** URL of a single document to embed. Used when no docs list is provided, or as the initial selection when docs is also provided. */
    url?: string;
    /** List of documents to show in a dropdown selector. When provided, renders a select menu and defaults to the first item (or url if given). */
    docs?: doc[];
    /** Additional classnames */
    className?: string;
};
export default function GoogleDoc({ url, docs, className, ...props }: GoogleDocProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GoogleDoc.d.ts.map