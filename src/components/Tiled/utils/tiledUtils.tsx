import { TiledItemLinks } from "@blueskyproject/tiled"

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