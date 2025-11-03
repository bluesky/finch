import {cn } from '@/lib/utils';

export type ButtonWithIconProps = {
    /** callback function on click */
    cb?: () => void;
    /** text inside button */ 
    text?: string;
    /** Tailwind ClassName */
    bgColor?: `bg-${string}`; 
    /** Tailwind ClassName */
    hoverBgColor?: `hover:bg-${string}`;
    /** Tailwind ClassName */
    textColor?: `text-${string}`;
    /** Extra Tailwind ClassNames applied to button component */ 
    styles?: string; 
    /** Boolean that prevents the user from clicking or causing hover effects when true */
    disabled?: boolean;
    /** any valid JSX element, best used with SVG to allow text color property to apply  */
    icon: JSX.Element; 
    /** Is the icon on the left or right of the text? */
    iconPosition?: 'left' | 'right';
    /** How large is the button */
    size?: 'small' | 'medium' | 'large'
    /** Should the button style default to hollow color with black text? */
    isSecondary?: boolean 
}
export default function ButtonWithIcon({
    cb = () => {},
    text = '',
    bgColor = 'bg-sky-500',
    hoverBgColor = 'hover:bg-sky-600',
    textColor = 'text-white',
    styles = '',
    disabled = false,
    icon,
    iconPosition = 'left',
    size='medium',
    isSecondary,
    ...props
}: ButtonWithIconProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        cb();
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
    }

    const secondaryBgColor = 'bg-transparent';
    const secondaryHoverBgColor = 'hover:bg-slate-100';
    const secondaryTextColor = 'text-black';

    const Icon = <div className={`${iconSizes[size]} ${isSecondary ? secondaryTextColor : textColor} aspect-square `}>{icon}</div>;


    return (
        <button 
            disabled={disabled} 
            className={cn(`
                ${isSecondary ? `${secondaryBgColor} ${secondaryTextColor} border` : `${bgColor} ${textColor}`}
                ${disabled ? 'hover:cursor-not-allowed' : (isSecondary ? secondaryHoverBgColor : hoverBgColor)} 
                ${textSizes[size]} 
                ${paddingSizes[size]} 
                rounded-lg font-medium w-fit`, styles)} 
            onClick={e => handleClick(e)}
            {...props}>
            <div className={`${spacingSizes[size]} flex justify-center`}>
                {iconPosition === 'left' ? Icon : ''}
                <p>{text}</p>
                {iconPosition === 'right' ? Icon : ''}
            </div>
        </button>
    )
}
