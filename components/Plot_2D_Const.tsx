'use client'

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data } from 'plotly.js';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

import { linspace } from '@/lib/math/MathLibFunctions';

import Derivation from "@/components/Derivation";
import Slider from "@/components/Slider";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

enum plotTypes{
    potential,
    electric
};

type J_Piece = {
    angle: number;
    alpha: number;
    sign: number;
};

function createQuiverTraces(
    qx: number[], qy: number[],
    qu: number[], qv: number[],
    scale: number = 0.9,
    arrowScale: number = 0.3,
    color: string = 'white',
    lineWidth: number = 0.8
): Data {
    const barker_x: number[] = [];
    const barker_y: number[] = [];

    for (let k = 0; k < qx.length; k++) {
        const u = qu[k], v = qv[k];
        const mag = Math.sqrt(u * u + v * v);
        if (mag < 1e-12) continue;

        // Scale the arrow body
        const x0 = qx[k], y0 = qy[k];
        const x1 = x0 + scale * u;
        const y1 = y0 + scale * v;

        // Arrow head barbs — rotate ±30 degrees from tip
        const angle = Math.atan2(v, u);
        const headLen = arrowScale * mag * scale;
        const a1x = x1 - headLen * Math.cos(angle + Math.PI / 6);
        const a1y = y1 - headLen * Math.sin(angle + Math.PI / 6);
        const a2x = x1 - headLen * Math.cos(angle - Math.PI / 6);
        const a2y = y1 - headLen * Math.sin(angle - Math.PI / 6);

        // Shaft + two barbs, separated by NaN to break the line
        barker_x.push(x0, x1, a1x, NaN, x1, a2x, NaN);
        barker_y.push(y0, y1, a1y, NaN, y1, a2y, NaN);
    }

    return {
        type: 'scatter',
        x: barker_x,
        y: barker_y,
        mode: 'lines',
        line: { color, width: lineWidth },
        hoverinfo: 'skip',
        showlegend: false,
    } as Data;
}

// Parameters
const R = 0.01, sigma = 0.33, I_tot = 1e-3, alpha = 0.2;
const Ngrid = 200;

export default function App() {
    // Use States
    const [plotNum, setPlotNum] = useState<plotTypes>(plotTypes.potential);
    const [nodeOrder, setNodeOrder] = useState(false);
    const katexString = nodeOrder ? 
        "J(\\theta) = \\begin{cases} \\frac{I_0}{2 \\alpha R} & \\colorbox{red}{} \\\\ -\\frac{I_0}{2 \\beta R} & \\colorbox{blue}{} \\\\ 0 & \\text{otherwise} \\end{cases}"
        : 
        "J(\\theta) = \\begin{cases} \\frac{I_0}{2 \\alpha R} & \\colorbox{blue}{} \\\\ -\\frac{I_0}{2 \\beta R} & \\colorbox{red}{} \\\\ 0 & \\text{otherwise} \\end{cases}";
    // Piecewise J - init
    const [Jpw, setJpw] = useState<J_Piece[]>([
        { sign: 1, angle: 0, alpha: 0.2 },
        { sign: -1, angle: Math.PI, alpha: 0.2 },
    ]);
    
    //  //
    const x = useMemo(() => linspace(-R, R, Ngrid), []);
    const y = x;
    const dx = (2 * R) / (Ngrid - 1);
    const zMask = useMemo(() => {
        const m = Array.from({ length: Ngrid }, () => new Array(Ngrid).fill(0));
        for (let i = 0; i < Ngrid; i++)
            for (let j = 0; j < Ngrid; j++)
                if (Math.sqrt(x[i] ** 2 + y[j] ** 2) > R) m[j][i] = NaN;
        return m;
    }, []);

    const z = useMemo(() => {
        const z = zMask.map(row => [...row]);
        // Potential field
        // solve first n elements of the Fourier
        for (let n = 1; n < 15; n++) {
            // const Cn = 1 / (sigma * n ** 2 * R ** (n - 1) * Math.PI);
            const Cn = 1 / (sigma * n ** 2 * R ** n * Math.PI);

            let An = 0; // multiplies cos(n * th_grid)
            let Bn = 0; // multiplies sin(n * th_grid)

            // for (const piece of Jpw) {
            //     // An += piece.sign * I_tot / (2 * piece.alpha * R) * (Math.sin(n * (piece.angle + piece.alpha)) - Math.sin(n * (piece.angle - piece.alpha)));
            //     An += piece.sign * I_tot / (2 * piece.alpha) * (Math.sin(n * (piece.angle + piece.alpha)) - Math.sin(n * (piece.angle - piece.alpha)));
            //     Bn += piece.sign * I_tot / (2 * piece.alpha) * (-Math.cos(n * (piece.angle + piece.alpha)) + Math.cos(n * (piece.angle - piece.alpha)));
            // }

            // use trig functions to improve the code above:
            for (const piece of Jpw) {
                const scale = piece.sign * I_tot / piece.alpha * Math.sin(n * piece.alpha);
                An += scale * Math.cos(n * piece.angle);
                Bn += scale * Math.sin(n * piece.angle);
            }

            for (let i = 0; i < Ngrid; i++) {
                for (let j = 0; j < Ngrid; j++) {
                    if (Number.isNaN(z[j][i])) continue;
                    const r_grid = Math.sqrt(x[i] ** 2 + y[j] ** 2);
                    const th_grid = Math.atan2(y[j], x[i]);
                    z[j][i] += Cn * r_grid ** n * (
                        An * Math.cos(n * th_grid) +
                        Bn * Math.sin(n * th_grid)
                    );
                }
            }
        }

        return z;
    }, [Jpw, zMask])

    // E-field
    const { Ex, Ey, Emag } = useMemo(() => {
        const Ex = Array.from({ length: Ngrid }, () => new Array(Ngrid).fill(0));
        const Ey = Array.from({ length: Ngrid }, () => new Array(Ngrid).fill(0));
        const Emag = Array.from({ length: Ngrid }, () => new Array(Ngrid).fill(NaN));
        for (let j = 0; j < Ngrid; j++) {
            for (let i = 0; i < Ngrid; i++) {
                if (Number.isNaN(z[j][i])) continue;
                const dphidx = i > 0 && i < Ngrid - 1 ? (z[j][i + 1] - z[j][i - 1]) / (2 * dx) : i === 0 ? (z[j][1] - z[j][0]) / dx : (z[j][Ngrid - 1] - z[j][Ngrid - 2]) / dx;
                const dphidy = j > 0 && j < Ngrid - 1 ? (z[j + 1][i] - z[j - 1][i]) / (2 * dx) : j === 0 ? (z[1][i] - z[0][i]) / dx : (z[Ngrid - 1][i] - z[Ngrid - 2][i]) / dx;
                Ex[j][i] = -dphidx;
                Ey[j][i] = -dphidy;
                Emag[j][i] = Math.sqrt(Ex[j][i] ** 2 + Ey[j][i] ** 2);
            }
        }
        return { Ex, Ey, Emag };
    }, [z]);

    // Quiver
    const { potentialData, efieldData } = useMemo(() => {
        const step = 15;
        const qx: number[] = [], qy: number[] = [], qu: number[] = [], qv: number[] = [];
        for (let j = 0; j < Ngrid; j += step)
            for (let i = 0; i < Ngrid; i += step) {
                if (Number.isNaN(z[j][i])) continue;
                const mag = Emag[j][i];
                if (mag < 1e-12) continue;
                qx.push(x[i]); qy.push(y[j]);
                qu.push((Ex[j][i] / mag) * dx * step * 0.5);
                qv.push((Ey[j][i] / mag) * dx * step * 0.5);
            }

        // matlab colorscale, otherwise can also use ~colorscale: 'Hot'~
        const potentialData: Data[] = [{ z, x, y, type: 'contour', colorscale: [[0, '#000000'], [0.365, '#ff0000'], [0.746, '#ffff00'], [1, '#ffffff']], zsmooth: 'best', line: { width: 0 }, contours: { coloring: 'heatmap', showlines: false } }];
        const efieldData: Data[] = [{ z: Emag, x, y, type: 'contour', colorscale: [[0, '#000000'], [0.365, '#ff0000'], [0.746, '#ffff00'], [1, '#ffffff']], zsmooth: 'best', line: { width: 0 }, contours: { coloring: 'heatmap', showlines: false } }, createQuiverTraces(qx, qy, qu, qv, 1.0, 0.35, 'white', 0.8)];

        return { potentialData, efieldData };
    }, [z, Emag, Ex, Ey]);

    const sharedLayout = {
        width: 380,
        height: 380,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#949494' },
        xaxis: { title: { text: 'x [m]' }, tickformat: '.2e' },
        yaxis: { title: { text: 'y [m]' }, tickformat: '.2e', scaleanchor: 'x' as const },
        margin: { t: 40, b: 50, l: 60, r: 20 },
    };

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center px-16 py-4 bg-lighter rounded-xl -mb-3">
                <div className="space-y-10">
                    <BlockMath math={katexString} />

                    <div className="flex flex-col justify-center items-center">
                        <div className="flex items-center gap-3 ">
                            <span className={nodeOrder ? "text-red-400" : "text-blue-400"}>Anode</span>
                            <button
                                onClick={() => {
                                    setNodeOrder(prev => !prev);
                                    setJpw(prev => [
                                        { ...prev[0], sign: -prev[0].sign },
                                        { ...prev[1], sign: -prev[1].sign },
                                    ]);
                                }}
                                className="px-3 py-1 rounded bg-neutral-700 text-sm"
                            >
                                ⇄
                            </button>
                            <span className={nodeOrder ? "text-blue-400" : "text-red-400"}>Cathode</span>
                        </div>

                        {/* slider */}
                        <Slider
                            values={[
                                Jpw[0].angle - Jpw[0].alpha,
                                Jpw[0].angle + Jpw[0].alpha,
                                Jpw[1].angle - Jpw[1].alpha,
                                Jpw[1].angle + Jpw[1].alpha,
                            ]}
                            onChange={([lo0, hi0, lo1, hi1]) => {
                                const seg0 = { angle: (lo0 + hi0) / 2, alpha: (hi0 - lo0) / 2 };
                                const seg1 = { angle: (lo1 + hi1) / 2, alpha: (hi1 - lo1) / 2 };

                                setJpw([
                                    { ...Jpw[0], ...seg0, sign: nodeOrder ? -1 : 1 },
                                    { ...Jpw[1], ...seg1, sign: nodeOrder ? 1 : -1 },
                                ]);
                            }}
                        />
                    </div>
                </div>

                {/* Plot */}
                <div className="flex flex-col gap-2">
                    <div className="">
                        <button
                            className={plotNum === plotTypes.potential ? "bg-secondary h-full p-2 rounded-lg" : "p-2 rounded-lg"}
                            onClick={() => setPlotNum(plotTypes.potential)}
                        >
                            Potential
                        </button>
                        <button
                            className={plotNum === plotTypes.electric ? "bg-secondary h-full p-2 rounded-lg" : "p-2 rounded-lg"}
                            onClick={() => setPlotNum(plotTypes.electric)}
                        >
                            Electric
                        </button>
                    </div>
                    <Plot
                        data={plotNum === plotTypes.potential ? potentialData : efieldData}
                        layout={{ ...sharedLayout, title: { text: plotNum === plotTypes.potential ? 'Potential field [V]' : '|E-field| [V/m]' } }}
                    />
                </div>
            </div>
            <Derivation>
                <p className="">
                    The coefficients are integrated over <InlineMath math="\theta"/> with the specified current density.
                    These coefficents are then set in the Fourier series. Which is calculated for the first 15 terms for a grid of points.
                    The electric field is then found by the potential field with the formula:
                </p>
                <BlockMath math="E = -\nabla\phi" />
            </Derivation>
        </div>
    );
}