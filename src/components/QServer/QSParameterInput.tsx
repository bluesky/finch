import TextInput from "./TextInput";
import MultiSelectInput from "./MulitSelectInput";
import SingleSelectInput from "./SingleSelectInput";
import DictionaryInput from "./DictionaryInput";
import { Device } from "./types/apiTypes";
import { ParameterInput, ParameterInputDict, Plan, CopiedPlan, AllowedDevices } from "./types/types";

type QSParameterInputProps = {
    cb?: (arg0: any) => void;
    allowedDevices: AllowedDevices;
    param: ParameterInput;
    parameter: ParameterInput;
    parameterName: string;
    updateBodyKwargs?: (arg0: ParameterInputDict) => void;
    parameters: ParameterInputDict;
    setParameters: React.Dispatch<React.SetStateAction<ParameterInputDict | null>>;
    styles?: string;
    resetInputsTrigger: boolean;
    copiedPlan: CopiedPlan | null;
    isGlobalMetadataChecked?: boolean;
    globalMetadata: any;
};
export default function QSParameterInput( {
    cb=()=>{}, 
    allowedDevices, 
    parameter, 
    parameterName='',
    updateBodyKwargs=()=>{}, 
    setParameters, 
    styles='', 
    resetInputsTrigger=false, 
    copiedPlan=null, 
    isGlobalMetadataChecked=false, 
    globalMetadata={}}: QSParameterInputProps) {
    //to do: refactor to remove parameterName and change param to a string

    //-----Functions for MultiSelectInput ---------------
    const isItemInArray = (item:string) => {
        if (Array.isArray(parameter.value)) {
            return parameter.value.includes(item);
        } else {
            return false;
        }  
    };

    const addItem = (item:string) => {
        setParameters(state => {
            var stateCopy = JSON.parse(JSON.stringify(state));
            const newSelectedItems = [...stateCopy[parameterName].value, item];
            stateCopy[parameterName].value = newSelectedItems;
            updateBodyKwargs(stateCopy); //change body state under 'review'
            return stateCopy;
        });
    };

    const removeItem = (item:String) => {
        setParameters(state => {
            var stateCopy = JSON.parse(JSON.stringify(state));
            const newSelectedItems = stateCopy[parameterName].value.filter((i:string) => i !== item);
            stateCopy[parameterName].value = newSelectedItems;
            updateBodyKwargs(stateCopy); //change body state under 'review'
            return stateCopy;
        });
    }

    //-------Functions for TextInput ----------
    const handleInputChange = (value:string | number) => {
        //todo: verify if a 'number' could even be sent. using 'number' due to the handleChange in TextInput.tsx for ts

        setParameters(state => {
            var stateCopy = JSON.parse(JSON.stringify(state));
            stateCopy[parameterName].value = value;
            updateBodyKwargs(stateCopy);
            return stateCopy;
        });
    };



    //----------Functions for single select input -------------//
    const singleInputTypeList = ['motor', 'signal', 'x_motor', 'y_motor'];
    const isInputTypeEnum = () => {
        if (singleInputTypeList.includes(parameterName)) return true;
        if (parameter.annotation) {
            if (parameter.annotation.type === 'Typing.Any')
                return true;
            if (parameter.convert_device_names === true) //only reason to set this is if you have a device, therefore must be an enum
                return true;
            if (parameter.annotation.devices)
                return true;
        }
        if (parameter.enums) return true;
        return false;
    }
    const replaceItem = (item:string) => {
        setParameters(state => {
            var stateCopy = JSON.parse(JSON.stringify(state));
            const newSelectedItem = item;
            stateCopy[parameterName].value = newSelectedItem;
            updateBodyKwargs(stateCopy); //change body state under 'review'
            return stateCopy;
        });
    };

    const clearItem = () => {
        setParameters(state => {
            var stateCopy = JSON.parse(JSON.stringify(state));
            stateCopy[parameterName].value = '';
            updateBodyKwargs(stateCopy); //change body state under 'review'
            return stateCopy;
        }); 
    };


    //----------Functions for dictionary input -------------//
    const dictionaryInputTypeList = ['md'];

    const handleDictionaryChange = (dict:{[key:string]: string}, deleteParam=false) => {
        setParameters(state => {
            var stateCopy = JSON.parse(JSON.stringify(state));
            stateCopy[parameterName].value = dict;
            if (deleteParam) {
                var removedBodyParams = JSON.parse(JSON.stringify(state));
                delete removedBodyParams[parameterName];
                updateBodyKwargs(removedBodyParams);
            } else {
                updateBodyKwargs(stateCopy);
            }
            return stateCopy;
        });
    };


    // ----to do, create a boolean input for parameters like 'snake'
    if (Array.isArray(parameter.value)) {
        return <MultiSelectInput 
                    isItemInArray={isItemInArray} 
                    addItem={addItem} 
                    removeItem={removeItem} 
                    selectedItems={parameter.value} 
                    label={parameterName} 
                    allowedDevices={allowedDevices} 
                    required={parameter.required} 
                    description={parameter.description}
                />
    } else {
        if (isInputTypeEnum()) {
            return <SingleSelectInput 
                required={parameter.required} 
                isItemInArray={isItemInArray} 
                addItem={replaceItem} 
                clearItem={clearItem} 
                value={parameter.value} 
                label={parameterName} 
                allowedDevices={allowedDevices} 
                description={parameter.description}
            />
        } else if(dictionaryInputTypeList.includes(parameterName)) {
            return <DictionaryInput 
                copiedPlan={copiedPlan} 
                required={parameter.required} 
                description={parameter.description} 
                label={parameterName} 
                cb={handleDictionaryChange} 
                resetInputsTrigger={resetInputsTrigger} 
                isGlobalMetadataChecked={isGlobalMetadataChecked} 
                globalMetadata={globalMetadata}
            />
        } else {
            return <TextInput 
                copiedPlan={copiedPlan} 
                label={parameterName} 
                value={parameter.value} 
                cb={handleInputChange} 
                required={parameter.required} 
                description={parameter.description} 
                resetInputsTrigger={resetInputsTrigger}
                type={parameter.annotation?.type ? parameter.annotation.type : 'text'}
            />
        }
    }
}