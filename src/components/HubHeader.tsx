import { cn } from '@/lib/utils';

export type HubHeaderProps = {
    /** Title text displayed in the header. */
    title?: string;
    /** URL of the logo image displayed in the header. */
    logoUrl?: string;
    /** Additional CSS classes applied to the root header element. */
    className?: string;
    /** Additional CSS classes applied to the logo image element. */
    classNameImage?: string;
    /** Additional CSS classes applied to the title element. */
    classNameTitle?: string;
    /** Arbitrary JSX rendered on the right side of the header. */
    rightSlot?: React.ReactNode;
}
export default function HubHeader({title="BEAMLINE APP", logoUrl="https://img.icons8.com/?size=100&id=11743&format=png&color=000000", className, classNameImage, classNameTitle, rightSlot, ...props}: HubHeaderProps) {
    return (
    <header className={cn("bg-white h-16 flex justify-between items-center", className)} {...props}>
        <div className="flex items-center space-x-6 ml-6">
            {logoUrl &&<img src={logoUrl} className={cn("h-10 aspect-square", classNameImage)} />}
            <h1 className={cn("text-sky-950 text-2xl font-semibold", classNameTitle)}>{title}</h1>
        </div>
        {rightSlot}
    </header>
    )
}