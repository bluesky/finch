import { cn } from "@/lib/utils";
import useResizeObserver from "@/hooks/useResizeObserver";
export type IFrameProps = {
    url?: string;
    width?: number;
    height?: number;
    isSizeResponsive?: boolean;
    addBackground?: boolean;
    className?: string;
    title?: string;
};
export default function IFrame({ width = 1000, height = 1000, isSizeResponsive=false, addBackground=true, className, title="", url, ...props }: IFrameProps) {
    const {containerRef, dimensions} = useResizeObserver();
    return (

        <section 
            ref={containerRef} 
            className={cn(`
                ${isSizeResponsive ? "w-full h-full min-h-0 flex-grow" : "w-fit h-fit"} 
                ${addBackground ? "p-6 bg-stone-400/50 flex items-center justify-center rounded-sm" : "p-0"} 
                m-auto shadow-lg`, 
                className
            )}
            {...props}
        >
            {url ? 
                <iframe
                src={url}
                title={title}
                width={isSizeResponsive ? dimensions.width : width}
                height={isSizeResponsive ? dimensions.height : height}
                />
                :
                <div style={{width: `${isSizeResponsive ? dimensions.width : width}px`, height: `${isSizeResponsive ? dimensions.height : height}px`}} className="bg-black text-white flex flex-col justify-center gap-8">
                    <p className="text-2xl text-center">IFrame Component</p>
                    <p className="text-lg text-center">Provide a url in the component to render the website here</p>
                </div>    
            }
        </section>
    )
}