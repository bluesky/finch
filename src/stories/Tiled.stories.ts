import type { Meta, StoryObj } from '@storybook/react';
import TiledWrapper from '../components/Tiled/Tiled';
import '@blueskyproject/tiled/style.css'; // Import the Tiled styles

// const mockTiledResponse = {
//     "data": [
//         {
//             "id": "sampleFolder",
//             "attributes": {
//                 "ancestors": [],
//                 "structure_family": "container",
//                 "specs": [],
//                 "metadata": {
//                     "multiscales": [
//                         {
//                             "@type": "ngff:Image",
//                             "axes": [
//                                 {
//                                     "name": "z",
//                                     "type": "space",
//                                     "unit": "micrometer"
//                                 },
//                                 {
//                                     "name": "y",
//                                     "type": "space",
//                                     "unit": "micrometer"
//                                 },
//                                 {
//                                     "name": "x",
//                                     "type": "space",
//                                     "unit": "micrometer"
//                                 }
//                             ],
//                             "datasets": [
//                                 {
//                                     "coordinateTransformations": [
//                                         {
//                                             "scale": [
//                                                 0.639,
//                                                 0.639,
//                                                 0.639
//                                             ],
//                                             "type": "scale"
//                                         },
//                                         {
//                                             "translation": [
//                                                 0.0,
//                                                 0.0,
//                                                 0.0
//                                             ],
//                                             "type": "translation"
//                                         }
//                                     ],
//                                     "path": "scale0/image"
//                                 },
//                                 {
//                                     "coordinateTransformations": [
//                                         {
//                                             "scale": [
//                                                 1.278,
//                                                 1.278,
//                                                 1.278
//                                             ],
//                                             "type": "scale"
//                                         },
//                                         {
//                                             "translation": [
//                                                 0.3195,
//                                                 0.3195,
//                                                 0.3195
//                                             ],
//                                             "type": "translation"
//                                         }
//                                     ],
//                                     "path": "scale1/image"
//                                 },
//                                 {
//                                     "coordinateTransformations": [
//                                         {
//                                             "scale": [
//                                                 2.556,
//                                                 2.556,
//                                                 2.556
//                                             ],
//                                             "type": "scale"
//                                         },
//                                         {
//                                             "translation": [
//                                                 0.9585,
//                                                 0.9585,
//                                                 0.9585
//                                             ],
//                                             "type": "translation"
//                                         }
//                                     ],
//                                     "path": "scale2/image"
//                                 },
//                                 {
//                                     "coordinateTransformations": [
//                                         {
//                                             "scale": [
//                                                 5.112,
//                                                 5.112,
//                                                 5.112
//                                             ],
//                                             "type": "scale"
//                                         },
//                                         {
//                                             "translation": [
//                                                 2.2365,
//                                                 2.2365,
//                                                 2.2365
//                                             ],
//                                             "type": "translation"
//                                         }
//                                     ],
//                                     "path": "scale3/image"
//                                 },
//                                 {
//                                     "coordinateTransformations": [
//                                         {
//                                             "scale": [
//                                                 10.224,
//                                                 10.224,
//                                                 10.224
//                                             ],
//                                             "type": "scale"
//                                         },
//                                         {
//                                             "translation": [
//                                                 4.7925,
//                                                 4.7925,
//                                                 4.7925
//                                             ],
//                                             "type": "translation"
//                                         }
//                                     ],
//                                     "path": "scale4/image"
//                                 },
//                                 {
//                                     "coordinateTransformations": [
//                                         {
//                                             "scale": [
//                                                 20.448,
//                                                 10.224,
//                                                 10.224
//                                             ],
//                                             "type": "scale"
//                                         },
//                                         {
//                                             "translation": [
//                                                 9.9045,
//                                                 4.7925,
//                                                 4.7925
//                                             ],
//                                             "type": "translation"
//                                         }
//                                     ],
//                                     "path": "image"
//                                 }
//                             ],
//                             "name": "image",
//                             "version": "0.4"
//                         }
//                     ]
//                 },
//                 "structure": {
//                     "contents": null,
//                     "count": 0
//                 },
//                 "sorting": [
//                     {
//                         "key": "",
//                         "direction": 1
//                     }
//                 ],
//                 "data_sources": null
//             },
//             "links": {
//                 "self": "http://localhost:8000/api/v1/metadata/sampleFolder",
//                 "search": "http://localhost:8000/api/v1/search/sampleFolder",
//                 "full": "http://localhost:8000/api/v1/container/full/sampleFolder"
//             },
//             "meta": null
//         }
//     ],
//     "error": null,
//     "links": {
//         "self": "http://localhost:8000/api/v1/search/?page[offset]=0&page[limit]=100",
//         "first": "http://localhost:8000/api/v1/search/?page[offset]=0&page[limit]=100",
//         "last": "http://localhost:8000/api/v1/search/?page[offset]=0&page[limit]=100",
//         "next": null,
//         "prev": null
//     },
//     "meta": {
//         "count": 1
//     }
// };

// const mockTiledResponseFolder = {
//     "data": [
//         {
//             "id": "image",
//             "attributes": {
//                 "ancestors": [
//                     "sampleFolder"
//                 ],
//                 "structure_family": "array",
//                 "specs": [],
//                 "metadata": {},
//                 "structure": {
//                     "data_type": {
//                         "endianness": "little",
//                         "kind": "f",
//                         "itemsize": 4,
//                         "dt_units": null
//                     },
//                     "chunks": [
//                         [
//                             128,
//                             7
//                         ],
//                         [
//                             128,
//                             32
//                         ],
//                         [
//                             128,
//                             32
//                         ]
//                     ],
//                     "shape": [
//                         135,
//                         160,
//                         160
//                     ],
//                     "dims": null,
//                     "resizable": false
//                 },
//                 "sorting": null,
//                 "data_sources": null
//             },
//             "links": {
//                 "self": "http://127.0.0.1:8000/api/v1/metadata/sampleFolder/image",
//                 "full": "http://127.0.0.1:8000/api/v1/array/full/sampleFolder/image",
//                 "block": "http://127.0.0.1:8000/api/v1/array/block/sampleFolder/image?block={0},{1},{2}"
//             },
//             "meta": null
//         }
//     ],
//     "error": null,
//     "links": {
//         "self": "http://127.0.0.1:8000/api/v1/search/sampleFolder?page[offset]=0&page[limit]=100",
//         "first": "http://127.0.0.1:8000/api/v1/search/sampleFolder?page[offset]=0&page[limit]=100",
//         "last": "http://127.0.0.1:8000/api/v1/search/sampleFolder?page[offset]=0&page[limit]=100",
//         "next": null,
//         "prev": null
//     },
//     "meta": {
//         "count": 1
//     }
// }

const meta = {
    title: 'Bluesky Components/Tiled',
    component: TiledWrapper,
    parameters: {
      layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
    }
} satisfies Meta<typeof TiledWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    reverseSort: false,
    enableStartupScreen: false,
    size: 'medium',
    tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
    onSelectCallback: (links) => console.log('Selected Tiled link:', links.self),
    isButtonMode: false,
    isPopup: false,
    singleColumnMode: false,
    isFullWidth: false,
    buttonModeText: undefined,
    apiKey: undefined,
    bearerToken: undefined,
    closeOnSelect: false,
  },
};

export const LocalHostUrl: Story = {
    args: {
      size: 'medium',
    },
  };

export const CustomUrl: Story = {
    args: {
      enableStartupScreen: true,
      size: 'medium',
    },
  };

  export const ButtonMode: Story = {
    args: {
      isButtonMode: true,
      size: 'medium',
      tiledBaseUrl: 'https://tiled-demo.nsls2.bnl.gov/api/v1',
      reverseSort: false,
    },
  };

