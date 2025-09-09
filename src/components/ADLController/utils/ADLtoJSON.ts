export interface CustomFormatObject {
    [key: string]: any;
}

export function parseCustomFormat(input: string): CustomFormatObject[] {
    const lines = input.split('\n').filter(line => line.trim() !== '');
    let index = 0;

    function removeQuotes(str: string): string {
        return str.startsWith('"') && str.endsWith('"') ? str.slice(1, -1) : str;
    }

    function parseObject(): Record<string, any> {
        const obj: Record<string, any> = {};
        while (index < lines.length) {
            const line = lines[index].trim();
            if (line.endsWith('}')) {
                index++;
                return obj; // end of object
            }

            // handles key value pairs
            if (line.includes('=')) {
                const equalIndex = line.indexOf('=');
                const key = line.substring(0, equalIndex).trim();
                let value = line.substring(equalIndex + 1).trim();

                const cleanKey = removeQuotes(key);
                if (key === 'args') {
                    const result: Record<string, string> = {};

                    // Split by comma and process each key-value pair
                    value.split(',').forEach(pair => {
                        const trimmedPair = pair.trim();
                        const cleanPair=trimmedPair.replace(/"/g, '');
                        const equalIndex = cleanPair.indexOf('=');

                        if (equalIndex > 0) {
                            const key = cleanPair.substring(0, equalIndex).trim();
                            const value = cleanPair.substring(equalIndex + 1).trim();
                            result[key] = value;
                        }
                    });

                    obj[cleanKey] = result;
                    index++

                }
                else {
                    obj[cleanKey] = value.startsWith('"') ? value.slice(1, -1) : Number(value) || value;
                    index++;
                }

            }

            // handles nested objects
            else if (line.endsWith('{')) {
                const rawKey = line.split('{')[0].trim();
                const key = rawKey.startsWith('"') ? rawKey.slice(1, -1) : rawKey;

                index++;
                if (key === 'children') {
                    const childArr = [];
                    while (index < lines.length) {
                        const childLine = lines[index].trim();
                        if (childLine === '}') {
                            index++;
                            break; // end of children
                        }
                        if (childLine.endsWith('{')) {
                            const childRawKey = childLine.split('{')[0].trim();
                            const childKey = removeQuotes(childRawKey);
                            index++;
                            const childObj = parseObject();
                            childArr.push({ [childKey]: childObj });
                        } else {
                            index++;
                        }
                    }
                    obj[key] = childArr;
                }

                else {
                    obj[key] = parseObject(); // Recurse
                }
            }
            else {
                index++; // default case for weird lines
            }
        }
        return obj;
    }
    const arr = [];
    let result: Record<string, any> = {};
    while (index < lines.length) {
        const line = lines[index].trim();
        if (line.endsWith('{')) {
            const rawKey = line.split('{')[0].trim();
            const key = removeQuotes(rawKey);
            index++;
            result[key] = parseObject();
        }

        arr.push(result);
        result = {};
    }
    // const res_arr = [];
    // res_arr.push(arr);
    // console.log(JSON.stringify(arr))
    return arr;
}
