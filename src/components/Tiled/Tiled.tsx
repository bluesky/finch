//In this file we will import the Tiled component installed from NPM and wrap it in our own "Tiled" component with the exact same props
//This allows to import the css styles from the NPM Tiled component so they are built into the finch css bundle
//The user does not need to import the Tiled styles themselves with this wrapper method
import { Tiled } from '@blueskyproject/tiled';
import { TiledProps } from '@blueskyproject/tiled';
import '@blueskyproject/tiled/style.css'; // Import the Tiled styles
import React from 'react';

const TiledWrapper: React.FC<TiledProps> = (props) => {
  return <Tiled {...props} />;
};

//i need to export the original TiledProps
export type { TiledProps } from '@blueskyproject/tiled';

export default TiledWrapper;
