import React, { useEffect, useState } from "react";
import { Entry } from "../types/UIEntry";
import CSICanvas from "../CSICanvas";
import { useUIData } from "../utils/useUIData";
import { pxToEm } from "../utils/units";
import { useMock } from "../context/MockContext"; 

export function CompositeDeviceRenderer({ device, index, args }: {
    device: Entry; 
    index: number; 
    args: { [key: string]: any };
}): JSX.Element {
    const { mock } = useMock();
    const [canvasStyle, setCanvasStyle] = useState({
        position: "absolute" as const,
        left: pxToEm(device.location.x),
        top: pxToEm(device.location.y),
    });

    const { UIData, loading, error, devices, onSubmitSettings } = useUIData({
        fileName: device.comp_file,
        children: device.children,
        args,
        mock 
    });

    useEffect(() => {
        // If the composite has children, ignore the device.location 
        // (set left and top to 0px) because it is already covered by the location of the canvas component
        if (device.children !== undefined) {
            setCanvasStyle({
                position: "absolute" as const,
                left: "0px",
                top: "0px"
            });
        }
    }, [device.children]);

    if (loading) {
        return (
            <div className="text-blue-500" style={canvasStyle}>
                Loading {device.comp_file}...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500" style={canvasStyle}>
                {error}
            </div>
        );
    }

    if (!UIData) {
        return <div style={canvasStyle}></div>;
    }

    return (
        <React.Fragment key={index}>
            <CSICanvas
                UIData={UIData}
                devices={devices}
                onSubmit={onSubmitSettings}
                style={canvasStyle}
                {...args}
            />
        </React.Fragment>
    );
}