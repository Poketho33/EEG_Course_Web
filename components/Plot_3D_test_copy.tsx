'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Plot_3D_Surface() {
    // Parameters
    const R = 0.1, sigma = 0.33, I_tot = 1e-3, alpha = 0.0002;
    const posA = [0, 0]; const posC = [Math.PI, 0];
    const J_0 = I_tot / (2 * Math.PI * R**2 * (1 - Math.cos(alpha)));
    // Resolution
    const nTheta = 50, nPhi = 100, L_max  = 50;


    const plotData = useMemo(() => {    
        // Arrays
        const x = [], y = [], z = [], v = [], rec = [];

        // Generate grid
        for (let i = 0; i < nTheta; i++) {
            const theta = (i / (nTheta - 1)) * Math.PI;
            const xRow = [], yRow = [], zRow = [], vRow = [], recRow = [];

            for (let j = 0; j < nPhi; j++) {
                const phi = (j / (nPhi - 1)) * 2 * Math.PI;

                xRow.push(R * Math.sin(theta) * Math.cos(phi));
                yRow.push(R * Math.sin(theta) * Math.sin(phi));
                zRow.push(R * Math.cos(theta));

                const cosGammaA = Math.cos(theta) * Math.cos(posA[0]) + 
                                Math.sin(theta) * Math.sin(posA[0]) * Math.cos(phi - posA[1]);
                const cosGammaC = Math.cos(theta) * Math.cos(posC[0]) + 
                                Math.sin(theta) * Math.sin(posC[0]) * Math.cos(phi - posC[1]);
                
                // Bonnet's recursion
                vRow.push(0);
                recRow.push({
                    cosGammaA, cosGammaC,
                    pPrevA: 1, pCurrA: cosGammaA,
                    pPrevC: 1, pCurrC: cosGammaC
                })
            }
            x.push(xRow); y.push(yRow); z.push(zRow); v.push(vRow); rec.push(recRow);
        }

        // Loop solver
        let pPrevCap = 1;
        let pCurrCap = Math.cos(alpha);

        for (let l = 1; l <= L_max; l++) {
            const pNextCap = ((2 * l + 1) * Math.cos(alpha) * pCurrCap - l * pPrevCap) / (l + 1);
            const capFactor = pPrevCap - pNextCap;
            const termConst = J_0 / (sigma * l * (2 * l + 1) * (R ** (l - 1)));

            for (let i = 0; i < nTheta; i++) {
                for (let j = 0; j < nPhi; j++) {
                    const cell = rec[i][j];
                    
                    // At r = R, so no inside points are calculated
                    v[i][j] += termConst * (R ** l) * capFactor * (cell.pCurrA - cell.pCurrC);

                    const pNextA = ((2 * l + 1) * cell.cosGammaA * cell.pCurrA - l * cell.pPrevA) / (l + 1);
                    const pNextC = ((2 * l + 1) * cell.cosGammaC * cell.pCurrC - l * cell.pPrevC) / (l + 1);
                    cell.pPrevA = cell.pCurrA; cell.pCurrA = pNextA;
                    cell.pPrevC = cell.pCurrC; cell.pCurrC = pNextC;
                }
            }
            pPrevCap = pCurrCap; pCurrCap = pNextCap;
        }

        const data: Data[] = [{
            type: 'surface',
            x: x,
            y: y,
            z: z,
            surfacecolor: v,
            colorscale: 'Viridis',
        }];

        return data;
    }, [R, alpha, posA, posC]);

    const layout: Partial<Layout> = {
        width: 600,
        height: 600,
        paper_bgcolor: 'transparent',
        font: {
            color: '#ffffff'
        },
        title: {
            text: 'Potential Field at the Surface (V)'
        },
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