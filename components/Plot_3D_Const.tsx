'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js';

import { linspace } from '@/lib/math/MathLibFunctions';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Plot_3D() {
    // Parameters
    const R = 0.1, sigma = 0.33, I_tot = 1e-3, alpha = 0.6;
    const Ngrid = 100, L_max  = 25;
    const J_0 = I_tot / (2 * Math.PI * R**2 * (1 - Math.cos(alpha)));

    // Electrode positions [theta, phi]
    const posA = [0, 0];
    const posC = [Math.PI/2, 0];

    // Grid (spherical coords)
    const xvec = linspace(-R, R, Ngrid);

    const points = useMemo(() => {
        const points = [];

        for (let i = 0; i < Ngrid; i++) {
            for (let j = 0; j < Ngrid; j++) {
                for (let k = 0; k < Ngrid; k++) {
                    const x = xvec[i];
                    const y = xvec[j];
                    const z = xvec[k];
                    
                    const r = Math.sqrt(x**2 + y**2 + z**2);
                    
                    // Mask
                    if (r <= R) { 
                        let theta = Math.acos(z / r);
                        let phi = Math.atan2(y, x);
                        let cosGammaA = Math.cos(theta) * Math.cos(posA[0]) + Math.sin(theta) * Math.sin(posA[0]) * Math.cos(phi - posA[2]);
                        let cosGammaC = Math.cos(theta) * Math.cos(posC[0]) + Math.sin(theta) * Math.sin(posC[0]) * Math.cos(phi - posC[2]);

                        points.push({
                            x: x,
                            y: y,
                            z: z,
                            r: r,
                            theta: theta,
                            phi: phi,
                            V: 0,
                            cosGammaA: cosGammaA,
                            cosGammaC: cosGammaC,

                            // Bonnet's recursion for the cosGamma legendre functions
                            pPrevA: 1,
                            pCurrA: cosGammaA,             
                            pPrevC: 1,
                            pCurrC: cosGammaC
                        });
                    }
                }
            }
        }
        return points;
    }, [R, Ngrid]); // might need another useMemo for the recalculation of cosGammaA/C on posA/C change



    const plotData = useMemo(() => {
        // Bonnet's recursion
        let pPrevCap = 1;
        let pCurrCap = Math.cos(alpha);

        points.forEach(point => {
            for(let l = 0; l < L_max; l++){
                let pNextCap = ((2 * l + 1) * Math.cos(alpha) * pCurrCap - l * pPrevCap) / (l + 1);
                let cap_factor = (pPrevCap - pNextCap); 

                let term_const = J_0 / (sigma * l * (2*l + 1) * R**(l-1));

                point.V += term_const * point.r ** l * cap_factor * (point.pCurrA - point.pCurrC);

                // Set recursion to next value
                pPrevCap = pCurrCap;
                pCurrCap = pNextCap;

                let pNextA = ((2 * l + 1) * point.cosGammaA * point.pCurrA - l * point.pPrevA) / (l + 1);
                let pNextC = ((2 * l + 1) * point.cosGammaC * point.pCurrC - l * point.pPrevC) / (l + 1);

                point.pPrevA = point.pCurrA;
                point.pCurrA = pNextA;
                point.pPrevC = point.pCurrC;
                point.pCurrC = pNextC;

            }
        });

        const data: Data[] = [{
            type: 'surface',
            x: points.x,
            y: points.y,
            z: points.z,
            surfacecolor: points.V,

            colorscale: 'Viridis',
            showscale: true,
            colorbar: {
                
                thickness: 15,
                len: 0.5
            }
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