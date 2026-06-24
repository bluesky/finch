const type = {
    enum: 'enum',
    float: 'float',
    integer: 'integer',
};

const cameraFormData = [
    {
        title: 'Acquisition Settings',
        icon: null,
        inputs: [
            {
                pv: 'DataType',
                label: 'Data Type',
                type: type.enum,
                enums: ['Int8', 'UInt8', 'Int16', 'UInt16'],
            },
            {
                pv: 'ColorMode',
                label: 'Color Mode',
                type: type.enum,
                enums: ['Mono', 'RGB1', 'RGB2', 'RGB3'],
            },
            {
                pv: 'AcquireTime',
                label: 'Exposure Time',
                type: type.float,
                min: 0.00001,
                max: 10,
            },
            {
                pv: 'AcquirePeriod',
                label: 'Acquire Period',
                type: type.float,
                min: 0.01,
                max: 10,
            },
            {
                pv: 'NumImages',
                label: 'Num Images',
                type: type.integer,
                min: 1,
                max: 100,
            },
        ],
    },
    {
        title: 'Size Settings',
        icon: null,
        inputs: [
            {
                pv: 'MinX',
                label: 'start X',
                type: type.integer,
                min: 0,
                max: 1024,
            },
            {
                pv: 'MinY',
                label: 'start Y',
                type: type.integer,
                min: 0,
                max: 1024,
            },
            {
                pv: 'SizeX',
                label: 'Size X',
                type: type.integer,
                min: 1,
                max: 1024,
            },
            {
                pv: 'SizeY',
                label: 'Size Y',
                type: type.integer,
                min: 1,
                max: 1024,
            },
        ],
    },
];

export { cameraFormData };
