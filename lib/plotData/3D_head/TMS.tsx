'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data } from 'plotly.js';
import { colorbar } from '@/lib/plotData/miscellaneous';
import { InlineMath } from 'react-katex';

import { plotTypes } from '@/lib/plotData/type';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function SimulationPage() {
  // use states
  const [posA, setPosA] = useState(0);
  const anodePositions = ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'T7', 'T8', 'P3', 'P4'];

  const [sigma, setSigma] = useState([0, 0]); // index of sigmaoptions +3*index, so sigma[3] = 2 => 870
  const sigmaOptions = [
                        // 90, 190, 290,     // WM
                        // 220, 445, 670,    // GM
                        1.6, 17.3, 33,    // skull 
                        280, 575, 870,    // skin
                      ];
  const handleSigmaChange = (layerIndex: number, choiceIndex: number) => {
  setSigma(prev => {
            const nextSigma = [...prev];
            nextSigma[layerIndex] = choiceIndex;
            return nextSigma;
        });
    };
  const [plotType, setPlotType] = useState<plotTypes>(plotTypes.potential);

  const fileIndices = useMemo(() => {
    const i = posA;
    const [l, m] = sigma;

    const xyzIndex = i;

    const veIndex = xyzIndex * 9 + l * 3 + m;

    return {
      xyzNum: Math.floor(xyzIndex),
      veNum: Math.floor(veIndex)
    };
  }, [posA, sigma]);
  

  // useStates
  const [rawData, setRawData] = useState<any>(null);
  const [rawXYZData, setRawXYZData] = useState<any>(null);
  const [rawVEData, setRawVEData] = useState<any>(null);
  const [slicedData, setSlicedData] = useState<any>(null);
  const [sliceLocation, setSliceLocation] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch specified JSON file
  useEffect(() => {
    setLoading(true);
      
    Promise.all([
      fetch(`/tmsHeadData/simnibs_mesh_data_XYZ_${fileIndices.xyzNum}.json`).then((res) => res.json()),
      fetch(`/tmsHeadData/simnibs_mesh_data_VE_${fileIndices.veNum}.json`).then((res) => res.json())
    ])
    .then(([xyzData, veData]) => {
      setRawXYZData(xyzData);
      setRawVEData(veData);

      const { x, y, z, tets } = xyzData;
      const { e_field, v_field } = veData;

      const newI: number[] = [];
      const newJ: number[] = [];
      const newK: number[] = [];
      const expandedEField: number[] = [];

      // Make 4 triangles of each tetrahedron
      for (let index = 0; index < tets.length; index++) {
        const t = tets[index];
        const currentE = e_field[index] / 10000; // JSON saved as scaled integers

        const faces = [
          [t[0], t[1], t[2]], 
          [t[0], t[1], t[3]], 
          [t[0], t[2], t[3]],
          [t[1], t[2], t[3]] 
        ];

        faces.forEach(([v1, v2, v3]) => {
          newI.push(v1);
          newJ.push(v2);
          newK.push(v3);
          expandedEField.push(currentE);
        });
      }

      const restoredVField = v_field.map((v: number) => v / 10000);

      const vFieldMean = restoredVField.reduce((sum: number, val: number) => sum + val, 0) / restoredVField.length;

      const zeroMeanVField = restoredVField.map((v: number) => v - vFieldMean); // set field to zero-mean

      const restoredData = {
        x: x.map((v: number) => v / 10000),
        y: y.map((v: number) => v / 10000),
        z: z.map((v: number) => v / 10000),
        i: newI,
        j: newJ,
        k: newK,
        e_field: expandedEField,
        v_field: zeroMeanVField 
      };

      setRawData(restoredData);

      const midX = (Math.max(restoredData.x) + Math.min(restoredData.x)) / 2;
      setSliceLocation(midX);
      setLoading(false);
    });
  }, [fileIndices]);

  // Recalculate the sliced mesh
  useEffect(() => {
    if (!rawData || !rawVEData || !rawXYZData) return;

    const { x, y, z, i, j, k, e_field, v_field } = rawData;
    
    const newI: number[] = [];
    const newJ: number[] = [];
    const newK: number[] = [];
    const slicedIntensity: number[] = [];

    for (let index = 0; index < i.length; index++) {
      const v1 = i[index];
      const v2 = j[index];
      const v3 = k[index];

      const faceCenterX = (x[v1] + x[v2] + x[v3]) / 3;

      if (faceCenterX < sliceLocation) {
        newI.push(v1);
        newJ.push(v2);
        newK.push(v3);
        
        if (plotType === plotTypes.electric) {
          slicedIntensity.push(e_field[index]);
        }
      }
    }

    if (plotType === plotTypes.potential) {
      setSlicedData({ x, y, z, i: newI, j: newJ, k: newK, intensity: v_field });
    } else {
      setSlicedData({ x, y, z, i: newI, j: newJ, k: newK, intensity: slicedIntensity });
    }
  }, [sliceLocation, rawData, plotType]);

  if (loading || !slicedData) {
    return <div className="text-center p-20 text-white">Loading Slices</div>;
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
    intensitymode: plotType === plotTypes.potential ? 'node' : 'cell',
    colorscale: colorbar,
    showscale: true,
    // cauto: false,
    // cmax: 0.25,
  }];

  return (
    <div className="p-8 bg-slate-950 text-white flex flex-col gap-4">

    <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-row justify-start items-center gap-4">
            {Array.from({ length: 10 }, (_, index) => index).map((posIndex) => {
                return (
                    <button
                        key={posIndex}
                        onClick={() => setPosA(posIndex)}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors 

                        `}
                        >
                        {anodePositions[posIndex]}
                    </button>
                );
            })}
        </div>
    </div>

{/* Change conductivities */}
<div className="flex flex-col gap-4 w-full bg-slate-900 p-4 rounded-lg border border-slate-800">
    <span className="text-sm font-medium text-slate-400">Tissue Conductivities:</span>
    
    {/* Clean, trackable loop container */}
    {[0, 1].map((sigmaIndex) => {
        const sigmaText = ['skull', 'skin'];
        
        return (
            /* FIX: Explicit container with key ensures React tracks state mutations accurately */
            <div key={sigmaIndex} className="flex flex-row justify-start items-center gap-4">
                <span className="text-white w-32 font-mono">
                    <InlineMath math={`\\sigma_{${sigmaText[sigmaIndex]}}`} /> [mS/m]:
                </span>
                
                <div className="flex flex-row gap-2">
                    {[0, 1, 2].map((choiceIndex) => {
                        const optionValue = sigmaOptions[sigmaIndex * 3 + choiceIndex];
                        const isActive = sigma[sigmaIndex] === choiceIndex;
                
                        return (
                            <button
                                key={choiceIndex}
                                onClick={() => handleSigmaChange(sigmaIndex, choiceIndex)}
                                className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                                    isActive 
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-md' 
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                }`}
                            >
                                {optionValue}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    })}
</div>

      <div className="">
        <button
            className={plotType === plotTypes.potential ? "bg-pastel_3 text-background h-full p-2 rounded-lg" : "p-2 rounded-lg"}
            onClick={() => setPlotType(plotTypes.potential)}
        >
            Potential
        </button>
        <button
            className={plotType === plotTypes.electric ? "bg-pastel_3 text-background h-full p-2 rounded-lg" : "p-2 rounded-lg"}
            onClick={() => setPlotType(plotTypes.electric)}
        >
            Electric
        </button>
      </div>

      <div className="w-full h-[1800px] border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
        <Plot
          data={plotData as Data[]}
          layout={{
            autosize: true,
            height: 600,
            paper_bgcolor: 'transparent',
            font: { color: '#ffffff' },
            title: { text: 'Potential Field at the Surface (V)' },
            scene: {
              xaxis: { visible: false, range: [Math.min(rawData.x), Math.max(rawData.x)] },
              yaxis: { visible: false, range: [Math.min(rawData.y), Math.max(rawData.y)] },
              zaxis: { visible: false, range: [Math.min(rawData.z), Math.max(rawData.z)] },
            },
            margin: { l: 0, r: 0, b: 0, t: 0 },
          }}
          useResizeHandler={true}
          className="w-full h-full"
        />
      </div>

      <div className="flex flex-col gap-2 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <label className="font-semibold">Move Cross-Section Slice (X-Axis):</label>
        <input 
          type="range" 
          min={Math.min(rawData.x)} 
          max={Math.max(rawData.x)} 
          step="1"
          value={sliceLocation} 
          onChange={(e) => setSliceLocation(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-xs text-slate-400">Current Plane Position: {sliceLocation.toFixed(2)} mm</span>
      </div>
    </div>
  );
}