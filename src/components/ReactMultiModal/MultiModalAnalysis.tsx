import { cn } from "@/lib/utils";
type MultiModalAnalysisProps = {
    width?: number;
    height?: number;
    className?: string;
};
export default function MultiModalAnalysis({ width = 1600, height = 1600, className = '' }: MultiModalAnalysisProps) {
    return (

        <div className={cn("flex items-center justify-center bg-stone-400/50 py-4 px-8 w-fit m-auto rounded-sm shadow-lg", className)}>
            <iframe
                src="http://192.168.10.156:4001/"
                title="MultiModal Analysis UI"
                width={width}
                height={height}
            />
        </div>
    )
}