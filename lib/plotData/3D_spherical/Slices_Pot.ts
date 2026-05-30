'use client';

import { useMemo } from 'react';
import type { ExtendedData } from '../type';

import { linspace } from '@/lib/math/MathLibFunctions';

import type { parameters } from '@/app/courses/tdcs/theory/2/clientSide';

export default function Plot_3D({params} : {params: parameters}) {
    const plotData = useMemo(() => {
        // Resolution
        const Ngrid = 100, L_max  = 50;

        // Grid (spherical coords)
        const xvec = linspace(-params.R, params.R, Ngrid);
        
        const createSlice = (plane: 'yz' | 'xz' | 'xy') => {
            const x: number[][] = [], y: number[][] = [], z: number[][] = [], v: number[][] = [], rec: any[][] = [], E: number[][] = [];

            for (let i = 0; i < Ngrid; i++) {
                const xRow: number[] = [], yRow: number[] = [], zRow: number[] = [], vRow: number[] = [], recRow: any[] = [], ERow: number[] = [];
    
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
                        ERow.push(0);
    
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
                        ERow.push(NaN);
    
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
                E.push(ERow);
                rec.push(recRow);
            }
            return { x, y, z, v, E, rec };
        };

        // Create grids of slices
        const sliceYZ = createSlice('yz');
        const sliceXZ = createSlice('xz');
        const sliceXY = createSlice('xy');

        const allSlices = [sliceYZ, sliceXZ, sliceXY];

        // Bonnet's recursion
        let P_prev_alpha_A = 1;
        let P_curr_alpha_A = Math.cos(params.posA[2]);
        let P_prev_alpha_C = 1;
        let P_curr_alpha_C = Math.cos(params.posC[2]);
        
        // Solver loop
        const scalarConst = params.I_tot / (params.sigma * 2 * Math.PI);
        for(let l = 1; l < L_max; l++){
            const P_next_alpha_A = ((2 * l + 1) * Math.cos(params.posA[2]) * P_curr_alpha_A - l * P_prev_alpha_A) / (l + 1);
            const P_next_alpha_C = ((2 * l + 1) * Math.cos(params.posC[2]) * P_curr_alpha_C - l * P_prev_alpha_C) / (l + 1);
            const cap_factor_A = P_prev_alpha_A - P_next_alpha_A; 
            const cap_factor_C = P_prev_alpha_C - P_next_alpha_C;  

            const termConst = scalarConst / (l * (2 * l + 1) * params.R ** (l+1));
            const EtermConst = scalarConst / (params.R ** (l+1) * (2 * l + 1));

            allSlices.forEach(slice => {
                for (let i = 0; i < Ngrid; i++) {
                    for (let j = 0; j < Ngrid; j++) {
                        const r = Math.sqrt(slice.x[i][j] ** 2 + slice.y[i][j] ** 2 + slice.z[i][j] ** 2);
                        if (r <= params.R) {
                            slice.v[i][j] += termConst * r ** l * (cap_factor_A / (1-Math.cos(params.posA[2])) * slice.rec[i][j].pCurrA - cap_factor_C / (1-Math.cos(params.posC[2])) * slice.rec[i][j].pCurrC);
                            slice.E[i][j] += EtermConst * r ** (l - 1) * (cap_factor_A / (1-Math.cos(params.posA[2])) * slice.rec[i][j].pCurrA - cap_factor_C / (1-Math.cos(params.posC[2])) * slice.rec[i][j].pCurrC);

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
            P_prev_alpha_A = P_curr_alpha_A; P_curr_alpha_A = P_next_alpha_A;
            P_prev_alpha_C = P_curr_alpha_C; P_curr_alpha_C = P_next_alpha_C;
        }

        let minV = Infinity;
        let maxV = -Infinity;
        let minE = Infinity;
        let maxE = -Infinity;

        const dx = xvec[1] - xvec[0]; // Grid spacing size delta

        allSlices.forEach(slice => {
            for (let i = 0; i < Ngrid; i++) {
                for (let j = 0; j < Ngrid; j++) {
                    if (isNaN(slice.v[i][j])) continue;

                    let dV_dRow = 0;
                    if (i === 0 || isNaN(slice.v[i - 1][j])) {
                        dV_dRow = (slice.v[i + 1][j] - slice.v[i][j]) / dx; // Forward
                    } else if (i === Ngrid - 1 || isNaN(slice.v[i + 1][j])) {
                        dV_dRow = (slice.v[i][j] - slice.v[i - 1][j]) / dx; // Backward
                    } else {
                        dV_dRow = (slice.v[i + 1][j] - slice.v[i - 1][j]) / (2 * dx); // Central
                    }

                    let dV_dCol = 0;
                    if (j === 0 || isNaN(slice.v[i][j - 1])) {
                        dV_dCol = (slice.v[i][j + 1] - slice.v[i][j]) / dx; // Forward
                    } else if (j === Ngrid - 1 || isNaN(slice.v[i][j + 1])) {
                        dV_dCol = (slice.v[i][j] - slice.v[i][j - 1]) / dx; // Backward
                    } else {
                        dV_dCol = (slice.v[i][j + 1] - slice.v[i][j - 1]) / (2 * dx); // Central
                    }

                    // Map gradients back into physical spatial components
                    const E_row = -dV_dRow;
                    const E_col = -dV_dCol;

                    // Combine the analytical out-of-plane radial component with local tangential components
                    const E_radial = slice.E[i][j];
                    slice.E[i][j] = Math.sqrt(E_radial ** 2 + E_row ** 2 + E_col ** 2);

                    if (slice.v[i][j] < minV) minV = slice.v[i][j];
                    if (slice.v[i][j] > maxV) maxV = slice.v[i][j];
                    if (slice.E[i][j] < minE) minE = slice.E[i][j];
                    if (slice.E[i][j] > maxE) maxE = slice.E[i][j];
                }
            }
        });


        const sharedSurface = {
            type: 'surface' as const,
            colorscale: [[0, '#000000'], [0.365, '#ff0000'], [0.746, '#ffff00'], [1, '#ffffff']] as [number, string][],
            // Shared colorbar
            cauto: false,
            cmin: minE,
            cmax: maxE,
        };

        const data: ExtendedData[] = [
            { ...sharedSurface, x: sliceYZ.x, y: sliceYZ.y, z: sliceYZ.z, surfacecolor: sliceYZ.E },
            { ...sharedSurface, x: sliceXZ.x, y: sliceXZ.y, z: sliceXZ.z, surfacecolor: sliceXZ.E },
            { ...sharedSurface, x: sliceXY.x, y: sliceXY.y, z: sliceXY.z, surfacecolor: sliceXY.E }
        ];

        return data;
    }, [params.R, params.posA, params.posC, params.sigma, params.I_tot]);

    return plotData;
}