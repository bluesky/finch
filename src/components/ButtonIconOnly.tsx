import { cn } from '@/lib/utils';

type ButtonIconOnlyProps = {
    /** JSX element displayed as the button content - typically an SVG icon */
    icon: React.ReactNode;
    /** Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600`). */
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
};

const buttonVariants = {
    primary: 'bg-sky-500 hover:bg-sky-600',
    primaryActive: 'bg-sky-700 hover:bg-sky-800 border-sky-700 border',
    secondary: 'bg-white border-slate-300 border hover:bg-slate-100',
    secondaryActive: 'bg-slate-200 border-slate-300 border hover:bg-slate-300',
};

const getButtonClasses = (active: boolean | undefined, isSecondary: boolean | undefined) => {
    if (active && isSecondary) return buttonVariants.secondaryActive;
    if (active) return buttonVariants.primaryActive;
    if (isSecondary) return buttonVariants.secondary;
    return buttonVariants.primary;
};

export default function ButtonIconOnly({
    icon,
    className,
    classNameIcon,
    onClick,
    disabled,
    isSecondary,
    active,
    ...props
}: ButtonIconOnlyProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (onClick) onClick(e);
    };
    return (
        <button
            aria-pressed={active}
            className={cn(
                `${getButtonClasses(active, isSecondary)} rounded-sm px-2 py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`,
                className,
            )}
            onClick={handleClick}
            disabled={disabled}
            {...props}
        >
            <span className={cn(`${isSecondary ? 'text-black' : 'text-white'}`, classNameIcon)}>
                {icon}
            </span>
        </button>
    );
}
