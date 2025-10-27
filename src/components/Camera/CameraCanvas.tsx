import { phosphorIcons } from "@/assets/icons";
import CameraCanvasFeatures from './CameraCanvasFeatures';
import { useCameraCanvas } from './hooks/useCameraCanvas';

export type CanvasSizes = 'small' | 'medium' | 'large' | 'automatic';
export type CameraCanvasProps = {
    imageArrayPV?: string;
    sizePVs?: {[key:string]: string};
    canvasSize?: CanvasSizes;
    prefix?: string;
    wsUrl?:string;
}

export default function CameraCanvas(props: CameraCanvasProps) {
    const {
        canvasRef,
        fps,
        socketStatus,
        isImageLogScale,
        sizeDict,
        startWebSocket,
        closeWebSocket,
        toggleLogScale
    } = useCameraCanvas(props);

    const { canvasSize = 'medium' } = props;

    return (
        <div className={`${canvasSize === 'small' ? 'max-w-[256px]' : ''} bg-slate-300 relative`}>
            {/* Canvas Element - background*/}
            <canvas id='canvas' className={`${socketStatus === 'closed' ? 'opacity-25' : ''} m-auto border`} ref={canvasRef} width={sizeDict[canvasSize] ? sizeDict[canvasSize] : 512} height={sizeDict[canvasSize] ? sizeDict[canvasSize] : 512} />
            
            {/* FPS counter - top left */}
            <p className="absolute z-10 top-1 left-2">{fps} fps</p>

            <CameraCanvasFeatures 
                socketStatus={socketStatus}
                isImageLogScale={isImageLogScale}
                onToggleConnection={socketStatus === 'closed' ? startWebSocket : closeWebSocket}
                onToggleLogScale={toggleLogScale}
                canvasSize={sizeDict[canvasSize] ? sizeDict[canvasSize] : 512}
                prefix={props.prefix}
            />

            {/* Overlay when disconnected */}
            <div className={`${socketStatus === 'closed' ? '' : 'hidden'} absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center group`}>
                <div className="flex justify-center items-center w-full h-full">
                    <div className="relative group-hover:cursor-pointer w-full max-w-xs h-32">
                        <div className="group-hover:opacity-0 opacity-100 transition-opacity duration-700 flex content-center items-center justify-center flex-col absolute top-0 w-full h-full ">
                            <p className="text-2xl text-center font-bold text-slate-700">Websocket Disconnected</p>
                            <div className="w-24 aspect-square text-slate-700 m-auto">{phosphorIcons.plugs}</div>
                        </div>

                        <div className="opacity-0 transition-opacity duration-700 group-hover:opacity-100 group/connect text-center absolute top-0 w-full h-full" onClick={startWebSocket}>
                            <p className="text-2xl font-bold text-slate-700 group-hover/connect:text-slate-900 group-hover/connect:animate-pulse">Connect?</p>
                            <div className="w-24 aspect-square text-slate-700 m-auto group-hover/connect:text-slate-900 group-hover/connect:animate-pulse">{phosphorIcons.plugsConnected}</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}