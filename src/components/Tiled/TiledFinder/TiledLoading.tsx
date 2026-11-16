import { CircleNotch } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export type TiledLoadingProps = {
    /** What is happening, e.g. "Loading". */
    message: string;
    /** The URL being requested, shown under the message so a slow or failing server is obvious. */
    requestUrl?: string;
    /** Failed attempts so far; shown once a request has started retrying. */
    failureCount?: number;
    /** `small` fits inside a column or a row of the tree; `large` fills the viewer's body. */
    size?: 'small' | 'large';
    className?: string;
};

/** A spinner with a line saying what the viewer is waiting on. */
export default function TiledLoading({
    message,
    requestUrl,
    failureCount = 0,
    size = 'large',
    className,
}: TiledLoadingProps) {
    const isLarge = size === 'large';
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                'flex flex-col items-center justify-center gap-2 text-center text-slate-500',
                isLarge ? 'h-full w-full p-8' : 'w-full py-4',
                className,
            )}
        >
            <CircleNotch
                className={cn('animate-spin text-sky-600', isLarge ? 'h-10 w-10' : 'h-6 w-6')}
                aria-hidden
            />
            <p className={isLarge ? 'text-sm' : 'text-xs'}>{message}</p>
            {requestUrl && (
                <code
                    className={cn(
                        'max-w-full break-all rounded bg-slate-100 px-2 py-1 font-mono text-slate-600',
                        isLarge ? 'text-xs' : 'text-[10px]',
                    )}
                >
                    {requestUrl}
                </code>
            )}
            {failureCount > 0 && (
                <p className={cn('text-amber-700', isLarge ? 'text-xs' : 'text-[10px]')}>
                    No answer yet — retrying (attempt {failureCount + 1})
                </p>
            )}
        </div>
    );
}
