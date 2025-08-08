import type { Meta, StoryObj } from '@storybook/react';
import SynopticView from '../components/BeamVisSynoptic';
import { nodes, edges } from '../components/BeamVis/Synoptic_Config';
import * as THREE from 'three';

const meta = {
    title: 'Bluesky Components/SynopticView',
    component: SynopticView,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],

    decorators: [
        (Story) => (
            <div style={{ width: '720px', height: '400px', margin: '2em', border: '1px solid #ccc' }}>
                <Story />
            </div>
        ),
    ],
    argTypes: {},
} satisfies Meta<typeof SynopticView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        nodes: nodes,
        edges: edges,
        motionState: {
            isMoving: false,
            objectId: null,
            startPosition: null,
        },
    },
};

export const MovingNode: Story = {
    args: {
        nodes: nodes.map(node =>
            node.id === 'sample-mount' ? { ...node, status: 'moving' } : node
        ),
        edges: edges,
        motionState: {
            isMoving: true,
            objectId: 'sample-mount',
            startPosition: new THREE.Vector3(0, 0, 0),
        },
    },
};