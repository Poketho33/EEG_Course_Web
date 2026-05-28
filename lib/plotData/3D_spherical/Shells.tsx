'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function SimulationPage() {
  const [rawData, setRawData] = useState<any>(null);
  const [slicedData, setSlicedData] = useState<any>(null);
  const [sliceLocation, setSliceLocation] = useState<number>(0); // Middle of the brain
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/simnibs_mesh_data_2.json')
      .then((res) => res.json())
      .then((data) => {
        setRawData(data);
        // Set initial slice to the middle of the X-axis grid range
        const midX = (Math.max(...data.x) + Math.min(...data.x)) / 2;
        setSliceLocation(midX);
        setLoading(false);
      });
  }, []);

  // Recalculate the sliced mesh whenever the user moves the slider
  useEffect(() => {
    if (!rawData) return;

    const { x, y, z, i, j, k, intensity } = rawData;
    
    // Arrays to hold our new sliced mesh data structures
    const newI: number[] = [];
    const newJ: number[] = [];
    const newK: number[] = [];
    const newIntensity: number[] = [];

    // Loop through every triangle face
    for (let index = 0; index < i.length; index++) {
      // Find the absolute vertex indices for this specific triangle face
      const v1 = i[index];
      const v2 = j[index];
      const v3 = k[index];

      // Calculate the X-coordinate center point of this triangle face
      const faceCenterX = (x[v1] + x[v2] + x[v3]) / 3;

      // Slicing condition: Only keep the face if it sits behind our slice plane
      // (Change 'faceCenterX < sliceLocation' to faceCenterY or faceCenterZ for different slice views)
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

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white flex flex-col gap-4">
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

      <div className="w-full h-[600px] border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
        <Plot
          data={[
            {
              type: 'mesh3d',
              x: slicedData.x,
              y: slicedData.y,
              z: slicedData.z,
              i: slicedData.i,
              j: slicedData.j,
              k: slicedData.k,
              intensity: slicedData.intensity,
              intensitymode: 'cell',
              colorscale: 'Jet',
              showscale: true,
              cauto: false,
              cmax: 2.2,
              colorbar: { title: 'E-Field (V/m)', tickcolor: '#fff', font: { color: '#fff' } },
            },
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            scene: {
              xaxis: { visible: false, range: [Math.min(...rawData.x), Math.max(...rawData.x)] },
              yaxis: { visible: false, range: [Math.min(...rawData.y), Math.max(...rawData.y)] },
              zaxis: { visible: false, range: [Math.min(...rawData.z), Math.max(...rawData.z)] },
              camera: { eye: { x: -1.2, y: 1.2, z: 0.8 } } // Angle it to see inside the cut
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