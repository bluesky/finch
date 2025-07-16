import { CSSProperties } from 'react'
import { Device } from "@/types/deviceControllerTypes";
import { Entry } from './types/UIEntry';
import InputNumber from './InputNumber';
import InputEnum from './InputEnum';
import ADLButton from './CSIButton';
import InputText from './InputText';
import RelatedDisp from './RelatedDisp';

export type DeviceRenderProps = {
    PV: Device;
    UIEntry: Entry;
    [key: string]: any;
    onSubmit: (pv: string, value: string | boolean | number) => void
}

function DeviceRender({ PV, UIEntry, onSubmit, ...args }: DeviceRenderProps) {
    if (!PV) return;
    const pv = PV.name
    const handleSubmitWithPV = (newValue: string | number | boolean) => {
        onSubmit(pv, newValue);
    };

    const renderInput = () => {
        const positionStyle: CSSProperties = {
            left: `${UIEntry.location.x}px`,
            top: `${UIEntry.location.y}px`,
            width: `${UIEntry.size.width}px`,
            height: `${UIEntry.size.height}px`,
            fontSize: '0.85rem',
            position: 'absolute'
        };
        switch (UIEntry.var_type) {
            case "entry":

                if (UIEntry.format === 'string' || typeof PV.value === 'string') {
                    return <InputText val={PV.value} onSubmit={handleSubmitWithPV} style={positionStyle} />;
                }
                else {
                    return <InputNumber val={PV.value} onSubmit={handleSubmitWithPV} precision={PV.precision} style={positionStyle} />;
                }
            case "update":

                if (typeof PV.value === 'number') {
                    // if update value is for an enum
                    if (PV.enum_strs) {
                        return <div style={positionStyle} className="text-blue-900">{PV.enum_strs[PV.value]}</div>
                    }
                    // if update value is just a number
                    if (PV.precision === null) {
                        return <div style={positionStyle} className="text-blue-900">{PV.value}</div>
                    }
                    else{
                        return <div style={positionStyle} className="text-blue-900">{PV.value.toFixed(PV.precision)}</div>
                    }
                }
                // if update value is a string
                else {
                    return <div style={positionStyle} className="text-blue-900 truncate">{PV.value}</div>
                }

            case "menu":
                return <InputEnum val={PV.value} enums={PV.enum_strs} onSubmit={handleSubmitWithPV} style={positionStyle} />
            case "button":
                return <ADLButton label={UIEntry.label} val={parseInt(UIEntry.press_msg!)} onSubmit={handleSubmitWithPV} style={positionStyle} />
            case "related display":
                return <RelatedDisp fileArray={UIEntry.display} label={UIEntry.label} style={positionStyle} {...args} />
            default:
                return <p></p>;
        }

    }

    return (
        <>
            {renderInput()}
        </>
    )
}

export default DeviceRender