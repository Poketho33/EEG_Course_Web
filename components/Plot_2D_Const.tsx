'use client'
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Data } from 'plotly.js';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type J_Piece = {
    angle: number;
    alpha: number;
    amplitude: number;
};

export default function App() {
    // Helper functions //
    const linspace = (start: number, stop: number, n: number) =>
        Array.from({ length: n }, (_, i) => start + (i * (stop - start)) / (n - 1));

    const toLatexPi = (val: number): string => {
        const frac = val / Math.PI;
        if (Math.abs(frac) < 1e-9) return '0';
        if (Math.abs(frac - 1) < 1e-9) return '\\pi';
        if (Math.abs(frac + 1) < 1e-9) return '-\\pi';

        // try common fractions
        for (const denom of [2, 3, 4, 6, 8]) {
            const numer = Math.round(frac * denom);
            if (Math.abs(numer / denom - frac) < 1e-9) {
                if (numer === 1) return `\\frac{\\pi}{${denom}}`;
                if (numer === -1) return `-\\frac{\\pi}{${denom}}`;
                return `\\frac{${numer}\\pi}{${denom}}`;
            }
        }

        // fallback to decimal
        return val.toFixed(2);
    };

    // Parameters
    let R = 0.01, sigma  = 0.33, I_tot = 1e-3, alpha = 0.2, J0 = I_tot / (2 * alpha * R); 

    // Use States / Memos
    const [editingCell, setEditingCell] = useState<{ i: number; field: keyof J_Piece } | null>(null);

    const [Jpw, setJpw] = useState<J_Piece[]>([
        { amplitude: J0, angle: 0 * Math.PI / 2, alpha: 0.2 },
        { amplitude: -J0, angle: Math.PI, alpha: 0.2 },
    ]);

    const katexString = useMemo(() => {
        const cases = Jpw.map(p => {
            const angle = toLatexPi(p.angle);
            const alpha = toLatexPi(p.alpha);
            const amp = p.amplitude > 0 ? 'J_0' : '-J_0';
            return `${amp} & ${angle} - ${alpha} < \\theta < ${angle} + ${alpha}`;
        }).join(' \\\\ ');

        return `J(\\theta) = \\begin{cases} ${cases} \\\\ 0 & \\text{otherwise} \\end{cases}`;
    }, [Jpw]);

    const updatePiece = (index: number, field: keyof J_Piece, value: number) => {
        setJpw(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    };

    const addPiece = () => {
        setJpw(prev => [...prev, { amplitude: J0, angle: 0, alpha: 0.2 }]);
    };

    const removePiece = (index: number) => {
        setJpw(prev => prev.filter((_, i) => i !== index));
    };
    
    let Ngrid = 300;

    const x = linspace(-R, R, Ngrid);
    const y = [...x];
    const z: number[][] = Array.from({ length: Ngrid }, () => new Array(Ngrid).fill(0));

    // circle mask
    for (let i = 0; i < Ngrid; i++)
        for (let j = 0; j < Ngrid; j++)
            if (Math.sqrt(x[i] ** 2 + y[j] ** 2) > R) z[j][i] = NaN;


    // solve first n elements of the Fourier
    for (let n = 1; n < 50; n++) {
        let Cn = R * J0 / (sigma * n ** 2 * Math.PI);

        let sinCoeff = 0; // multiplies cos(n * th_grid)
        let cosCoeff = 0; // multiplies sin(n * th_grid)

        for (const piece of Jpw) {
            const sign = piece.amplitude > 0 ? 1 : -1;
            sinCoeff += sign * (Math.sin(n * (piece.angle + piece.alpha)) - Math.sin(n * (piece.angle - piece.alpha)));
            cosCoeff += sign * (-Math.cos(n * (piece.angle + piece.alpha)) + Math.cos(n * (piece.angle - piece.alpha)));
        }

        for (let i = 0; i < Ngrid; i++) {
            for (let j = 0; j < Ngrid; j++) {
                if (Number.isNaN(z[j][i])) continue;
                const r_grid = Math.sqrt(x[i] ** 2 + y[j] ** 2);
                const th_grid = Math.atan2(y[j], x[i]);
                z[j][i] += Cn * (r_grid / R) ** n * (
                    sinCoeff * Math.cos(n * th_grid) +
                    cosCoeff * Math.sin(n * th_grid)
                );
            }
        }
    }

    const data: Data[] = [{ 
        z, x, y, 
        type: 'contour',
        // matlab colorscale, otherwise can also use ~colorscale: 'Hot'~
        colorscale: [
            [0, '#000000'],
            [0.365, '#ff0000'],
            [0.746, '#ffff00'],
            [1, '#ffffff'],
        ],
        zsmooth: 'best',
        line: { width: 0 },
        contours: {
            coloring: 'heatmap',
            showlines: false,
        }
    }];

    return (
        <div className="flex justify-between items-center px-16 bg-lighter rounded-xl">
            <BlockMath math={katexString} />
            <Plot
                data={data}
                layout={{
                    width: 420,
                    height: 420,
                    title: { text: 'Potential field' },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                }}
            />
        </div>
    );
}


{/* <div className="flex items-center gap-2">
    <InlineMath math={`\\left\\{ \\phantom{\\begin{array}{l} ${Jpw.map(() => 'X \\\\ ').join('')} X \\end{array}} \\right.`} />

    <div className="flex flex-col gap-1">
        {Jpw.map((p, i) => (
            <div key={i} className="flex items-center gap-1">
                {editingCell?.i === i && editingCell?.field === 'amplitude' ? (
                    <input autoFocus type="number" defaultValue={p.amplitude} step={0.1}
                        onBlur={e => { updatePiece(i, 'amplitude', +e.target.value); setEditingCell(null); }}
                        className="w-20 border rounded px-1" />
                ) : (
                    <span className="cursor-pointer underline decoration-dotted" onClick={() => setEditingCell({ i, field: 'amplitude' })}>
                        <InlineMath math={p.amplitude > 0 ? 'J_0' : '-J_0'} />
                    </span>
                )}

                <InlineMath math={`\\text{ if }`} />

                {editingCell?.i === i && editingCell?.field === 'angle' ? (
                    <input autoFocus type="number" defaultValue={p.angle} step={0.1}
                        onBlur={e => { updatePiece(i, 'angle', +e.target.value); setEditingCell(null); }}
                        className="w-20 border rounded px-1" />
                ) : (
                    <span className="cursor-pointer underline decoration-dotted" onClick={() => setEditingCell({ i, field: 'angle' })}>
                        <InlineMath math={toLatexPi(p.angle)} />
                    </span>
                )}

                <InlineMath math={`- `} />

                {editingCell?.i === i && editingCell?.field === 'alpha' ? (
                    <input autoFocus type="number" defaultValue={p.alpha} step={0.05}
                        onBlur={e => { updatePiece(i, 'alpha', +e.target.value); setEditingCell(null); }}
                        className="w-20 border rounded px-1" />
                ) : (
                    <span className="cursor-pointer underline decoration-dotted" onClick={() => setEditingCell({ i, field: 'alpha' })}>
                        <InlineMath math={toLatexPi(p.alpha)} />
                    </span>
                )}

                <InlineMath math={`< \\theta < `} />

                <InlineMath math={toLatexPi(p.angle)} />
                <InlineMath math={`+`} />
                <InlineMath math={toLatexPi(p.alpha)} />

                <button onClick={() => removePiece(i)} className="ml-2 text-red-400 text-xs">✕</button>
            </div>
        ))}
        <div className="flex items-center gap-1">
            <InlineMath math={`0 \\text{ otherwise}`} />
        </div>
    </div>
</div> */}