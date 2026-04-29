import { cn } from "@/lib/utils";

export type ButtonProps = {
    /** Callback function triggered when button is clicked */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>)=>void;
    /** Text content displayed inside the button */ 
    text?: string;
    /** Disables the button and prevents user interaction when true */
    disabled?: boolean;
    /** Controls the size of the button - affects text size and padding */
    size?: 'small' | 'medium' | 'large'
    /** Changes button style to transparent background with border and black text when true */
    isSecondary?: boolean 
    /** Additional CSS classes applied to the button container */
    className?: string;
    /** Additional CSS classes applied to the button text element */
    classNameText?: string;
    /** Legacy callback function, use onClick instead */
    cb?: ()=>void;
}
export default function Button({
    cb = () => {},
    onClick = () => {},
    text = '',
    disabled = false,
    size='medium',
    isSecondary,
    className,
    classNameText,
    ...props
}: ButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (cb)cb();
        if (onClick) onClick(e);
    };

    const textSizes = {
        small: 'text-sm',
        medium: 'text-md',
        large: 'text-2xl'
    };

    const paddingSizes = {
        small: 'px-3 py-1',
        medium: 'px-3 py-2',
        large: 'px-6 py-3',
    };


    return (
        <button 
        disabled={disabled} 
        className={
            cn(
            `
                rounded-xl  font-medium w-fit
                ${isSecondary ? `bg-transparent hover:bg-slate-100 text-black border` : `bg-sky-500 text-white`}
                ${disabled ? 'hover:cursor-not-allowed' : `${(isSecondary ? `secondaryHoverBgColor` : 'hover:bg-sky-600')} hover:cursor-pointer`} 
                ${textSizes[size]} 
                ${paddingSizes[size]} 
            `,
            className)
        } 
        onClick={handleClick}
        {...props}>
                <p className={classNameText}>{text}</p>
        </button>
    )
}
