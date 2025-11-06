import { cn } from "@/lib/utils"
type ButtonIconOnlyProps = {
    icon: React.ReactNode;
    className?: string;
    iconClassName?: string;
    onClick?: () => void;
    disabled?: boolean;
    isSecondary?: boolean;
}
export default function ButtonIconOnly({ icon, className, iconClassName, onClick, disabled, isSecondary }: ButtonIconOnlyProps) {
    return (
        <button className={cn(`${isSecondary ? 'bg-white border-slate-300 border hover:bg-slate-100' : 'bg-sky-500 hover:bg-sky-600'} rounded-sm px-2 py-1`, className)} onClick={onClick} disabled={disabled}>
            <span className={cn(`${isSecondary ? 'text-black' : 'text-white'} `, iconClassName)}>{icon}</span>
        </button>
    )
}