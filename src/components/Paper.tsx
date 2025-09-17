import { cn } from "@/lib/utils";
import '@/components/style.css'

export type PaperProps = {
    size?: 'small' | 'medium' | 'large' | 'full' | 'grow',
    rounded?: 'none' | 'small' | 'medium' | 'large' ,
    title?: string,
    className?: string,
    children?: React.ReactNode,
}
export default function Paper({size="full", rounded="medium", title, className, children }: PaperProps) {
    const sizeClassMap = {
        small: 'w-[400px] h-[400px]',
        medium: 'w-[800px] h-[800px]',
        large: 'w-[1200px] h-[800px]',
        full: 'w-full h-full',
        grow: 'w-fit flex-grow h-full'
    };
    const roundedEdgeClassMap = {
        none: 'rounded-none',
        small: 'rounded-sm',
        medium: 'rounded-md',
        large: 'rounded-lg'
    }
    return (
        <article className={cn(`bg-white shadow-lg py-2 px-[1px] ${sizeClassMap[size]} ${roundedEdgeClassMap[rounded]}`, className)}>
            <div className="h-full w-full overflow-y-auto rounded-scrollbar">
                {title && <h3 className="w-full text-sky-900 font-medium mb-2 text-center">{title}</h3>}
                {children}
            </div>
        </article>
    )
}