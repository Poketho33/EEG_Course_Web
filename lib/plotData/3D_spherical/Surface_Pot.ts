'use client';

import { useMemo } from 'react';
import type { ExtendedData } from '../type';

import type { parameters } from '@/app/courses/tdcs/theory/2/clientSide';

export default function Plot_3D_Surface({params, J_0} : {params: parameters, J_0: number}) {
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

                xRow.push(params.R * Math.sin(theta) * Math.cos(phi));
                yRow.push(params.R * Math.sin(theta) * Math.sin(phi));
                zRow.push(params.R * Math.cos(theta));

                const cosGammaA = Math.cos(theta) * Math.cos(params.posA[0]) + 
                                Math.sin(theta) * Math.sin(params.posA[0]) * Math.cos(phi - params.posA[1]);
                const cosGammaC = Math.cos(theta) * Math.cos(params.posC[0]) + 
                                Math.sin(theta) * Math.sin(params.posC[0]) * Math.cos(phi - params.posC[1]);
                
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
        let pCurrCap = Math.cos(params.alpha);

        for (let l = 1; l <= L_max; l++) {
            const pNextCap = ((2 * l + 1) * Math.cos(params.alpha) * pCurrCap - l * pPrevCap) / (l + 1);
            const capFactor = pPrevCap - pNextCap;
            const termConst = J_0 / (params.sigma * l * (2 * l + 1) * (params.R ** (l - 1)));

            for (let i = 0; i < nTheta; i++) {
                for (let j = 0; j < nPhi; j++) {
                    const cell = rec[i][j];
                    
                    // At r = R, so no inside points are calculated
                    v[i][j] += termConst * (params.R ** l) * capFactor * (cell.pCurrA - cell.pCurrC);

                    const pNextA = ((2 * l + 1) * cell.cosGammaA * cell.pCurrA - l * cell.pPrevA) / (l + 1);
                    const pNextC = ((2 * l + 1) * cell.cosGammaC * cell.pCurrC - l * cell.pPrevC) / (l + 1);
                    cell.pPrevA = cell.pCurrA; cell.pCurrA = pNextA;
                    cell.pPrevC = cell.pCurrC; cell.pCurrC = pNextC;
                }
            }
            pPrevCap = pCurrCap; pCurrCap = pNextCap;
        }

        const data: ExtendedData[] = [{
            type: 'surface' as const,
            x: x,
            y: y,
            z: z,
            surfacecolor: v,
            colorscale: [[0, '#000000'], [0.365, '#ff0000'], [0.746, '#ffff00'], [1, '#ffffff']] as [number, string][],
        }];

        return data;
    }, [params.R, params.alpha, params.posA, params.posC]);

    return plotData;
}