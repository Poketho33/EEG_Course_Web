'use client'

import 'katex/dist/katex.min.css';
import { useState, useMemo } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import type { Data, Layout } from 'plotly.js';

import Derivation from "@/components/Derivation";

import SlicesPotPlot from "@/lib/plotData/3D_spherical/Slices_Pot";
import SurfacePotPlot from "@/lib/plotData/3D_spherical/Surface_Pot";

export type parameters = {
    R: number;
    sigma: number; 
    I_tot: number; 
    alpha: number;
    posA: number[]; // [Theta, Phi] 
    posC: number[];
};

import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ClientSide() {
    // Set init parameters
    const params: parameters = {R: 0.1, sigma: 0.33, I_tot: 1e-3, alpha: 0.0002, posA: [Math.PI/2, 0], posC: [Math.PI, 0]};
    const J_0 = useMemo(() => { return params.I_tot / (2 * Math.PI * params.R**2 * (1 - Math.cos(params.alpha)))}, [params.I_tot, params.R, params.alpha]);

    // Shared layout
    const layout: Partial<Layout> = {
        width: 600,
        height: 600,
        paper_bgcolor: 'transparent',
        font: { color: '#ffffff' },
        title: { text: 'Potential Field at the Surface (V)' },
        margin: { t: 40, b: 0, l: 0, r: 0 },
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Plot
                data={SurfacePotPlot({params, J_0}) as Data[]}
                layout={layout}
                config={{ responsive: true }}
            />
            <Plot
                data={SlicesPotPlot({params, J_0}) as Data[]}
                layout={layout}
                config={{ responsive: true }}
            />
        </div>
    );
}