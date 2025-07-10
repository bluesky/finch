import { useState } from "react";
import TiledContainer from "./TiledContainer";
import StartupScreen from "./StartupScreen";
import './Tiled.css'

import { cn } from "@/lib/utils";
import { TiledItemLinks } from "./types";

export type TiledProps = {
    onSelectCallback?: (links: TiledItemLinks) => void,
    apiKey?: string,
    size?: 'small' | 'medium' | 'large'
    closeOnSelect?: boolean,
    isPopup?: boolean,
    enableStartupScreen?: boolean,
    tiledBaseUrl?: string,
    backgroundClassName?: string,
    singleColumnMode?: boolean,
    contentClassName?: string,
    isFullWidth?: boolean,
}
export default function Tiled({
    onSelectCallback,
    apiKey,
    size,
    closeOnSelect=false,
    isPopup,
    enableStartupScreen=false,
    tiledBaseUrl,
    backgroundClassName,
    contentClassName,
    singleColumnMode=false,
    isFullWidth=false,
    ...props
}: TiledProps) {
    const [ isClosed, setIsClosed ] = useState<boolean>(false);
    const [ showStartupScreen, setShowStartupScreen ] = useState<boolean>(true);
    const [ url, setUrl ] = useState<undefined | string>(tiledBaseUrl);
    const [ isExpanded, setIsExpanded ] = useState<boolean>(false);

    const sizeClassMap = {
        small: 'w-[600px] h-[500px]',
        medium: 'w-[800px] h-[800px]',
        large: 'w-[1200px] h-[1200px]',
    };

    const expandedSizeClassMap = {
        small: 'w-[800px] h-[800px]',
        medium: 'w-[1000px] h-[1000px]',
        large: 'w-[1600px] h-[1600px]',
    };

    const handleExpandClick = () => {
        setIsExpanded(!isExpanded);
    }

    const handleStartupScreenSubmit = () => {
        setShowStartupScreen(false);
    }


    if (!isClosed) {
        return (
            <div className={cn(`flex w-full h-full min-w-[600px] min-h-[500px] justify-center items-center ${size && sizeClassMap[size]} ${(size && isExpanded) && expandedSizeClassMap[size] } ${isPopup ? 'relative top-0 left-0 z-50 w-screen h-screen' : ''}`, backgroundClassName)} {...props}>
                <div className={cn(`flex flex-col border border-slate-400 shadow-lg rounded-md bg-white ${size ? `w-full h-full` : `h-1/2 w-1/2 min-w-[600px] min-h-[500px]`} ${isFullWidth && 'w-full'}  ${isExpanded && 'h-full w-full'}`, contentClassName)}>
                    {
                        (enableStartupScreen && showStartupScreen) ?
                            <StartupScreen 
                                url={url} 
                                handleUrlChange={setUrl} 
                                handleSubmit={handleStartupScreenSubmit}
                            />
                        :
                        <TiledContainer 
                            setIsClosed={setIsClosed} 
                            url={url} 
                            closeOnSelect={closeOnSelect} 
                            onSelectCallback={onSelectCallback} 
                            singleColumnMode={singleColumnMode}
                            handleExpandClick={handleExpandClick}
                            isExpanded={isExpanded}
                            apiKey={apiKey}
                        />
                    }
                </div>
            </div>
        ) 
    }
}
