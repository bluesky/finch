const TOP_Y = 100;
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
  { id: 'source',    label: 'Source',       x:  50, y: TOP_Y, status: 'ok' },
  { id: 'beamstop1', label: 'Beamstop',     x: 150, y: TOP_Y, status: 'ok' },
  { id: 'slit1',     label: 'Slit',         x: 250, y: TOP_Y, status: 'ok' },
  { id: 'mono',      label: 'Monochromator',x: 350, y: TOP_Y, status: 'ok' },
  { id: 'mirror1',   label: 'Mirror',       x: 450, y: TOP_Y, status: 'ok' },
  { id: 'mirror2',   label: 'Mirror',       x: 550, y: TOP_Y, status: 'ok' },
  { id: 'slit2',     label: 'Slit',         x: 650, y: TOP_Y, status: 'ok' },

  { id: 'beamstop2', label: 'Beamstop',     x:  50, y: BOT_Y, status: 'ok' },
  { id: 'mirror3',   label: 'Mirror',       x: 150, y: BOT_Y, status: 'ok' },
  { id: 'slit3',     label: 'Slit',         x: 250, y: BOT_Y, status: 'ok' },
  { id: 'mirror4',   label: 'Mirror',       x: 350, y: BOT_Y, status: 'ok' },
  { id: 'mirror5',   label: 'Mirror',       x: 450, y: BOT_Y, status: 'ok' },
  { id: 'mirror6',   label: 'Mirror',       x: 550, y: BOT_Y, status: 'ok' },
  { id: 'sample',    label: 'Sample Mount', x: 650, y: BOT_Y, status: 'ok' },
];

export const edges: Edge[] = [
  { from: 'source',    to: 'beamstop1' },
  { from: 'beamstop1', to: 'slit1'     },
  { from: 'slit1',     to: 'mono'      },
  { from: 'mono',      to: 'mirror1'   },
  { from: 'mirror1',   to: 'mirror2'   },
  { from: 'mirror2',   to: 'slit2'     },

  {
    from: 'slit2',
    to:   'beamstop2',
    orthogonalVia: [
      { x: 650, y: MID_Y },
      { x:  50, y: MID_Y }
    ]
  },

  { from: 'beamstop2', to: 'mirror3' },
  { from: 'mirror3',   to: 'slit3'   },
  { from: 'slit3',     to: 'mirror4' },
  { from: 'mirror4',   to: 'mirror5' },
  { from: 'mirror5',   to: 'mirror6' },
  { from: 'mirror6',   to: 'sample'  },
];
