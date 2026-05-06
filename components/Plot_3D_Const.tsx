'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data, Layout } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Plot_3D() {
    const plotData = useMemo(() => {
        const size = 50;
        const x: number[][] = [];
        const y: number[][] = [];
        const z: number[][] = [];
        const v: number[][] = [];

        for (let i = 0; i <= size; i++) {
            const theta = (i / size) * Math.PI;
            const xRow: number[] = [];
            const yRow: number[] = [];
            const zRow: number[] = [];
            const vRow: number[] = [];

            for (let j = 0; j <= size; j++) {
                const phi = (j / size) * 2 * Math.PI;

                const xVal = Math.sin(theta) * Math.cos(phi);
                const yVal = Math.sin(theta) * Math.sin(phi);
                const zVal = Math.cos(theta);

                xRow.push(xVal);
                yRow.push(yVal);
                zRow.push(zVal);
                vRow.push(yVal *  Math.sin(phi)); 
            }
            x.push(xRow);
            y.push(yRow);
            z.push(zRow);
            v.push(vRow);
        }

        const data: Data[] = [{
            type: 'surface',
            x: x,
            y: y,
            z: z,
            surfacecolor: v,

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