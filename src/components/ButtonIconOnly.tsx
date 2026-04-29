import { cn } from "@/lib/utils"
type ButtonIconOnlyProps = {
    /** JSX element displayed as the button content - typically an SVG icon */
    icon: React.ReactNode;
    /** Additional CSS classes applied to the button container */
    className?: string;
    /** Additional CSS classes applied to the icon element */
    classNameIcon?: string;
    /** Callback function triggered when button is clicked */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Disables the button and prevents user interaction when true */
    disabled?: boolean;
    /** Changes button style to white background with border instead of primary blue when true */
    isSecondary?: boolean;
    /** Renders the button in a pressed/active state */
    active?: boolean;
}
export default function ButtonIconOnly({ icon, className, classNameIcon, onClick, disabled, isSecondary, active, ...props }: ButtonIconOnlyProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (onClick) onClick(e);
    };
    return (
        <button className={cn(`${active ? 'bg-sky-700 hover:bg-sky-800 border-sky-700 border' : isSecondary ? 'bg-white border-slate-300 border hover:bg-slate-100' : 'bg-sky-500 hover:bg-sky-600'} rounded-sm px-2 py-1`, className)} onClick={handleClick} disabled={disabled} {...props}>
            <span className={cn(`${active || !isSecondary ? 'text-white' : 'text-black'} `, classNameIcon)}>{icon}</span>
        </button>
    )
}