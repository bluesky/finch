export const TOP_Y = 100;
const BOT_Y = 250;
const MID_Y = (TOP_Y + BOT_Y) / 2;

// point for path generation
export interface Point {
  x: number;
  y: number;
}

// node on beamline
export interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  status: keyof typeof statusColor;
  icon?: string;
}

// edge between nodes
export interface Edge {
  from: string;
  to: string;
  orthogonalVia?: Point[];
}

// map statuses to fill colors
export const statusColor = {
  ok:           '#005B88',
  moving:       '#F9C80E',
  finished:     '#A1C181',
  limit:        '#F86624',
  disconnected: '#EF476F',
};

// use the same data shape as before
export const nodes: Node[] = [
  // top row
  { id: 'source',          label: 'Source',          x:  50, y: TOP_Y, status: 'ok', icon: 'source.svg' },
  { id: 'toroidal-mirror', label: 'M101 Toroidal Mirror', x: 350, y: TOP_Y, status: 'ok', icon: 'toroidal-mirror.svg' },
  { id: 'slit1',           label: 'Slit1',            x: 650, y: TOP_Y, status: 'ok', icon: 'slit.svg' },

  // bottom row
  { id: 'monochromator',   label: 'Monochromator',   x:  50, y: BOT_Y, status: 'ok', icon: 'monochromator.svg' },
  { id: 'slit2',           label: 'Slit2',            x: 350, y: BOT_Y, status: 'ok', icon: 'slit.svg' },
  { id: 'sample-mount',    label: 'Sample Mount',    x: 650, y: BOT_Y, status: 'ok', icon: 'sample-mount.svg' },
];

export const edges: Edge[] = [
  // top row
  { from: 'source',          to: 'toroidal-mirror' },
  { from: 'toroidal-mirror', to: 'slit1'           },

  // snake down under
  {
    from: 'slit1',
    to:   'monochromator',
    orthogonalVia: [
      { x: 650, y: MID_Y },
      { x:  50, y: MID_Y }
    ]
  },

  // bottom row
  { from: 'monochromator',   to: 'slit2'          },
  { from: 'slit2',           to: 'sample-mount'   },
];