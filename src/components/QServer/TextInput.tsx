import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { CopiedPlan } from "./types/types";

type TextInputProps = {
    cb: (value: string | number ) => void;
    value?: string | number;
    label: string;
    description?: string;
    required?: boolean;
    styles?: string;
    resetInputsTrigger?: boolean;
    copiedPlan?: CopiedPlan | null;
    type?: string;
};
export default function TextInput( 
    {
        cb, 
        value='', 
        label='', 
        description='', 
        required=false, 
        styles='', 
        resetInputsTrigger=false, 
        copiedPlan=null,
        type='text'
    }:TextInputProps ) {
    const [inputValue, setInputValue] = useState(value);

    const intTypeList = ['num'];
    const floatTypeList = ['delay', 'start', 'stop', 'min_step', 'step_factor'];
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (intTypeList.includes(label) || type==="int") {
            if (/^\d*$/.test(newValue)) {
                setInputValue(newValue);
                cb(newValue === '' ? '' : parseInt(newValue));
            }
        } else if (floatTypeList.includes(label) || type=="float") {
            if (/^\d*\.?\d*$/.test(newValue)) {
                setInputValue(newValue);
                cb(newValue === '' ? '' : parseFloat(newValue));
            }
        } else {
            setInputValue(newValue);
            cb(newValue);
        }
    };

    useEffect(()=> {
        setInputValue('');
    }, [resetInputsTrigger]);

    useEffect(() => {
        setInputValue(value);
    }, [copiedPlan])

    return (
       <div className={`border-2 border-slate-300 rounded-lg w-5/12 max-w-48 min-w-36 mt-2 h-fit ${styles}`}>
            <p id={label+'ParamInputTooltip'} className="text-sm pl-4 text-gray-500 border-b border-dashed border-slate-300">{`${label} ${required ? '(required)' : '(optional)'}`}</p>
            <Tooltip anchorSelect={'#' + label + 'ParamInputTooltip'} children={<p className="whitespace-pre-wrap">{description}</p>} place="top" variant="info" style={{'maxWidth' : "500px", 'height': 'fit-content'}} delayShow={400}/>
            <input 
                className="w-full rounded-b-lg outline-none h-8 text-lg pl-2 text-center" 
                type="text" 
                value={inputValue} 
                onChange={e => handleChange(e)}
            />
       </div>
    )
}