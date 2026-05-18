'use client';

import { useMemo } from 'react';
import type { Data } from 'plotly.js';

import { linspace } from '@/lib/math/MathLibFunctions';

import type { parameters } from '@/app/courses/tdcs/theory/2/clientSide';

export default function Plot_3D({params, J_0} : {params: parameters, J_0: number}) {
    const plotData = useMemo(() => {
        // Resolution
        const Ngrid = 100, L_max  = 25;

        // Grid (spherical coords)
        const xvec = linspace(-params.R, params.R, Ngrid);
        
        const createSlice = (plane: 'yz' | 'xz' | 'xy') => {
            const x: number[][] = [], y: number[][] = [], z: number[][] = [], v: number[][] = [], rec: any[][] = [];

            for (let i = 0; i < Ngrid; i++) {
                const xRow: number[] = [];
                const yRow: number[] = [];
                const zRow: number[] = [];
                const vRow: number[] = [];
                const recRow: any[] = [];
    
                for (let j = 0; j < Ngrid; j++) {
                    let px = 0, py = 0, pz = 0;
                    if(plane == 'yz') { px = 0; py = xvec[i]; pz = xvec[j]; }
                    else if(plane == 'xz') { px = xvec[i]; py = 0; pz = xvec[j]; }
                    else if(plane == 'xy') { px = xvec[i]; py = xvec[j]; pz = 0; }
    
                    const r = Math.sqrt(px**2 + py**2 + pz**2) || 1e-10;
    
                    if(r <= params.R){
                        xRow.push(px);
                        yRow.push(py);
                        zRow.push(pz);
                        vRow.push(0);
    
                        // rec
                        let theta = Math.acos(pz / r);
                        let phi = Math.atan2(py, px);
    
                        let cosGammaA = Math.cos(theta) * Math.cos(params.posA[0]) + Math.sin(theta) * Math.sin(params.posA[0]) * Math.cos(phi - params.posA[1]);
                        let cosGammaC = Math.cos(theta) * Math.cos(params.posC[0]) + Math.sin(theta) * Math.sin(params.posC[0]) * Math.cos(phi - params.posC[1]);
    
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
            return { x, y, z, v, rec };
        };

        // Create grids of slices
        const sliceYZ = createSlice('yz');
        const sliceXZ = createSlice('xz');
        const sliceXY = createSlice('xy');

        const allSlices = [sliceYZ, sliceXZ, sliceXY];

        // Bonnet's recursion
        let pPrevCap = 1;
        let pCurrCap = Math.cos(params.alpha);
        
        // Solver loop
        for(let l = 1; l < L_max; l++){
            let pNextCap = ((2 * l + 1) * Math.cos(params.alpha) * pCurrCap - l * pPrevCap) / (l + 1);
            let cap_factor = (pPrevCap - pNextCap); 

            let term_const = J_0 / (params.sigma * l * (2*l + 1) * params.R**(l-1));

            allSlices.forEach(slice => {
                for (let i = 0; i < Ngrid; i++) {
                    for (let j = 0; j < Ngrid; j++) {
                        const r = Math.sqrt(slice.x[i][j] ** 2 + slice.y[i][j] ** 2 + slice.z[i][j] ** 2);
                        if (r <= params.R) {
                            slice.v[i][j] += term_const * r ** l * cap_factor * (slice.rec[i][j].pCurrA - slice.rec[i][j].pCurrC);

                            let pNextA = ((2 * l + 1) * slice.rec[i][j].cosGammaA * slice.rec[i][j].pCurrA - l * slice.rec[i][j].pPrevA) / (l + 1);
                            let pNextC = ((2 * l + 1) * slice.rec[i][j].cosGammaC * slice.rec[i][j].pCurrC - l * slice.rec[i][j].pPrevC) / (l + 1);

                            slice.rec[i][j].pPrevA = slice.rec[i][j].pCurrA;
                            slice.rec[i][j].pCurrA = pNextA;
                            slice.rec[i][j].pPrevC = slice.rec[i][j].pCurrC;
                            slice.rec[i][j].pCurrC = pNextC;
                        }
                    }
                }
            });

            // Set recursion to next value
            pPrevCap = pCurrCap;
            pCurrCap = pNextCap;
        }

        let minV = Infinity;
        let maxV = -Infinity;

        allSlices.forEach(slice => {
            for (let i = 0; i < Ngrid; i++) {
                for (let j = 0; j < Ngrid; j++) {
                    const val = slice.v[i][j];
                    if (!isNaN(val)) {
                        if (val < minV) minV = val;
                        if (val > maxV) maxV = val;
                    }
                }
            }
        });


        const sharedSurface = {
            type: 'surface' as const,
            colorscale: [[0, '#000000'], [0.365, '#ff0000'], [0.746, '#ffff00'], [1, '#ffffff']] as [number, string][],
            showscale: false,
            // Shared colorbar
            cauto: false,
            cmin: minV,
            cmax: maxV,
        };

        const data: Data[] = [
            { ...sharedSurface, x: sliceYZ.x, y: sliceYZ.y, z: sliceYZ.z, surfacecolor: sliceYZ.v, showscale: true },
            { ...sharedSurface, x: sliceXZ.x, y: sliceXZ.y, z: sliceXZ.z, surfacecolor: sliceXZ.v },
            { ...sharedSurface, x: sliceXY.x, y: sliceXY.y, z: sliceXY.z, surfacecolor: sliceXY.v }
        ];

        return data;
    }, []);

    return plotData;
}