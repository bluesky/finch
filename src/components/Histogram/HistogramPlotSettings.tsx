import { cn } from '@/lib/utils';

type HistogramPlotSettingsProps = {
    /** Additional class names applied to the container element. */
    className?: string;
};

export default function HistogramPlotSettings({ className }: HistogramPlotSettingsProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-start gap-4 border border-blue-400',
                className,
            )}
        >
            <p className="text-lg text-white text-center">Plot Settings</p>
        </div>
    );
}
