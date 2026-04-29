import {cn } from '@/lib/utils';

export type ButtonWithIconProps = {
    /** Callback function triggered when button is clicked */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Text content displayed inside the button alongside the icon */ 
    text?: string;
    /** Additional CSS classes applied to the button component */ 
    styles?: string; 
    /** Disables the button and prevents user interaction when true */
    disabled?: boolean;
    /** JSX element displayed as an icon - works best with SVG elements for proper styling  */
    icon: JSX.Element; 
    /** Controls whether the icon appears on the left or right side of the text */
    iconPosition?: 'left' | 'right';
    /** Controls the overall size of the button - affects text size, icon size, and padding */
    size?: 'small' | 'medium' | 'large';
    /** Changes button style to transparent background with border and black text when true */
    isSecondary?: boolean; 
    /** Additional CSS classes applied to the button container */
    className?: string;
    /** Additional CSS classes applied to the button text element */
    classNameText?: string;
    /** Additional CSS classes applied to the icon element */
    classNameIcon?: string;
    /** Legacy callback function, use onClick instead */
    cb?: () => void;
}
export default function ButtonWithIcon({
    cb = () => {},
    onClick = () => {},
    text = '',
    disabled = false,
    icon,
    iconPosition = 'left',
    size='medium',
    isSecondary,
    className,
    classNameText,
    classNameIcon,
    ...props
}: ButtonWithIconProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (cb) cb();
        if (onClick) onClick(e);
    };

    const textSizes = {
        small: 'text-sm',
        medium: 'text-md',
        large: 'text-2xl'
    };

    const iconSizes = {
        small: 'w-4',
        medium: 'w-6',
        large: 'w-8'
    };

    const paddingSizes = {
        small: 'px-3 py-1',
        medium: 'px-3 py-2',
        large: 'px-6 py-3',
    };

    const spacingSizes = {
        small: 'space-x-1',
        medium: 'space-x-2',
        large: 'space-x-4'
    };

    const Icon = <div className={cn(`${iconSizes[size]} ${isSecondary ? 'text-black' : 'text-white'} aspect-square `, classNameIcon)}>{icon}</div>;


    return (
        <button 
            disabled={disabled} 
            className={cn(`
                ${isSecondary ? `bg-white/50 hover:bg-slate-200 text-black border` : `bg-sky-500 hover:bg-sky-600 text-white`}
                ${disabled && 'hover:cursor-not-allowed'} 
                ${textSizes[size]} 
                ${paddingSizes[size]} 
                rounded-lg font-medium w-fit`, className)} 
            onClick={handleClick}
            {...props}>
            <div className={`${spacingSizes[size]} flex justify-center items-center`}>
                {iconPosition === 'left' ? Icon : ''}
                <p className={classNameText}>{text}</p>
                {iconPosition === 'right' ? Icon : ''}
            </div>
        </button>
    )
}
