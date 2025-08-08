import { DetectorSetting } from "../types/cameraTypes";


const type = {
    enum: "enum",
    float: "float",
    integer: "integer",
    string: "string",
    boolean: "boolean"
};

//Define custom area detector settings here. The suffix should not include the initial prefix
// ex) For 13sim1:cam1:DataType, the prefix would be "13sim1:cam1:" and the suffix added to this
// form would just be "DataType." This allows users to provide unique device prefixes 
const adSimDetector: DetectorSetting[] = [
    {
        title: "Acquisition Settings",
        icon: null,
        prefix: 'cam1',
        inputs: [
            {
                suffix: "GainGreen_RBV",
                label: "Gain Red",
                type: 'float',
                min: 0,
                max: 100
            },
            {
                suffix: "ImageMode",
                label: "Capture Mode",
                type: 'enum',
                enums: ['Single', 'Multiple', 'Continuous']
            },
            {
                suffix: "AcquireTime",
                label: "Exposure Time",
                type: 'float',
                min: 0.00001,
                max: 10
            },
            {
                suffix: "AcquirePeriod",
                label: "Acquire Period",
                type: 'float',
                min: 0.01,
                max: 10
            },
            {
                suffix: "NumImages",
                label: "Num Images",
                type: 'integer',
                min: 1,
                max: 100
            },
            {
                suffix: "ColorMode",
                label: "Color Mode",
                type: 'enum',
                enums: ["Mono", "RGB1", "RGB2", "RGB3"]
            },
            {
                suffix: "DataType",
                label: "Data Type",
                type: 'enum',
                enums: ["Int8", "UInt8", "Int16", "UInt16"]
            },
        ],
    },
    {
        title: "Simulation Settings",
        icon: null,
        prefix: 'cam1',
        inputs: [
            {
                suffix: "SimMode",
                label: "Sim Mode",
                type: 'enum',
                enums: ["LinearRamp", "Peaks", "Sine", "Offset&Noise"]
            },
            {
                suffix: "GainRed",
                label: "Gain Red",
                type: 'float',
                min: 0,
                max: 100
            },
            {
                suffix: "GainGreen",
                label: "Gain Green",
                type: 'float',
                min: 0,
                max: 100
            },
            {
                suffix: "GainBlue",
                label: "Gain Blue",
                type: 'float',
                min: 0,
                max: 100
            },
            {
                suffix: "Noise",
                label: "Noise",
                type: 'float',
                min: 0,
                max: 100
            },

        ]
    },
    {
        title: "Size Settings",
        icon: null,
        prefix: 'cam1',
        inputs: [
            //Removed these settings for now, the backend tries to re size an image based on minX/Y 
            //but it seems the img always starts from 0,0.
            //There is probably a plugin that is used for MinX/Y, figure out later.
            // {
            //     suffix: "MinX",
            //     label: "start X",
            //     type: 'integer',
            //     min: 0,
            //     max: 1024
            // },
            // {
            //     suffix: "MinY",
            //     label: "start Y",
            //     type: 'integer',
            //     min: 0,
            //     max: 1024
            // },
            {
                suffix: "SizeX",
                label: "Size X",
                type: 'integer',
                min: 1,
                max: 1024
            },
            {
                suffix: "SizeY",
                label: "Size Y",
                type: 'integer',
                min: 1,
                max: 1024
            },
        ]
    },
    {
        title: "Plugins",
        icon: null,
        prefix: null, //TO DO: check if we could make this an empty string and therefore remove null from prefix type
        inputs: [
            {
                suffix: "image1:EnableCallbacks",
                label: "ND Array Port",
                type: 'enum',
                enums: ['Enable', 'Disable']
            },
        ]
    }
];

const basler: DetectorSetting[] = [
    {
        title: "Acquisition Settings",
        icon: null,
        prefix: 'cam1',
        inputs: [
            {
                suffix: "AcquireTime",
                label: "Exposure Time",
                type: 'float',
                min: 0.00001,
                max: 10
            },
            {
                suffix: "AcquirePeriod",
                label: "Acquire Period",
                type: 'float',
                min: 0.01,
                max: 10
            },
            {
                suffix: "NumImages",
                label: "Num Images",
                type: 'integer',
                min: 1,
                max: 100
            },
            {
                suffix: "ColorMode",
                label: "Color Mode",
                type: 'enum',
                enums: ["Mono", "RGB1", "RGB2", "RGB3"]
            },
            {
                suffix: "GainRed",
                label: "Gain Red",
                type: 'float',
                min: 0,
                max: 100
            },
            {
                suffix: "GainGreen",
                label: "Gain Green",
                type: 'float',
                min: 0,
                max: 100
            },
            {
                suffix: "GainBlue",
                label: "Gain Blue",
                type: 'float',
                min: 0,
                max: 100
            },
            {
                suffix: "DataType",
                label: "Data Type",
                type: 'enum',
                enums: ["Int8", "UInt8", "Int16", "UInt16"]
            },
        ],
    },
    {
        title: "Size Settings",
        icon: null,
        prefix: 'cam1',
        inputs: [
            {
                suffix: "MinX",
                label: "start X",
                type: 'integer',
                min: 0,
                max: 1024
            },
            {
                suffix: "MinY",
                label: "start Y",
                type: 'integer',
                min: 0,
                max: 1024
            },
            {
                suffix: "SizeX",
                label: "Size X",
                type: 'integer',
                min: 1,
                max: 1024
            },
            {
                suffix: "SizeY",
                label: "Size Y",
                type: 'integer',
                min: 1,
                max: 1024
            },
        ]
    },
    {
        title: "Plugins",
        icon: null,
        prefix: null,
        inputs: [
            {
                suffix: "image1:EnableCallbacks",
                label: "ND Array Port",
                type: 'enum',
                enums: ['Enable', 'Disable']
            },
        ]
    }
];


// Add new camera IOCs to cameraDeviceData to be discoverable in the app
const cameraDeviceData: { [key: string]: DetectorSetting[] } = {
    ADSimDetector: adSimDetector,
    basler: basler
}

export { cameraDeviceData, type };