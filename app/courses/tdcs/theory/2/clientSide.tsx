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
        <div className="space-y-6 relative">
            <div className="space-y-6 max-w-[600px]">
                <p>
                    The physical principles for a spherical medium build upon the circular case. 
                    The seperation of variables used to solve the Laplace PDE can be expanded to: <InlineMath math="V (r, \theta, \phi) = R(r) \Theta(\theta) \Phi(\phi)" />.
                    Filling this in the Laplace PDE leads to:
                </p>

                <BlockMath math="
                    \frac{1}{R} \frac{\partial}{\partial r} (r^2 \frac{\partial R}{\partial r})
                    + \frac{1}{\sin(\theta) \Theta} \frac{\partial}{\partial \theta} (\sin(\theta) \frac{\partial \Theta}{\partial \theta})
                    + \frac{1}{\sin^2(\theta) \Phi} \frac{\partial^2 \Phi}{\partial \phi^2}
                    = 0
                "/>

                <p>
                    Similar to the 2D case, this formula can be solved to receive seperate ODEs.
                    First, the 
                    <span className='font-bold'> radial </span> 
                    ODE:
                </p>

                <BlockMath math="
                    \frac{1}{R} \frac{\partial}{\partial r} (r^2 \frac{\partial R}{\partial r})
                    = l(l+1)
                "/>

                <p>
                    This is the Cauchy-Euler ODE, which has solutions:
                </p>

                <BlockMath math="
                    R(r) = A r^l + B r^{-(l+1)}
                "/>

                <p>
                    The previous PDE is thus simplified to:
                </p>

                <BlockMath math="
                    \sin^2(\theta) l (l+1)
                    + \frac{\sin(\theta)}{\Theta} \frac{\partial}{\partial \theta} (\sin(\theta) \frac{\partial \Theta}{\partial \theta})
                    + \frac{1}{\Phi} \frac{\partial^2 \Phi}{\partial \phi^2}
                    = 0
                "/>

                <p>
                    The
                    <span className='font-bold'> azimuthal </span>  
                    ODE is:
                </p>

                <BlockMath math="
                    \frac{1}{\Phi} \frac{\partial^2 \Phi}{\partial \phi^2}
                    = - m^2
                "/>

                <p>
                    Which has solutions:
                </p>

                <BlockMath math="
                    \Phi(\phi) = C \cos(m \phi) + D \sin(m \phi)
                "/>

            </div>
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