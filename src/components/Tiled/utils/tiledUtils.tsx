import { TiledItemLinks } from "@blueskyproject/tiled"
import { getBlueskyPlanMetadata } from "@blueskyproject/tiled";

export const getPathFromLinks = (links: TiledItemLinks) => {
    //given a links object from Tiled (inserted on the 'select' button in <Tiled/>) return the path to use as a prop in other components
    const self = links?.self
    if (!self) {
        throw new Error("No self link found in TiledItemLinks")
    }
    //the path always follows the 'metadata' segment in the URL
    // ex) "self": "http://localhost:8000/api/v1/metadata/84a5d02c-c5c9-4054-a84a-ff715f02d71a/streams/primary/internal"
    const url = new URL(self)
    const pathIndex = url.pathname.indexOf('/metadata/')
    if (pathIndex === -1) {
        throw new Error("No metadata segment found in self link URL")
    }
    const path = url.pathname.substring(pathIndex + '/metadata'.length)
    return path;
}

/**
 * Checks if a Bluesky run is complete by looking for the 'stop' property in metadata
 * @param path - The bluesky run ID to check
 * @returns Promise<boolean> - true if run is complete, false if ongoing
 */
export const checkRunCompletion = async (path: string): Promise<boolean> => {
    try {
        console.log(`[tiledUtils] Checking run completion for path: ${path}`);
        const metadata = await getBlueskyPlanMetadata(path);
        
        // Safety check: if metadata is falsy, don't proceed
        if (!metadata) {
            console.log(`[tiledUtils] No metadata returned, assuming run is ongoing`);
            return false;
        }
        
        console.log(`[tiledUtils] Metadata result:`, metadata);
        
        // Check if metadata has a 'stop' property at data.attributes.metadata.stop
        const hasStop = metadata?.data?.attributes?.metadata?.stop !== undefined;
        
        if (hasStop) {
            console.log(`[tiledUtils] Run is complete (found 'stop' in data.attributes.metadata)`);
            return true; // Run is complete
        } else {
            console.log(`[tiledUtils] Run is still ongoing (no 'stop' in data.attributes.metadata)`);
            return false; // Run is ongoing
        }
    } catch (error) {
        console.warn(`[tiledUtils] Error checking metadata:`, error);
        // On error, assume run is ongoing
        return false;
    }
};