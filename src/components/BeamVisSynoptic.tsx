import React, { useMemo } from 'react';
import { line, curveLinear, curveStepAfter } from 'd3-shape';

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

// edge between nodes, optional right-angle via points
export interface Edge {
  from: string;
  to: string;
  orthogonalVia?: Point[];
}

// map statuses to fill colors
const statusColor = {
  ok:           '#005B88',
  moving:       '#F9C80E',
  finished:     '#A1C181',
  limit:        '#F86624',
  disconnected: '#EF476F',
};

const SynopticView: React.FC<{ nodes: Node[]; edges: Edge[] }> = ({ nodes, edges }) => {
  // fast lookup by id
  const nodeMap = useMemo(() =>
    new Map<string, Node>(nodes.map(n => [n.id, n])),
    [nodes]
  );

  // straight-line generator
  const straightGen = useMemo(
    () => line<Point>().x(d => d.x).y(d => d.y).curve(curveLinear),
    []
  );

  // step (H→V) generator for right angles
  const stepGen = useMemo(
    () => line<Point>().x(d => d.x).y(d => d.y).curve(curveStepAfter),
    []
  );

  return (
    <svg width={720} height={400} style={{ background: 'white'}}>
      {/* edges */}
      {edges.map((e, idx) => {
        const a = nodeMap.get(e.from);
        const b = nodeMap.get(e.to);
        if (!a || !b) return null;

        // build points array
        const pts: Point[] = e.orthogonalVia
          ? [{ x: a.x, y: a.y }, ...e.orthogonalVia, { x: b.x, y: b.y }]
          : [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];

        // choose generator
        const d = (e.orthogonalVia ? stepGen : straightGen)(pts) || undefined;

        return (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke="#004c74"
            strokeWidth={6}
            strokeLinecap="round"
          />
        );
      })}

      {/* nodes */}
      {nodes.map(n => (
        <g
          key={n.id}
          transform={`translate(${n.x},${n.y})`}
          onClick={() => console.log(`Clicked ${n.label}`)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={-20}
            y={-20}
            width={40}
            height={40}
            rx={6}
            ry={6}
            fill={statusColor[n.status]}
            stroke="#000"
            strokeWidth={1}
          />
          <text
            y={35}
            textAnchor="middle"
            fontSize={12}
            fontFamily="sans-serif"
            fill="black"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default SynopticView;