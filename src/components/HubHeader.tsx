import { cn } from '@/lib/utils';

export type HubHeaderProps = {
    /** Title text displayed in the header. */
    title?: string;
    /** URL of the logo image displayed in the header. Ignored when `logoIcon` is provided. */
    logoUrl?: string;
    /**
     * A React element rendered in place of the logo image.
     * When provided, `logoUrl` is not rendered.
     */
    logoIcon?: React.ReactElement;
    /** Additional CSS classes applied to the root header element. */
    className?: string;
    /** Additional CSS classes applied to the logo image element. Only applies when using `logoUrl`. */
    classNameImage?: string;
    /** Additional CSS classes applied to the title element. */
    classNameTitle?: string;
    /** Arbitrary JSX rendered on the right side of the header. */
    rightSlot?: React.ReactNode;
};

/**
 * Application header bar with a logo, title, and optional right-side slot.
 *
 * Pass `logoIcon` to render a custom React element as the logo.
 * If only `logoUrl` is provided, an `<img>` is rendered instead.
 */
export default function HubHeader({
    title = 'BEAMLINE APP',
    logoUrl = 'https://img.icons8.com/?size=100&id=11743&format=png&color=000000',
    logoIcon,
    className,
    classNameImage,
    classNameTitle,
    rightSlot,
    ...props
}: HubHeaderProps) {
    return (
        <header
            className={cn('bg-white h-16 flex justify-between items-center', className)}
            {...props}
        >
            <div className="flex items-center space-x-6 ml-6">
                {logoIcon
                    ? logoIcon
                    : logoUrl && (
                          <img src={logoUrl} className={cn('h-10 aspect-square', classNameImage)} />
                      )}
                <h1 className={cn('text-sky-950 text-2xl font-semibold', classNameTitle)}>
                    {title}
                </h1>
            </div>
            {rightSlot}
        </header>
    );
}
