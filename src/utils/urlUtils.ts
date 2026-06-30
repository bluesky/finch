/**
 * Converts an HTTP(S) URL to its WebSocket equivalent.
 * @param httpUrl - An `http://` or `https://` URL.
 * @returns The URL with the protocol replaced by `ws://` or `wss://` respectively.
 */
export function httpToWsUrl(httpUrl: string): string {
    return httpUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
}

/**
 * Normalizes and validates a URL
 * @param url - Raw URL that might be malformed
 * @param label - Human-readable name for error messages
 * @returns Cleaned URL or undefined if invalid
 */
export function cleanUrl(url: string | undefined, label: string): string | undefined {
    if (!url || url.trim() === '') {
        return undefined;
    }

    try {
        let cleanedUrl = url.trim();

        // Remove trailing slashes
        cleanedUrl = cleanedUrl.replace(/\/+$/, '');

        // Add protocol if missing (assume http for local development)
        if (!cleanedUrl.match(/^https?:\/\//)) {
            // Check if it looks like a local address
            if (cleanedUrl.match(/^(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+)/)) {
                cleanedUrl = `http://${cleanedUrl}`;
            } else {
                cleanedUrl = `https://${cleanedUrl}`;
            }
        }

        // Validate by creating URL object
        const urlObj = new URL(cleanedUrl);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            console.warn(
                `Invalid protocol for ${label}: ${urlObj.protocol}. Only http and https are allowed.`,
            );
            return undefined;
        }

        return urlObj.toString().replace(/\/$/, ''); // Remove trailing slash again
    } catch (error) {
        console.error(`Invalid URL format for ${label}: "${url}"`, error);
        return undefined;
    }
}
