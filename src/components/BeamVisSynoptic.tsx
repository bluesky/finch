import React, { useMemo, useState } from 'react';
import { line, curveLinear, curveStepAfter } from 'd3-shape';
import { Node, Edge, Point, statusColor, TOP_Y } from 'src/components/BeamVis/Synoptic_Config';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import useOphydSocket from '@/hooks/useOphydSocket';

const WS_URL = 'ws://192.168.10.155:8002/ophydSocket';
const PV_LIST = [
  'bl531_xps2:sample_x_mm.RBV',
  'bl531_xps2:sample_y_mm.RBV',
];

interface SynopticViewProps {
  nodes: Node[];
  edges: Edge[];
  // devices: Device[];
}

const SynopticView: React.FC<SynopticViewProps> = ({ nodes, edges }) => {
  // fast lookup by id
  const nodeMap = useMemo(
    () => new Map<string, Node>(nodes.map(n => [n.id, n])),
    [nodes]
  );

  const { devices } = useOphydSocket(WS_URL, PV_LIST);
  const [activePV, setActivePV] = useState<string | null>(null);

  // const deviceMap = useMemo(
  //     () => new Map<string, Device>(devices.map(d => [d.name, d])),
  //     [devices]
  // )

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
    <svg
      viewBox="0 0 720 400"
      style={{ background: 'white' }}>
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
        // const device = deviceMap.get(n.label);
        const isSample = n.id === 'sample-mount';

        return (
          <Popover key={n.id}>
            <PopoverTrigger asChild>
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
                {n.icon && (
                  <image
                    className="synoptic-node-icon"
                    href={`/src/components/BeamVis/assets/${n.icon}`}
                    x={-15}
                    y={-15}
                    width={30}
                    height={30}
                  />
                )}
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
            </PopoverTrigger>
            <PopoverContent className='!bg-white bg-opacity-100 w-90 max-h-screen'>
              <div className='p-2'>
                <strong>{n.label}</strong>
                {/* {device ? (
                  <pre className="text-xs">
                    {JSON.stringify(device, null, 2)}
                  </pre>
                ) : (
                  <p>No device information available</p>
                )} */}
                {/* <Button style={{ color: 'white', backgroundColor: '#095b87', margin: '10px', padding: '10px' }}>
                  3D View
                </Button> */}

                {n.id === 'sample-mount' ? (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
                      <Button style={{ color: 'white', backgroundColor: '#095b87', margin: '10px', padding: '10px' }} size="sm" onClick={() => setActivePV('bl531_xps2:sample_x_mm.RBV')}>
                        Sample X
                      </Button>
                      <Button style={{ color: 'white', backgroundColor: '#095b87', margin: '10px', padding: '10px' }} size="sm" onClick={() => setActivePV('bl531_xps2:sample_y_mm.RBV')}>
                        Sample Y
                      </Button>
                    </div>

                    {activePV && devices[activePV] && (
                      <div style={{ maxHeight: 300, overflowY: 'auto', background: 'white', padding: '4px' }}>
                        <pre style={{ fontSize: 10, color: 'black' }}>
                          {JSON.stringify(devices[activePV], null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs italic text-gray-500">No PV metadata</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </svg>
  );
};

export default SynopticView;
