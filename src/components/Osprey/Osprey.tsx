import { cn } from "@/lib/utils";
type OspreyProps = {
    width?: number;
    height?: number;
    className?: string;
};
export default function Osprey({ width = 1000, height = 1000, className = '' }: OspreyProps) {
    return (

        <div className={cn("flex items-center justify-center bg-stone-400/50 py-4 px-8 m-auto rounded-sm shadow-lg", className)}>
            <iframe
                src="http://192.168.10.156:8080"
                title="Osprey OpenWeb UI"
                width={width}
                height={height}
            />
        </div>
    )
}