import { useState } from 'react';
import Checkbox from './Checkbox';
import { GlobalMetadata } from './types/types';

type InputDict = {
    [key: string]: {
        key: string;
        val: string;
        msg: string;
    };
};

const inputDictDefault: InputDict = {
    exampleKey: {
        key: '',
        val: '',
        msg: '',
    },
    exampleKey2: {
        key: '',
        val: '',
        msg: '',
    },
};

type SettingsMetadataProps = {
    isGlobalMetadataChecked: boolean;
    handleGlobalMetadataCheckboxChange: (isChecked: boolean) => void;
    updateGlobalMetadata: (newGlobalMetadata: GlobalMetadata) => void;
};
export default function SettingsMetadata({
    isGlobalMetadataChecked = false,
    handleGlobalMetadataCheckboxChange = () => {},
    updateGlobalMetadata = () => {},
}: SettingsMetadataProps) {
    const [inputDict, setInputDict] = useState<InputDict>(inputDictDefault);

    const handleChange = (inputNum: string, type: string, newValue: string) => {
        const stateCopy = JSON.parse(JSON.stringify(inputDict));
        let dictionary = {};
        stateCopy[inputNum][type] = newValue;

        if (stateCopy[inputNum].key === '' && stateCopy[inputNum].val !== '') {
            stateCopy[inputNum].msg = 'Provide a key';
            const wipedDictionary = JSON.parse(JSON.stringify(stateCopy));
            wipedDictionary[inputNum].val = '';
            wipedDictionary[inputNum].key = '';
            dictionary = createJSON(wipedDictionary);
        } else {
            stateCopy[inputNum].msg = '';
            dictionary = createJSON(stateCopy);
        }

        setInputDict(stateCopy);
        updateGlobalMetadata(dictionary);
    };

    const createJSON = (nestedObject: InputDict): Record<string, string> => {
        const JSONObject: Record<string, string> = {};
        for (const key in nestedObject) {
            if (nestedObject[key].key !== '') {
                JSONObject[nestedObject[key].key] = nestedObject[key].val;
            }
        }
        return JSONObject;
    };

    return (
        <div className="w-full h-full flex flex-col space-y-4 justify-start overflow-auto">
            <div className="w-full h-fit flex  ">
                <div className="w-16 h-10 flex justify-center items-center flex-shrink-0 ">
                    <Checkbox
                        isChecked={isGlobalMetadataChecked}
                        cb={handleGlobalMetadataCheckboxChange}
                    />
                </div>
                <div className="w-40 h-10 flex items-center flex-shrink-0  ">
                    <p>Constant Metadata</p>
                </div>
                <div className="flex-grow ">
                    <ul className="w-ful max-w-lg">
                        <li className="flex text-center text-slate-500">
                            <p className="mx-2 basis-5/12">key</p>
                            <p className="basis-1/12">:</p>
                            <p className="mx-2 basis-5/12">value</p>
                        </li>
                        {Object.keys(inputDict).map((key) => {
                            const item = inputDict[key];
                            return (
                                <li
                                    key={key}
                                    className="flex items-center text-center w-full relative"
                                >
                                    {item.msg.length > 0 ? (
                                        <p className="text-red-500 text-xs text-left absolute left-5 top-2">
                                            {item.msg}
                                        </p>
                                    ) : (
                                        ''
                                    )}
                                    <input
                                        className={`${item.key.length === 0 && item.val.length > 0 ? 'border-red-500' : 'border-slate-400'} w-5/12 border mx-2 my-1 text-center`}
                                        value={item.key}
                                        onChange={(e) => handleChange(key, 'key', e.target.value)}
                                    />
                                    <p className="w-1/12">:</p>
                                    <input
                                        className="w-5/12 border border-slate-400 mx-2 my-1 text-center"
                                        value={item.val}
                                        onChange={(e) => handleChange(key, 'val', e.target.value)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className="w-full h-fit flex ">
                <div className="w-16 h-10 flex justify-center items-center flex-shrink-0 ">
                    <Checkbox />
                </div>
                <div className="w-40 h-10 flex items-center flex-shrink-0  ">
                    <p>Override Copies</p>
                </div>
            </div>
        </div>
    );
}
