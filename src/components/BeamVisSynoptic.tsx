import React, { useMemo } from 'react';
import { line, curveLinear, curveStepAfter } from 'd3-shape';
import { Node, Edge, Point, statusColor, TOP_Y } from 'src/components/BeamVis/Synoptic_Config';

const SynopticView: React.FC<{ nodes: Node[]; edges: Edge[] }> = ({ nodes, edges }) => {
  // fast lookup by id
  const nodeMap = useMemo(
    () => new Map<string, Node>(nodes.map(n => [n.id, n])),
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
    <svg width={720} height={400} style={{ background: 'white' }}>
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
        const d = (e.orthogonalVia ? stepGen : straightGen)(pts) ?? undefined;

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
      {nodes.map(n => {
        // determine whether this node is in the top row
        const isTopRow = n.y === TOP_Y;
        // place label above for top row, below otherwise
        const labelY = isTopRow ? -30 : 35;

        return (
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
              className='synoptic-node'
            />
            <text
              y={labelY}
              textAnchor="middle"
              fontSize={12}
              fontFamily="sans-serif"
              fill="black"
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default SynopticView;
