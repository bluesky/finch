import { cn } from '@/lib/utils';
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
export default function Header({
    title = 'My App',
    classNameText = 'text-sky-700',
    classNameImage,
    logoUrl = '/finchIconCircle.png',
    className,
    ...props
}: HeaderProps) {
    return (
        <header
            className={cn(
                `w-full border-b-slate-300 border-b flex items-center h-8 py-8 justify-center space-x-4`,
                className,
            )}
            {...props}
        >
            {logoUrl && <img src={logoUrl} className={cn(`h-8 w-auto`, classNameImage)} />}
            <h1 className={cn(`text-4xl`, classNameText)}>{title}</h1>
        </header>
    );
}
