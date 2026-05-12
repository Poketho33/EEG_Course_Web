'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js';

import { linspace } from '@/lib/math/MathLibFunctions';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Plot_3D() {
    const plotData = useMemo(() => {
        // Parameters
        const R = 0.1, sigma = 0.33, I_tot = 1e-3, alpha = 0.0002;
        const posA = [0, 0]; const posC = [Math.PI, 0]; // [Theta, Phi]
        const J_0 = I_tot / (2 * Math.PI * R**2 * (1 - Math.cos(alpha)));
        // Resolution
        const Ngrid = 50, L_max  = 25;

        // Grid (spherical coords)
        const xvec = linspace(-R, R, Ngrid);
        const x: number[] = [], y: number[] = [], z: number[] = [], v: number[] = [], rec = [];

        for (let i = 0; i < Ngrid; i++) {
            for (let j = 0; j < Ngrid; j++) {
                const px = xvec[i];
                const py = xvec[j];
                const pz = 0;

                const r = Math.sqrt(px**2 + py**2);

                if(r <= R){
                    x.push(px);
                    y.push(py);
                    z.push(pz);
                    v.push(0);

                    // rec
                    let theta = Math.acos(pz / r);
                    let phi = Math.atan2(py, px);

                    let cosGammaA = Math.cos(theta) * Math.cos(posA[0]) + Math.sin(theta) * Math.sin(posA[0]) * Math.cos(phi - posA[1]);
                    let cosGammaC = Math.cos(theta) * Math.cos(posC[0]) + Math.sin(theta) * Math.sin(posC[0]) * Math.cos(phi - posC[1]);

                    rec.push({
                        cosGammaA: cosGammaA,
                        cosGammaC: cosGammaC,
                        pPrevA: 1,
                        pCurrA: cosGammaA,
                        pCurrC: 1,
                        pPrevC: cosGammaC
                    });
                }
            }
        }

        // Bonnet's recursion
        let pPrevCap = 1;
        let pCurrCap = Math.cos(alpha);
        
        // Solver loop
        for(let l = 1; l < L_max; l++){
            let pNextCap = ((2 * l + 1) * Math.cos(alpha) * pCurrCap - l * pPrevCap) / (l + 1);
            let cap_factor = (pPrevCap - pNextCap); 

            let term_const = J_0 / (sigma * l * (2*l + 1) * R**(l-1));

            for(let i = 0; i < x.length; i++){
                const r = Math.sqrt(x[i]**2 + y[i]**2);
                if(r <= R){
                    v[i] += term_const * r ** l * cap_factor * (rec[i].pCurrA - rec[i].pCurrC)

                    let pNextA = ((2 * l + 1) * rec[i].cosGammaA * rec[i].pCurrA - l * rec[i].pPrevA) / (l + 1);
                    let pNextC = ((2 * l + 1) * rec[i].cosGammaC * rec[i].pCurrC - l * rec[i].pPrevC) / (l + 1);
    
                    rec[i].pPrevA = rec[i].pCurrA;
                    rec[i].pCurrA = pNextA;
                    rec[i].pPrevC = rec[i].pCurrC;
                    rec[i].pCurrC = pNextC;
                }
            }

            // Set recursion to next value
            pPrevCap = pCurrCap;
            pCurrCap = pNextCap;
        }


        const data = [{
            type: 'surface',
            x, y, z,

            surfacecolor: v,

            colorscale: 'Hot',
            showscale: true
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