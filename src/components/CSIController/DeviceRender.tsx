import { CSSProperties } from 'react'
import { Device } from "@/types/deviceControllerTypes";
import { Entry } from './types/UIEntry';
import InputNumber from './InputNumber';
import InputEnum from './InputEnum';
import ADLButton from './Button';
import InputText from './InputText';
import RelatedDisp from './RelatedDisp';
import { pxToEm } from './utils/units';
import { cn } from '@/lib/utils';
import styles from "./styles.json"
import { useVariant } from './VariantContext';

export type DeviceRenderProps = {
    PV: Device;
    UIEntry: Entry;
    [key: string]: any;
    onSubmit: (pv: string, value: string | boolean | number) => void
}

function DeviceRender({ PV, UIEntry, onSubmit, ...args }: DeviceRenderProps) {
    if (!PV) return;
    const { variant } = useVariant();
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

                if (typeof PV.value === 'number') {
                    // if update value is for an enum
                    if (PV.enum_strs) {
                        return <div style={positionStyle} className={cn("text-blue-900", styles.variants[variant as keyof typeof styles.variants].text_update)}>{PV.enum_strs[PV.value]}</div>
                    }
                    // if update value is just a number
                    if (PV.precision === null) {
                        return <div style={positionStyle} className={cn("text-blue-900", styles.variants[variant as keyof typeof styles.variants].text_update)}>{PV.value}</div>
                    }
                    else{
                        return <div style={positionStyle} className={cn("text-blue-900", styles.variants[variant as keyof typeof styles.variants].text_update)}>{PV.value.toFixed(PV.precision)}</div>
                    }
                }
                // if update value is a string
                else {
                    return <div style={positionStyle} className={cn("text-blue-900 truncate", styles.variants[variant as keyof typeof styles.variants].text_update)}>{PV.value}</div>
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