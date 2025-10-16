import { useMemo } from 'react';
import { phosphorIcons } from "@/assets/icons";
import { SunDim, Sun } from '@phosphor-icons/react';

type CameraCanvasFeaturesProps = {
    socketStatus: string;
    isImageLogScale: boolean;
    onToggleConnection: () => void;
    onToggleLogScale: () => void;
};

export default function CameraCanvasFeatures({
    socketStatus,
    isImageLogScale,
    onToggleConnection,
    onToggleLogScale
}: CameraCanvasFeaturesProps) {
    const iconFeatures = useMemo(() => [
        {
            id: 'connection',
            icon: socketStatus === 'closed' ? phosphorIcons.eyeSlash : phosphorIcons.eye,
            onClick: onToggleConnection,
            title: socketStatus === 'closed' ? 'Connect' : 'Disconnect'
        },
        {
            id: 'logScale',
            icon: isImageLogScale ? <SunDim size={24}/> : <Sun size={24}/>,
            onClick: onToggleLogScale,
            title: isImageLogScale ? 'Linear Scale' : 'Log Scale'
        }
    ], [socketStatus, isImageLogScale, onToggleConnection, onToggleLogScale]);

    return (
        <ul className="absolute z-10 top-2 right-2 flex flex-col gap-2">
            {iconFeatures.map((feature) => (
                <li 
                    key={feature.id}
                    className="w-6 aspect-square text-slate-500 hover:cursor-pointer hover:text-slate-400"
                    onClick={feature.onClick}
                    title={feature.title}
                >
                    {feature.icon}
                </li>
            ))}
        </ul>
    );
}