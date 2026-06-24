export function logNormalizeArray(
    array2D: number[][],
    lowerPercentile = 10,
    upperPercentile = 99.99,
): number[][] {
    const flat = array2D.flat().filter((v) => v > 0); // exclude zeros for log

    // Compute percentiles
    const sorted = [...flat].sort((a, b) => a - b);
    const lowerIdx = Math.floor((lowerPercentile / 100) * sorted.length);
    const upperIdx = Math.floor((upperPercentile / 100) * sorted.length);
    const vmin = sorted[lowerIdx];
    const vmax = sorted[upperIdx];
    const logVmin = Math.log(vmin);
    const logVmax = Math.log(vmax);
    const logRange = logVmax - logVmin || 1;

    return array2D.map((row) =>
        row.map((val) => {
            if (val <= 0) return 0; // or NaN if preferred
            const logVal = Math.log(val);
            return ((logVal - logVmin) / logRange) * 255; // scale to 0–255
        }),
    );
}

export function histEqualizeArray(array2D: number[][]): number[][] {
    // Flatten the input and get histogram for 16-bit grayscale values
    const flat = array2D.flat();
    const hist = new Array(65536).fill(0);

    for (const value of flat) {
        hist[value]++;
    }

    // Compute the cumulative distribution function (CDF)
    const cdf = new Array(65536).fill(0);
    cdf[0] = hist[0];
    for (let i = 1; i < hist.length; i++) {
        cdf[i] = cdf[i - 1] + hist[i];
    }

    // Normalize the CDF
    const cdfMin = cdf.find((v) => v > 0) || 0;
    const totalPixels = flat.length;
    const cdfNormalized = cdf.map((v) =>
        Math.round(((v - cdfMin) / (totalPixels - cdfMin)) * 65535),
    );

    // Equalize the image using the normalized CDF
    const equalized = flat.map((val) => cdfNormalized[val]);

    // Convert back to 2D shape and downscale to 8-bit (0–255)
    let idx = 0;
    const result: number[][] = [];
    for (const row of array2D) {
        const newRow = row.map(() => Math.floor(equalized[idx++] / 256));
        result.push(newRow);
    }

    return result;
}

export function histEqualizeUint8Array(array2D: number[][]): number[][] {
    // Flatten the 2D array
    const flat = array2D.flat();

    // Compute histogram (256 bins for uint8)
    const hist = new Array(256).fill(0);
    for (const value of flat) {
        hist[value]++;
    }

    // Compute cumulative distribution function (CDF)
    const cdf = new Array(256).fill(0);
    cdf[0] = hist[0];
    for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + hist[i];
    }

    // Normalize the CDF to [0, 255]
    const totalPixels = flat.length;
    const cdfMin = cdf.find((v) => v > 0) ?? 0;
    const cdfNormalized = cdf.map((v) => Math.round(((v - cdfMin) / (totalPixels - cdfMin)) * 255));

    // Map original pixel values to equalized values
    const equalized = flat.map((val) => cdfNormalized[val]);

    // Reshape back to 2D
    const result: number[][] = [];
    let index = 0;
    for (const row of array2D) {
        const newRow = row.map(() => equalized[index++]);
        result.push(newRow);
    }

    return result;
}
