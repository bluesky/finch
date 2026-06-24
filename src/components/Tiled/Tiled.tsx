//In this file we will import the Tiled component installed from NPM and wrap it in our own "Tiled" component with the exact same props
//This allows to import the css styles from the NPM Tiled component so they are built into the finch css bundle
//The user does not need to import the Tiled styles themselves with this wrapper method
import { Tiled } from '@blueskyproject/tiled';
import { TiledProps } from '@blueskyproject/tiled';
import '@blueskyproject/tiled/style.css'; // Import the Tiled styles
import React from 'react';
import { useTiledApiUrls } from '@/utils/apiUtils';

const TiledWrapper: React.FC<TiledProps> = (props) => {
    //allow finch config to be used in args if not provided directly as props
    //finch config url will always be used, but the apiKey will only be sent if provided as a prop, or if assigned in finch config
    const defaultTiledUrl = useTiledApiUrls().httpBaseUrl;
    const defaultTiledApiKey = useTiledApiUrls().apiKey;

    const tiledBaseUrl = props.tiledBaseUrl || defaultTiledUrl;
    const tiledApiKey = props.apiKey || defaultTiledApiKey;

    return <Tiled {...props} tiledBaseUrl={tiledBaseUrl} apiKey={tiledApiKey ?? undefined} />;
};

export type { TiledProps } from '@blueskyproject/tiled';

export default TiledWrapper;
