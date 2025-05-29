export type HeaderProps = {
    /** The title */
    title?: string;
    /** Tailwind ClassName */
    textColor?: string;
    /** A valid URL path of the image (png, jpeg, etc). The image should be in public/images folder. Do not include "public" in url path */
    logoUrl?: string;
};
export default function Header({ title, textColor, logoUrl, ...props }: HeaderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Header.d.ts.map