import { cn } from '@/lib/utils';

export type BentoProps = {
    children?: React.ReactNode;
    className?: string;
};
export default function Bento({ children, className, ...props }: BentoProps) {
    return (
        <div className={cn('flex flex-wrap gap-8 w-full', className)} {...props}>
            {children}
        </div>
    );
}
