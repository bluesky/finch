import { useMemo, useCallback, useEffect, useState } from "react";

import useOphydSocket from "@/hooks/useOphydSocket";
import PlotlyScatter from "./PlotlyScatter";
import { PlotlyScatterData } from "@/types/plotTypes";
import { Datum } from "plotly.js";
import { generateSampleData, blankScatterData } from "@/utils/plotGenerators";

//const sampleData: PlotlyScatterData = generateSampleData(30) // 30 points of sample data
export type SignalMonitorPlotProps = {
    pv: string;
    className?: string;
    numVisiblePoints?: number;
    pollingIntervalMilliseconds?: number;
    demo?: boolean;
    tickTextIntervalSeconds?: number;
    color?: string;
    yAxisTitle?: string;
    
}
export default function SignalMonitorPlot({
    className,
    numVisiblePoints = 30,
    pollingIntervalMilliseconds = 1000,
    demo=false,
    tickTextIntervalSeconds=10,
    pv,
    color="#082f49",
    yAxisTitle,
}: SignalMonitorPlotProps) {
    const deviceNameList = useMemo(()=>[pv], []);
    const { devices } = useOphydSocket(deviceNameList);  //todo: create an optional callback arg that sends update messages into fn
    let styledData = {...blankScatterData, marker: {...blankScatterData.marker, color:color}};
    const [data, setData] = useState<PlotlyScatterData>(demo ? generateSampleData(numVisiblePoints) : styledData);
    const [ xLayout, setXLayout] = useState<{tickvals:string[], ticktext:string[]}>({tickvals: [], ticktext: []});

    const addSinglePoint = useCallback(()=>{
        setData((prevData) => {
            const newXValue = new Date().toLocaleTimeString('en-US', { hour12: false });
            const newYValue = Math.random() * 100;
            const newX: Datum[] = [...(prevData.x as Datum[]), newXValue];
            const newY: Datum[] = [...(prevData.y as Datum[]), newYValue];
            if (newX.length > numVisiblePoints) {
                newX.shift();
                newY.shift();
            }
            return {
                    ...prevData,
                    x: newX,
                    y: newY,
            };
        });
    }, []);

    const addTickValue = useCallback((newXValue: string) => {
        //update xLayout with tickvals and ticktext based on spacing
        setXLayout((prevLayout) => {
        const previousLabel: string = prevLayout.tickvals[prevLayout.tickvals.length - 1];
        if (!previousLabel || previousLabel.length === 0) {
            //if there are no previous labels, just add the new one
            return {ticktext: [newXValue], tickvals: [newXValue]};
        }
        const previousLabelNumber = previousLabel.replaceAll(":", "");
        const currentLabelNumber = newXValue.replaceAll(":", "");
        if (parseInt(currentLabelNumber) >= (parseInt(previousLabelNumber) + tickTextIntervalSeconds) ) {
            //update to include this new label
            const newTickvals = [...prevLayout.tickvals, newXValue];
            const newTicktext = [...prevLayout.ticktext, newXValue];
            if (newTickvals.length > numVisiblePoints) {
                newTickvals.shift();
                newTicktext.shift();
            }
            return {ticktext: newTicktext, tickvals: newTickvals};
        } else {
            return prevLayout;
        }
    })
}, [numVisiblePoints]);
    

    useEffect(() => {
        if (demo) {
            //simulate a new random number every second
            const interval = setInterval(() => {
                addSinglePoint();
            }
            , pollingIntervalMilliseconds); // Update every second
            return () => clearInterval(interval);
        } else {
            //get live value from EPICS
            if (!devices || !devices[pv]) {
                return;
            } else {
                //record the current value immediately to the chart
                let currentValue = devices[pv].value;
                if (typeof currentValue !== 'number') return;
                const newXValue = new Date().toLocaleTimeString('en-US', { hour12: false });
                setData((prevData) => {
                    const newYValue = currentValue;
                    const newX: Datum[] = [...(prevData.x as Datum[]), newXValue];
                    const newY: Datum[] = [...(prevData.y as Datum[]), newYValue];
                    const newMarkerSize = prevData.marker ? [...(prevData.marker.size as number[]), 10] : [];
                    if (newX.length > numVisiblePoints) {
                        newX.shift();
                        newY.shift();
                        newMarkerSize.shift();
                    }
                    return {
                            ...prevData,
                            x: newX,
                            y: newY,
                            marker: {...(prevData.marker), size: newMarkerSize},
                    };
                });

                addTickValue(newXValue);
 

                const interval = setInterval(() => {
                    let currentValue = devices[pv].value;
                    if (typeof currentValue !== 'number') return;
                    const newXValue = new Date().toLocaleTimeString('en-US', { hour12: false });
                    setData((prevData) => {
                        const newYValue = currentValue;
                        const newX: Datum[] = [...(prevData.x as Datum[]), newXValue];
                        const newY: Datum[] = [...(prevData.y as Datum[]), newYValue];
                        const newMarkerSize = prevData.marker ? [...(prevData.marker.size as number[]), 0] : [];
                        if (newX.length > numVisiblePoints) {
                            newX.shift();
                            newY.shift();
                            newMarkerSize.shift();
                        }
                        return {
                                ...prevData,
                                x: newX,
                                y: newY,
                                marker: {...(prevData.marker), size: newMarkerSize},
                        };
                    });
                    addTickValue(newXValue);
                }
                ,pollingIntervalMilliseconds); 
                return () => clearInterval(interval);
            }
        }
    }
    , [addSinglePoint, devices]);

    useEffect(()=> {
        //console.log('devices changed');
    }, [devices]);


    return (
        <PlotlyScatter 
            data={[data]} 
            className={className} 
            xAxisLayout={xLayout}
            xAxisTitle={pv}
            yAxisTitle={devices[pv] && devices[pv].units}
        />
    )
}