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
        const posA = [Math.PI/2, 0]; const posC = [Math.PI, 0]; // [Theta, Phi]
        const J_0 = I_tot / (2 * Math.PI * R**2 * (1 - Math.cos(alpha)));
        // Resolution
        const Ngrid = 100, L_max  = 25;

        // Grid (spherical coords)
        const xvec = linspace(-R, R, Ngrid);
        const x = [], y = [], z = [], v = [], rec = [];

        for (let i = 0; i < Ngrid; i++) {
            const xRow = [];
            const yRow = [];
            const zRow = [];
            const vRow = [];
            const recRow = [];

            for (let j = 0; j < Ngrid; j++) {
                const px = xvec[i];
                const py = 0;
                const pz = xvec[j];

                const r = Math.sqrt(px**2 + py**2 + pz**2) || 1e-10;

                if(r <= R){
                    xRow.push(px);
                    yRow.push(py);
                    zRow.push(pz);
                    vRow.push(0);

                    // rec
                    let theta = Math.acos(pz / r);
                    let phi = Math.atan2(py, px);

                    let cosGammaA = Math.cos(theta) * Math.cos(posA[0]) + Math.sin(theta) * Math.sin(posA[0]) * Math.cos(phi - posA[1]);
                    let cosGammaC = Math.cos(theta) * Math.cos(posC[0]) + Math.sin(theta) * Math.sin(posC[0]) * Math.cos(phi - posC[1]);

                    recRow.push({
                        cosGammaA: cosGammaA,
                        cosGammaC: cosGammaC,
                        pPrevA: 1,
                        pCurrA: cosGammaA,
                        pCurrC: 1,
                        pPrevC: cosGammaC
                    });
                }else{
                    xRow.push(px);
                    yRow.push(py);
                    zRow.push(pz);
                    vRow.push(NaN);

                    recRow.push({
                        cosGammaA: 0,
                        cosGammaC: 0,
                        pPrevA: 0,
                        pCurrA: 0,
                        pCurrC: 0,
                        pPrevC: 0
                    });
                }
            }
            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
            v.push(vRow);
            rec.push(recRow);
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
                for(let j = 0; j < x[0].length; j++){
                    const r = Math.sqrt(x[i][j]**2 + y[i][j]**2 + z[i][j]**2);
                    if(r <= R){
                        v[i][j] += term_const * r ** l * cap_factor * (rec[i][j].pCurrA - rec[i][j].pCurrC)
    
                        let pNextA = ((2 * l + 1) * rec[i][j].cosGammaA * rec[i][j].pCurrA - l * rec[i][j].pPrevA) / (l + 1);
                        let pNextC = ((2 * l + 1) * rec[i][j].cosGammaC * rec[i][j].pCurrC - l * rec[i][j].pPrevC) / (l + 1);
        
                        rec[i][j].pPrevA = rec[i][j].pCurrA;
                        rec[i][j].pCurrA = pNextA;
                        rec[i][j].pPrevC = rec[i][j].pCurrC;
                        rec[i][j].pCurrC = pNextC;
                    }
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

            colorscale: [[0, '#000000'], [0.365, '#ff0000'], [0.746, '#ffff00'], [1, '#ffffff']],
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