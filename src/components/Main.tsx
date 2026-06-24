import { cn } from '@/lib/utils';

type MainProps = {
    /** When true, allows child elements to wrap onto multiple lines if they exceed the width of the container. */
    flexWrap?: boolean;
    /** Child elements to be rendered inside the main container. */
    children?: JSX.Element;
    /** Additional Tailwind CSS classes to apply to the main container for custom styling. */
    className?: string;
};

export default function Main({ flexWrap, children, className, ...props }: MainProps) {
    return (
        <main
            className={cn(
                `flex flex-grow ${flexWrap && 'flex-wrap'} bg-slate-500 overflow-auto z-0`,
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
}
