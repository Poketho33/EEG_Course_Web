'use client'

import 'katex/dist/katex.min.css';
import { useState, useMemo, useRef, useEffect } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import type { Data, Layout } from 'plotly.js';

import Derivation from "@/components/Derivation";
import { plotTypes } from '@/lib/plotData/type';

import SlicesPotPlot from "@/lib/plotData/3D_spherical/Slices_Pot";
import SurfacePotPlot from "@/lib/plotData/3D_spherical/Surface_Pot";
import ShellsPlot from "@/lib/plotData/3D_spherical/Shells";

export type parameters = {
    R: number;
    sigma: number; 
    I_tot: number; 
    posA: number[]; // [Theta, Phi] 
    posC: number[];
};

import dynamic from 'next/dynamic';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ClientSide() {
    // use states
    const [posA, setPosA] = useState([Math.PI / 2, 0, 0.02]);
    const [posC, setPosC] = useState([Math.PI, 0, 0.02]);
    const [sigma, setSigma] = useState(0.33);
    const [iTot, setITot] = useState(1e-3);
    const [plotType, setPlotType] = useState<plotTypes>(plotTypes.potential);

    // Set init parameters
    const params: parameters = {R: 0.1, sigma: sigma, I_tot: iTot, posA: posA, posC: posC};

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
                    \frac{1}{R} \frac{d}{d r} (r^2 \frac{d R}{d r})
                    = l(l+1)
                "/>

                <p>
                    This is the Cauchy-Euler ODE, which has solutions:
                </p>

                <BlockMath math="
                    R(r) = A_l r^l + B_l r^{-(l+1)}
                "/>

                <p>
                    The previous PDE is thus simplified to:
                </p>

                <BlockMath math="
                    - \sin^2(\theta) l (l+1)
                    + \frac{\sin(\theta)}{\Theta} \frac{d}{d \theta} (\sin(\theta) \frac{d \Theta}{d \theta})
                    + \frac{1}{\Phi} \frac{d^2 \Phi}{d \phi^2}
                    = 0
                "/>

                <p>
                    The
                    <span className='font-bold'> azimuthal </span>  
                    ODE is:
                </p>

                <BlockMath math="
                    \frac{1}{\Phi} \frac{d^2 \Phi}{d \phi^2}
                    = - m^2
                "/>

                <p>
                    Which has solutions:
                </p>

                <BlockMath math="
                    \Phi(\phi) = C_m \cos(m \phi) + D_m \sin(m \phi)
                "/>

                <p>
                    Finally, the simplification of the PDE leads to the Associated Legendre Differential Equation for the
                    <span className='font-bold'> angular </span>  
                    ODE:
                </p>

                <BlockMath math="
                    \frac{1}{\sin\theta}\frac{d}{d \theta} (\sin \theta \frac{d \Theta}{d \theta}) 
                    + (l (l+1) - \frac{m^2}{\sin^2(\theta)}) \Theta 
                    = 0
                "/>

                <p>
                    With the general solution given by the Associated Legendre functions:
                </p>

                <BlockMath math="
                    \Theta(\theta) = E P^m_l(\cos(\theta)) + F Q^m_l(\cos(\theta))
                "/>

                <p>
                    The combined solutions of each ODE can be put back together to get the potential.
                    The constant B is 0 in this case, so the solution does not blow up at the origin. 
                    Furthermore, F can be set to 0, as Q would blow up at the poles. 
                    At the same time, E is absorbed by the other constants.
                </p>

                <BlockMath math="
                    V = \sum_{l=0}^{\infty} \sum_{m=-l}^{l} r^l P^m_l (\cos(\theta)) (C_{lm} \cos(m \phi) + D_{lm} \sin(m \phi))
                "/>

                <p>
                    To solve for the constants, the Neumann BC is used once again. 
                    However, before applying this condition, the sum for m is removed. 
                    This is made possible by using the combination of azimuthal symmetry and change of axis. 
                    By using change of axis later in the derivation, one can assume now that the sphere has this symmetry, leading to the following simplification:
                </p>

                <BlockMath math="
                    V = V_0 + \sum_{l=1}^{\infty} A_l r^l P^0_l (\cos(\theta))
                "/>

                <p>
                    Now the Neumann BC gives:
                </p>

                <BlockMath math="
                    \sigma \frac{\partial V}{\partial r}\bigg|_{r=R} = J(\theta) 
                    = \sigma \sum_{l=1}^{\infty} A_l l R^{l-1} P^0_l (\cos(\theta))
                "/>

                <p>
                    Solving for A gives:
                </p>

                <BlockMath math="
                    A_l = \frac{2l+1}{2 \cdot 2\pi \sigma l R^{l-1}} \int_{0}^{2 \pi} \int_{0}^{\pi} J(\theta)  P^0_l (\cos(\theta)) \sin(\theta) d \theta d \phi
                "/>

                <p>
                    The definition for the current density is dependent on the surface of the cap. 
                    From the following definition of the density, note that the change of axis is not yet applied.
                    So, one can see that both the anode and cathode are at the north pole.
                </p>

                <BlockMath math="
                    J(\theta) = \begin{cases} 
                    \frac{I}{2 \pi R^2 (1-\cos(\alpha_A))} & \text{for } 0 \le \theta \le \alpha_A \\ 
                    - \frac{I}{2 \pi R^2 (1-\cos(\alpha_C))} & \text{for } 0 \le \theta \le \alpha_C  
                    \end{cases}
                "/>

                <BlockMath math="
                \begin{aligned}
                    A_l &= \frac{(2l+1)I}{4\pi \sigma l R^{l-1} R^2} 
                    [ \frac{1}{1-\cos(\alpha_A)} \int_{0}^{\alpha_A} P^0_l (\cos(\theta)) \sin(\theta) d \theta 
                    - \frac{1}{1-\cos(\alpha_C)} \int_{0}^{\alpha_C} P^0_l (\cos(\theta)) \sin(\theta) d \theta ] \\

                    &= \frac{I}{\sigma l R^{l+1}} 
                    [\frac{1}{1-\cos(\alpha_A)} (P^0_{l-1} (\cos(\alpha_A)) - P^0_{l+1} (\cos(\alpha_A))) 
                    - \frac{1}{1-\cos(\alpha_C)} (P^0_{l-1} (\cos(\alpha_C)) - P^0_{l+1} (\cos(\alpha_C))) ]
                \end{aligned}
                "/>

                <p>
                    Now, this of course is not the final answer. Both the electrodes are at the north pole.
                    To move them, change of axis is used, where the angles of the legendre functions are changed to match the electrode positions.
                    Thus changing the axis of the function to move the north pole to the desired electrode position. Notice that our determined coefficient $A_l$ is purely a structural scalar weight, so the positional shift maps directly onto the spatial harmonics inside the potential summation:
                </p>

                <p>
                    With:
                </p>

                <BlockMath math="
                    \cos(\gamma_{A/C}) = \cos(\theta)\cos(\theta_{A/C}) + \sin(\theta) \sin(\theta_{A/C}) \cos(\phi - \phi_{A/C})
                "/>

                <p>
                    Leading to the final potential solution:
                </p>

                <BlockMath math="
                    V = V_0 + \frac{I}{\sigma 2 \pi} \sum_{l=1}^{\infty} \frac{1}{l (l+1)} \frac{r^l}{R^{l+1}}
                    [\frac{P^0_{l-1} (\cos(\alpha_A)) - P^0_{l+1} (\cos(\alpha_A))}{1-\cos(\alpha_A)} P^0_l(\cos(\gamma_A)) 
                    - \frac{P^0_{l-1} (\cos(\alpha_C)) - P^0_{l+1} (\cos(\alpha_C))}{1-\cos(\alpha_C)} P^0_l(\cos(\gamma_C))]
                "/>

            </div>
            <div className="flex flex-col justify-center items-center bg-lighter rounded-lg p-6 gap-6">
                <div className="flex flex-row justify-start items-center w-full gap-4">
                    <label className="text-white">Anode: <InlineMath math='\theta'/> [rad]:</label>
                    <input
                        type="number"
                        step="0.1"
                        value={posA[0]}
                        className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPosA([val, posA[1], posA[2]]);
                        }}
                    />

                    <label className="text-white"><InlineMath math='\phi'/> [rad]:</label>
                    <input
                        type="number"
                        step="0.1"
                        value={posA[1]}
                        className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPosA([posA[0], val, posA[2]]);
                        }}
                    />

                    <label className="text-white"><InlineMath math='\alpha'/> [rad]:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={posA[2]}
                        className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPosA([posA[0], posA[1], val]);
                        }}
                    />
                </div>
                <div className="flex flex-row justify-start items-center w-full gap-4">    
                    <label className="text-white">Cathode: <InlineMath math='\theta'/> [rad]:</label>
                    <input
                        type="number"
                        step="0.1"
                        value={posC[0]}
                        className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPosC([val, posC[1], posC[2]]);
                        }}
                    />

                    <label className="text-white"><InlineMath math='\phi'/> [rad]:</label>
                    <input
                        type="number"
                        step="0.1"
                        value={posC[0]}
                        className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPosC([posC[0], val, posC[2]]);
                        }}
                    />

                    <label className="text-white"><InlineMath math='\alpha'/> [rad]:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={posC[2]}
                        className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                        onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPosC([posC[0], posC[1], val]);
                        }}
                    />
                </div>
                <div className="flex flex-row justify-between items-center w-full gap-4">    
                    <div className="flex flex-row items-center gap-4">
                        <label className="text-white"><InlineMath math='\sigma'/> [S/m]:</label>
                        <input
                            type="number"
                            step="0.01"
                            value={sigma}
                            className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setSigma(val);
                            }}
                        />

                        <label className="text-white">I [A]:</label>
                        <input
                            type="number"
                            step="0.001"
                            value={iTot}
                            className="bg-transparent text-white border border-gray-600 rounded px-2 py-1"
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setITot(val);
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        <button
                            className={plotType === plotTypes.potential ? "bg-pastel_4 text-background h-full p-2 rounded-lg" : "p-2 rounded-lg"}
                            onClick={() => setPlotType(plotTypes.potential)}
                        >
                            Potential
                        </button>
                        <button
                            className={plotType === plotTypes.electric ? "bg-pastel_4 text-background h-full p-2 rounded-lg" : "p-2 rounded-lg"}
                            onClick={() => setPlotType(plotTypes.electric)}
                        >
                            Electric
                        </button>
                    </div>
                </div>

                {/* Plots */}
                <div className="flex flex-row justify-center items-center">
                    <Plot
                        data={SurfacePotPlot({params, plotType}) as Data[]}
                        layout={layout}
                        config={{ responsive: true }}
                    />
                    <Plot
                        data={SlicesPotPlot({params, plotType}) as Data[]}
                        layout={layout}
                        config={{ responsive: true }}
                    />
                </div>

            </div>

            <div className="space-y-6 max-w-[600px]">
                {/* Text for shells plot */}
                <p>
                    The homogeneous solution alters from changes in the anode and cathode positions. 
                    However, most other properties still act as scalars. 
                    This changes in the multiple shell model. 
                    This model has mutliple shells with their individual radii and conductivities.
                    This means that the B constant earlier cannot be omitted, and that the Neumann boundary condition must be applied at each shell edge. 
                    Unfortunately, the mathematical solution is much harder to derive because of this. 
                    Instead, an FEM is used. An FEM is ...
                </p>
            </div>
        </div>
    );
}