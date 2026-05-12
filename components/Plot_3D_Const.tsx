'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js';

import { linspace } from '@/lib/math/MathLibFunctions';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Plot_3D() {
    // Parameters
    const R = 0.1, sigma = 0.33, I_tot = 1e-3, alpha = 0.6;
    const Ngrid = 30, L_max  = 25;
    const J_0 = I_tot / (2 * Math.PI * R**2 * (1 - Math.cos(alpha)));

    // Electrode positions [theta, phi]
    const posA = [0, 0];
    const posC = [Math.PI, 0];

    // Grid (spherical coords)
    const xvec = linspace(-R, R, Ngrid);

    // Arrays
    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];

    const r_grid: number[] = [];
    // const theta_grid: number[] = [];
    // const phi_grid: number[] = [];
    
    const v: number[] = [];

    const cosGammaA_grid: number[] = [];
    const cosGammaC_grid: number[] = [];

    const pPrevA: number[] = [];
    const pCurrA: number[] = [];
    const pPrevC: number[] = [];
    const pCurrC: number[] = [];

    for (let i = 0; i < Ngrid; i++) {
        for (let j = 0; j < Ngrid; j++) {
            for (let k = 0; k < Ngrid; k++) {
                x.push(xvec[i]);
                y.push(xvec[j]);
                z.push(xvec[k]);
                
                const r = Math.sqrt(xvec[i]**2 + xvec[j]**2 + xvec[k]**2);
                r_grid.push(r);

                // Mask
                if (r <= R) { 
                    v.push(0);

                    let theta = Math.acos(xvec[k] / r);
                    let phi = Math.atan2(xvec[j], xvec[i]);

                    let cosGammaA = Math.cos(theta) * Math.cos(posA[0]) + Math.sin(theta) * Math.sin(posA[0]) * Math.cos(phi - posA[1]);
                    let cosGammaC = Math.cos(theta) * Math.cos(posC[0]) + Math.sin(theta) * Math.sin(posC[0]) * Math.cos(phi - posC[1]);

                    cosGammaA_grid.push(cosGammaA);
                    cosGammaC_grid.push(cosGammaC);

                    pPrevA.push(1);
                    pCurrA.push(cosGammaA);
                    pCurrC.push(1);
                    pPrevC.push(cosGammaC);
                }else{
                    v.push(-2.1);

                    let theta = Math.acos(xvec[k] / r);
                    let phi = Math.atan2(xvec[j], xvec[i]);

                    let cosGammaA = Math.cos(theta) * Math.cos(posA[0]) + Math.sin(theta) * Math.sin(posA[0]) * Math.cos(phi - posA[1]);
                    let cosGammaC = Math.cos(theta) * Math.cos(posC[0]) + Math.sin(theta) * Math.sin(posC[0]) * Math.cos(phi - posC[1]);

                    cosGammaA_grid.push(cosGammaA);
                    cosGammaC_grid.push(cosGammaC);

                    pPrevA.push(1);
                    pCurrA.push(cosGammaA);
                    pCurrC.push(1);
                    pPrevC.push(cosGammaC);
                }
            }
        }
    }


    const plotData = useMemo(() => {
        // Bonnet's recursion
        let pPrevCap = 1;
        let pCurrCap = Math.cos(alpha);

        // Solver loop
        for(let l = 1; l < L_max; l++){
            let pNextCap = ((2 * l + 1) * Math.cos(alpha) * pCurrCap - l * pPrevCap) / (l + 1);
            let cap_factor = (pPrevCap - pNextCap); 

            let term_const = J_0 / (sigma * l * (2*l + 1) * R**(l-1));

            for(let i = 0; i < r_grid.length; i++){
                if(r_grid[i] <= R){
                    v[i] += term_const * r_grid[i] ** l * cap_factor * (pCurrA[i] - pCurrC[i])

                    let pNextA = ((2 * l + 1) * cosGammaA_grid[i] * pCurrA[i] - l * pPrevA[i]) / (l + 1);
                    let pNextC = ((2 * l + 1) * cosGammaC_grid[i] * pCurrC[i] - l * pPrevC[i]) / (l + 1);
    
                    pPrevA[i] = pCurrA[i];
                    pCurrA[i] = pNextA;
                    pPrevC[i] = pCurrC[i];
                    pCurrC[i] = pNextC;
                }
            }

            // Set recursion to next value
            pPrevCap = pCurrCap;
            pCurrCap = pNextCap;
        }

        const i = 20;
        const j = 20;
        const k = 20;
        const targetIndex = i * (Ngrid * Ngrid) + j * Ngrid + k;

        console.log(`X: ${x[targetIndex]}, Y: ${y[targetIndex]}, Z: ${z[targetIndex]}`);
        console.log(`Potential (V): ${v[targetIndex]}`);

        const data: Data[] = [{
            type: 'volume',
            x: x,
            y: y,
            z: z,
            value: v,

            isomin: -2,
            // isomax: v.reduce((a, b) => Math.max(a, b), -Infinity),
            surface_count: 1,
            slices: {
                x: { show: true, location: [0] },
                y: { show: true, location: [0] },
                z: { show: true, location: [0] }
            },
            colorscale: 'Viridis',
            showscale: true,
            colorbar: {
                
                thickness: 15,
                len: 0.5
            }
        } as any ];

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