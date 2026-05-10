'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js';

import { linspace } from '@/lib/math/MathLibFunctions';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Plot_3D() {
    // Parameters
    // const R = 0.1;
    // const Ngrid = 50;

    // // Grid (spherical coords)
    // const xvec = linspace(-R, R, Ngrid);

    // const points = useMemo(() => {
    //     const points = [];
    //     for (let i = 0; i < Ngrid; i++) {
    //         for (let j = 0; j < Ngrid; j++) {
    //             for (let k = 0; k < Ngrid; k++) {
    //                 const x = xvec[i];
    //                 const y = xvec[j];
    //                 const z = xvec[k];
                    
    //                 const r = Math.sqrt(x**2 + y**2 + z**2);
                    
    //                 // Mask
    //                 if (r <= R) { 
    //                     points.push({
    //                         x: x,
    //                         y: y,
    //                         z: z,
    //                         V: 1,
    //                     });
    //                 }
    //             }
    //         }
    //     }
    //     return points;
    // }, [R, Ngrid]);



    // const plotData = useMemo(() => {
    //     const size = 50;
    //     const x: number[][] = [];
    //     const y: number[][] = [];
    //     const z: number[][] = [];
    //     const v: number[][] = [];

    //     for (let i = 0; i <= size; i++) {
    //         const theta = (i / size) * Math.PI;
    //         const xRow: number[] = [];
    //         const yRow: number[] = [];
    //         const zRow: number[] = [];
    //         const vRow: number[] = [];

    //         for (let j = 0; j <= size; j++) {
    //             const phi = (j / size) * 2 * Math.PI;
    //             const xVal = Math.sin(theta) * Math.cos(phi);
    //             const yVal = Math.sin(theta) * Math.sin(phi);
    //             const zVal = Math.cos(theta);

    //             xRow.push(xVal);
    //             yRow.push(yVal);
    //             zRow.push(zVal);
    //             vRow.push(yVal *  Math.sin(phi)); 
    //         }

    //         x.push(xRow);
    //         y.push(yRow);
    //         z.push(zRow);
    //         v.push(vRow);
    //     }
        
    //     const data: Data[] = [{
    //         type: 'surface',
    //         x: x,
    //         y: y,
    //         z: z,
    //         surfacecolor: v,

    //         colorscale: 'Viridis',
    //         showscale: true,
    //         colorbar: {
    //             thickness: 15,
    //             len: 0.5
    //         }
    //     }];

    //     return data;
    // }, []);

    const plotData = useMemo(() => {
        const size = 30;
        const xvec = linspace(-0.1, 0.1, size);
        
        const x: number[] = [];
        const y: number[] = [];
        const z: number[] = [];
        const v: number[] = [];

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                for (let k = 0; k < size; k++) {
                    const px = xvec[i];
                    const py = xvec[j];
                    const pz = xvec[k];

                    const r = Math.sqrt(px**2 + py**2 + pz**2);

                    x.push(px);
                    y.push(py);
                    z.push(pz);

                    if(r > 0.1){
                        v.push(-0.11); 
                    }else{
                        v.push(-0.06)
                    }
                }
            }
        }

        const data = [{
            type: 'isosurface',
            x: x,
            y: y,
            z: z,
            value: v,

            isomin: -0.1,  
            isomax: 0.1,  

            surface: { count: 1 },
            
            flatshading: false,
            lighting: {
                ambient: 1,
                // diffuse: 0,
                // specular: 0,
                // roughness: 0,
                // fresnel: 0
            },

            colorscale: 'Viridis',
        }];

        return data;
    }, []);

    const layout: Partial<Layout> = {
        width: 600,
        height: 600,
        paper_bgcolor: 'transparent',
        margin: { t: 40, b: 0, l: 0, r: 0 },
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Plot
                data={plotData}
                layout={layout}
                config={{ responsive: true }}
            />
        </div>
    );
}