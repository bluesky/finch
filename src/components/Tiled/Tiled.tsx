// Wraps the TiledFinder viewer (source in ./TiledFinder, formerly the @blueskyproject/tiled package)
// so that Finch config supplies the Tiled URL and API key when they are not passed as props.
import Tiled, { type TiledProps } from './TiledFinder/Tiled';
import React from 'react';
import { useTiledApiUrls } from '@/utils/apiUtils';

const TiledFinder: React.FC<TiledProps> = (props) => {
    //allow finch config to be used in args if not provided directly as props
    //finch config url will always be used, but the apiKey will only be sent if provided as a prop, or if assigned in finch config
    const defaultTiledUrl = useTiledApiUrls().httpBaseUrl;
    const defaultTiledApiKey = useTiledApiUrls().apiKey;

    const tiledBaseUrl = props.tiledBaseUrl || defaultTiledUrl;
    const tiledApiKey = props.apiKey || defaultTiledApiKey;

    return <Tiled {...props} tiledBaseUrl={tiledBaseUrl} apiKey={tiledApiKey ?? undefined} />;
};

export type { TiledProps } from './TiledFinder/Tiled';

TiledFinder.displayName = 'TiledFinder';

export default TiledFinder;
