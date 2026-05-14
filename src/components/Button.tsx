import { cn } from '@/lib/utils';

export type ButtonProps = {
    /** Callback function triggered when button is clicked */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Text content displayed inside the button */
    text?: string;
    /** Disables the button and prevents user interaction when true */
    disabled?: boolean;
    /** Controls the size of the button - affects text size and padding */
    size?: 'small' | 'medium' | 'large';
    /** Changes button style to transparent background with border and black text when true */
    isSecondary?: boolean;
    /** Renders the button in a pressed/active state */
    active?: boolean;
    /** Additional CSS classes applied to the button container. To override colors, pass Tailwind classes (e.g. `bg-orange-500 hover:bg-orange-600 text-white`). */
    className?: string;
    /** Additional CSS classes applied to the button text element */
    classNameText?: string;
    /** Legacy callback function, use onClick instead */
    cb?: () => void;
};

const buttonVariants = {
    primary: 'bg-sky-500 text-white hover:bg-sky-600',
    primaryActive: 'bg-sky-700 text-white hover:bg-sky-800',
    secondary: 'bg-transparent hover:bg-slate-100 text-black border',
    secondaryActive: 'bg-slate-200 text-black border hover:bg-slate-300',
};

const getButtonClasses = (active: boolean | undefined, isSecondary: boolean | undefined) => {
    if (active && isSecondary) return buttonVariants.secondaryActive;
    if (active) return buttonVariants.primaryActive;
    if (isSecondary) return buttonVariants.secondary;
    return buttonVariants.primary;
};

const textSizes = {
    small: 'text-sm',
    medium: 'text-md',
    large: 'text-2xl',
};

const paddingSizes = {
    small: 'px-3 py-1',
    medium: 'px-3 py-2',
    large: 'px-6 py-3',
};

export default function Button({
    cb = () => {},
    onClick = () => {},
    text = '',
    disabled = false,
    size = 'medium',
    isSecondary,
    active,
    className,
    classNameText,
    ...props
}: ButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (cb) cb();
        if (onClick) onClick(e);
    };

    return (
        <button
            aria-pressed={active}
            disabled={disabled}
            className={cn(
                `
                rounded-xl font-medium w-fit
                ${getButtonClasses(active, isSecondary)}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${textSizes[size]}
                ${paddingSizes[size]}
            `,
                className,
            )}
            onClick={handleClick}
            {...props}
        >
            <p className={classNameText}>{text}</p>
        </button>
    );
}
