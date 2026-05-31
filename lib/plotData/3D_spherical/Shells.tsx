'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data } from 'plotly.js';
import { colorbar } from '@/lib/plotData/miscellaneous';
import { InlineMath } from 'react-katex';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function SimulationPage() {
  // Parameters for user chosen plot
  const [posA, setPosA] = useState([0, 0, 0.02]);

  const nTheta = 2; const thetaStep = Math.PI / nTheta;

  const plotNum = useMemo(() => {
    const plotNum = posA[0] / thetaStep;

    return plotNum;
  }, [posA]);
  

  // Fetch useStates
  const [rawData, setRawData] = useState<any>(null);
  const [slicedData, setSlicedData] = useState<any>(null);
  const [sliceLocation, setSliceLocation] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch data for specified plot
  useEffect(() => {
    fetch(`/simnibs_mesh_data_${plotNum}.json`)
      .then((res) => res.json())
      .then((data) => {
        setRawData(data);
        const midX = (Math.max(...data.x) + Math.min(...data.x)) / 2;
        setSliceLocation(midX);
        setLoading(false);
      });
  }, [plotNum]);

  // Recalculate the sliced mesh
  useEffect(() => {
    if (!rawData) return;

    const { x, y, z, i, j, k, intensity } = rawData;
    
    const newI: number[] = [];
    const newJ: number[] = [];
    const newK: number[] = [];
    const newIntensity: number[] = [];

    for (let index = 0; index < i.length; index++) {
      // Find the absolute vertex indices for this specific triangle face
      const v1 = i[index];
      const v2 = j[index];
      const v3 = k[index];

      // Calculate the X-coordinate center point of this triangle face
      const faceCenterX = (x[v1] + x[v2] + x[v3]) / 3;

      if (faceCenterX < sliceLocation) {
        newI.push(v1);
        newJ.push(v2);
        newK.push(v3);
        newIntensity.push(intensity[index]);
      }
    }

    setSlicedData({ x, y, z, i: newI, j: newJ, k: newK, intensity: newIntensity });
  }, [sliceLocation, rawData]);

  if (loading || !slicedData) {
    return <div className="text-center p-20 text-white">Loading Slices...</div>;
  }

  const plotData = [{
    type: 'mesh3d',
    x: slicedData.x,
    y: slicedData.y,
    z: slicedData.z,
    i: slicedData.i,
    j: slicedData.j,
    k: slicedData.k,
    intensity: slicedData.intensity,
    intensitymode: 'cell',
    colorscale: colorbar,
    showscale: true,
    cauto: false,
    cmax: 2.2,
  }];

  return (
    <div className="p-8 bg-slate-950 text-white flex flex-col gap-4">
      <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <label className="font-semibold">Move Cross-Section Slice (X-Axis):</label>
        <input 
          type="range" 
          min={Math.min(...rawData.x)} 
          max={Math.max(...rawData.x)} 
          step="1"
          value={sliceLocation} 
          onChange={(e) => setSliceLocation(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-xs text-slate-400">Current Plane Position: {sliceLocation.toFixed(2)} mm</span>
      </div>

      <div className="flex flex-row justify-start items-center w-full gap-4">
          <label className="text-white">Anode: <InlineMath math='\theta'/> [rad]:</label>
          <input
              type="number"
              step={thetaStep}
              value={posA[0]}
              className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
              onChange={(e) => {
                  let val = parseFloat(e.target.value) || 0;
                  val = Math.round(val / thetaStep ) * thetaStep;
                  setPosA([val, posA[1], posA[2]]);
              }}
          />
      </div>

      <div className="w-full h-[1800px] border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
        <Plot
          data={plotData as Data[]}
          layout={{
            autosize: true,
            height: 600,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            scene: {
              xaxis: { visible: false, range: [Math.min(...rawData.x), Math.max(...rawData.x)] },
              yaxis: { visible: false, range: [Math.min(...rawData.y), Math.max(...rawData.y)] },
              zaxis: { visible: false, range: [Math.min(...rawData.z), Math.max(...rawData.z)] },
            },
            margin: { l: 0, r: 0, b: 0, t: 0 },
          }}
          useResizeHandler={true}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}