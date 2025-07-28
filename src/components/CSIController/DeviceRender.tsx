import { CSSProperties } from 'react'
import { Device } from "@/types/deviceControllerTypes";
import { Entry } from './types/UIEntry';
import InputNumber from './InputNumber';
import InputEnum from './InputEnum';
import Button from './Button';
import InputText from './InputText';
import RelatedDisp from './RelatedDisp';
import { pxToEm } from './utils/units';
import { TextUpdate } from './TextUpdate';

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
            left: pxToEm(UIEntry.location.x),
            top: pxToEm(UIEntry.location.y),
            width: pxToEm(UIEntry.size.width),
            height: pxToEm(UIEntry.size.height),
            fontSize: '1em',
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
                return <TextUpdate val={PV.value} enum_strs={PV.enum_strs} precision={PV.precision} style={positionStyle}/>
            case "menu":
                return <InputEnum val={PV.value} enums={PV.enum_strs} onSubmit={handleSubmitWithPV} style={positionStyle} />
            case "button":
                return <Button val={parseInt(UIEntry.press_msg!)} label={UIEntry.label} onSubmit={handleSubmitWithPV} style={positionStyle} />
            case "related display":
                return <RelatedDisp fileArray={UIEntry.display} label={UIEntry.label} style={positionStyle} {...args} />
            default:
                return <></>;
        }

    }

    return (
        <>
            {renderInput()}
        </>
    )
}

export default DeviceRender