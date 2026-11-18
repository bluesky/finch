export type ButtonProps = {
    /** callback function on click */
    cb?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
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
    /** How large is the button */
    size?: 'small' | 'medium' | 'large';
    /** Should the button style default to hollow color with black text? */
    isSecondary?: boolean;
};
export default function Button({
    cb = () => {},
    text = '',
    bgColor = 'bg-sky-500',
    hoverBgColor = 'hover:bg-sky-600',
    textColor = 'text-white',
    styles = '',
    disabled = false,
    size = 'medium',
    isSecondary,
    ...props
}: ButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        cb(e);
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

    const secondaryBgColor = 'bg-transparent';
    const secondaryHoverBgColor = 'hover:bg-slate-100';
    const secondaryTextColor = 'text-black';

    return (
        <button
            disabled={disabled}
            className={`
                rounded-xl  font-medium w-fit
                ${isSecondary ? `${secondaryBgColor} ${secondaryTextColor} border` : `${bgColor} ${textColor}`}
                ${disabled ? 'hover:cursor-not-allowed' : `${isSecondary ? `${secondaryHoverBgColor}` : hoverBgColor} hover:cursor-pointer`} 
                ${textSizes[size]} 
                ${paddingSizes[size]} 
                ${styles}
            `}
            onClick={(e) => handleClick(e)}
            {...props}
        >
            <p>{text}</p>
        </button>
    );
}
