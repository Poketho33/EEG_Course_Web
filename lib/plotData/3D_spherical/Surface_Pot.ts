'use client';

import { useMemo } from 'react';

import type { ExtendedData } from '@/lib/plotData/type';
import { plotTypes } from '@/lib/plotData/type';

import type { parameters } from '@/app/courses/tdcs/theory/2/clientSide';

export default function Plot_3D_Surface({params, plotType} : {params: parameters, plotType: plotTypes}) {
    // Resolution
    const nTheta = 50, nPhi = 100, L_max  = 50;

    const plotData = useMemo(() => {    
        // Arrays
        const x: number[][] = [], y: number[][] = [], z: number[][] = [], v: number[][] = [], rec: any[][] = [], E: number[][] = [];

        // Generate grid
        for (let i = 0; i < nTheta; i++) {
            const theta = (i / (nTheta - 1)) * Math.PI;
            const xRow: number[] = [], yRow: number[] = [], zRow: number[] = [], vRow: number[] = [], recRow: any[] = [], ERow: number[] = [];

            for (let j = 0; j < nPhi; j++) {
                const phi = (j / (nPhi - 1)) * 2 * Math.PI;

                xRow.push(params.R * Math.sin(theta) * Math.cos(phi));
                yRow.push(params.R * Math.sin(theta) * Math.sin(phi));
                zRow.push(params.R * Math.cos(theta));

                const cosGammaA = Math.cos(theta) * Math.cos(params.posA[0]) + 
                                Math.sin(theta) * Math.sin(params.posA[0]) * Math.cos(phi - params.posA[1]);
                const cosGammaC = Math.cos(theta) * Math.cos(params.posC[0]) + 
                                Math.sin(theta) * Math.sin(params.posC[0]) * Math.cos(phi - params.posC[1]);
                
                // Bonnet's recursion
                vRow.push(0);
                ERow.push(0);
                recRow.push({
                    cosGammaA, cosGammaC,
                    pPrevA: 1, pCurrA: cosGammaA,
                    pPrevC: 1, pCurrC: cosGammaC
                })
            }
            x.push(xRow); y.push(yRow); z.push(zRow); v.push(vRow); rec.push(recRow); E.push(ERow);
        }

        // Loop solver
        let P_prev_alpha_A = 1;
        let P_curr_alpha_A = Math.cos(params.posA[2]);
        let P_prev_alpha_C = 1;
        let P_curr_alpha_C = Math.cos(params.posC[2]);

        const scalarConst = params.I_tot / (params.sigma * 2 * Math.PI);
        for (let l = 1; l <= L_max; l++) {
            const P_next_alpha_A = ((2 * l + 1) * Math.cos(params.posA[2]) * P_curr_alpha_A - l * P_prev_alpha_A) / (l + 1);
            const P_next_alpha_C = ((2 * l + 1) * Math.cos(params.posC[2]) * P_curr_alpha_C - l * P_prev_alpha_C) / (l + 1);

            const cap_factor_A = P_prev_alpha_A - P_next_alpha_A; 
            const cap_factor_C = P_prev_alpha_C - P_next_alpha_C; 
            
            const termConst = scalarConst / (l * (2 * l + 1) * params.R);
            const EtermConst = scalarConst / (params.R ** 2 * (2 * l + 1));

            for (let i = 0; i < nTheta; i++) {
                for (let j = 0; j < nPhi; j++) {
                    const cell = rec[i][j];
                    
                    // At r = R, so no inside points are calculated
                    v[i][j] += termConst * (cap_factor_A / (1-Math.cos(params.posA[2])) * cell.pCurrA - cap_factor_C / (1-Math.cos(params.posC[2])) * cell.pCurrC);
                    E[i][j] += EtermConst * (cap_factor_A / (1-Math.cos(params.posA[2])) * cell.pCurrA - cap_factor_C / (1-Math.cos(params.posC[2])) * cell.pCurrC);

                    const pNextA = ((2 * l + 1) * cell.cosGammaA * cell.pCurrA - l * cell.pPrevA) / (l + 1);
                    const pNextC = ((2 * l + 1) * cell.cosGammaC * cell.pCurrC - l * cell.pPrevC) / (l + 1);
                    cell.pPrevA = cell.pCurrA; cell.pCurrA = pNextA;
                    cell.pPrevC = cell.pCurrC; cell.pCurrC = pNextC;
                }
            }
            P_prev_alpha_A = P_curr_alpha_A; P_curr_alpha_A = P_next_alpha_A;
            P_prev_alpha_C = P_curr_alpha_C; P_curr_alpha_C = P_next_alpha_C;
        }

        const deltaTheta = Math.PI / (nTheta - 1);
        const deltaPhi = (2 * Math.PI) / (nPhi - 1);

        for (let i = 0; i < nTheta; i++) {
            const theta = (i / (nTheta - 1)) * Math.PI;
            const sinTheta = Math.sin(theta);

            // Out of bounds
            let index_imo = i === 0 ? 0 : i - 1;
            let index_ipo = i === nTheta - 1 ? nTheta - 1 : i + 1;
            let thetaFactor = i === 0 || i === nTheta - 1 ? 1 : 2;

            for (let j = 0; j < nPhi; j++) {
                let index_jmo = j === 0 ? nPhi - 1 : j - 1;
                let index_jpo = j === nPhi - 1 ? 0 : j + 1;

                let Etheta = -1 / params.R * (v[index_ipo][j] - v[index_imo][j]) / (thetaFactor * deltaTheta); 
                
                let Ephi = 0;
                if (sinTheta > 1e-5) {
                    Ephi = -1 / (params.R * sinTheta) * (v[i][index_jpo] - v[i][index_jmo]) / (2 * deltaPhi); 
                }
                
                E[i][j] = Math.sqrt(E[i][j] ** 2 + Etheta ** 2 + Ephi ** 2);
            }
        }

        return {x, y, z, v, E};
    }, [params.R, params.posA, params.posC, params.sigma, params.I_tot]);

    const returnData = useMemo(() => {
        const data: ExtendedData[] = [{
            type: 'surface' as const,
            x: plotData.x,
            y: plotData.y,
            z: plotData.z,
            surfacecolor: plotType == plotTypes.potential ? plotData.v : plotData.E,
            colorscale: [[0, '#000000'], [0.365, '#ff0000'], [0.746, '#ffff00'], [1, '#ffffff']] as [number, string][],
        }];

        return data
    }, [plotData, plotType])

    return returnData;
}