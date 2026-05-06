export type HeaderProps = {
    /** The title */
    title?: string;
    /** Additional CSS classes applied to the title element. */
    classNameText?: string;
    /** A valid URL path of the image (png, jpeg, etc). The image should be in public/images folder. Do not include "public" in url path */
    logoUrl?: string;
    /** Additional CSS classes applied to the root wrapper element. */
    className?: string;
    /** Additional CSS classes applied to the image element. */
    classNameImage?: string;
};
export default function Header({ title, classNameText, classNameImage, logoUrl, className, ...props }: HeaderProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Header.d.ts.map