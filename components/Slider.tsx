import { useRef, useState, useCallback } from 'react';

type RangeSliderProps = {
    min?: number;
    max?: number;
    lo: number;
    hi: number;
    onChange: (lo: number, hi: number) => void;
    format?: (v: number) => string;
};

const TX = 40, TW = 520;

function valToX(v: number, min: number, max: number) {
    return TX + ((v - min) / (max - min)) * TW;
}

function xToVal(x: number, min: number, max: number) {
    return min + Math.max(0, Math.min(1, (x - TX) / TW)) * (max - min);
}

function fmtPi(v: number): string {
    const f = v / Math.PI;
    if (Math.abs(f) < 1e-9) return '0';
    if (Math.abs(f - 1) < 1e-9) return 'π';
    if (Math.abs(f - 2) < 1e-9) return '2π';
    if (Math.abs(f - 0.5) < 1e-9) return 'π/2';
    if (Math.abs(f - 1.5) < 1e-9) return '3π/2';
    return f.toFixed(2) + 'π';
}

export default function RangeSlider({
    min = 0,
    max = 2 * Math.PI,
    lo,
    hi,
    onChange,
    format = fmtPi,
}: RangeSliderProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const dragging = useRef<'lo' | 'hi' | null>(null);

    const getSVGX = useCallback((e: React.PointerEvent) => {
        const pt = svgRef.current!.createSVGPoint();
        pt.x = e.clientX;
        return pt.matrixTransform(svgRef.current!.getScreenCTM()!.inverse()).x;
    }, []);

    const onPointerDown = (thumb: 'lo' | 'hi') => (e: React.PointerEvent) => {
        dragging.current = thumb;
        svgRef.current!.setPointerCapture(e.pointerId);
        e.stopPropagation();
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging.current) return;
        const v = xToVal(getSVGX(e), min, max);
        if (dragging.current === 'lo') onChange(Math.min(v, hi - 0.05), hi);
        if (dragging.current === 'hi') onChange(lo, Math.max(v, lo + 0.05));
    };

    const onPointerUp = () => { dragging.current = null; };

    const xLo = valToX(lo, min, max);
    const xHi = valToX(hi, min, max);

    return (
        <svg
            ref={svgRef}
            width="100%"
            viewBox="0 0 600 100"
            style={{ touchAction: 'none', overflow: 'visible' }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            {/* Track background */}
            <rect x={TX} y="34" width={TW} height="12" rx="6"
                className="fill-neutral-200 dark:fill-neutral-700" />

            {/* Track fill */}
            <rect x={xLo} y="34" width={xHi - xLo} height="12" rx="6"
                className="fill-blue-500" />

            {/* Lo thumb */}
            <circle
                cx={xLo} cy="40" r="10"
                className="fill-white stroke-blue-500 cursor-ew-resize"
                strokeWidth="2"
                onPointerDown={onPointerDown('lo')}
            />

            {/* Hi thumb */}
            <circle
                cx={xHi} cy="40" r="10"
                className="fill-white stroke-blue-500 cursor-ew-resize"
                strokeWidth="2"
                onPointerDown={onPointerDown('hi')}
            />

            {/* Labels */}
            <text x={xLo} y="72" textAnchor="middle"
                className="fill-neutral-500 text-xs font-mono">
                {format(lo)}
            </text>
            <text x={xHi} y="72" textAnchor="middle"
                className="fill-neutral-500 text-xs font-mono">
                {format(hi)}
            </text>

            {/* Axis labels */}
            <text x={TX} y="92" textAnchor="middle" className="fill-neutral-400 text-xs">0</text>
            <text x={TX + TW / 2} y="92" textAnchor="middle" className="fill-neutral-400 text-xs">π</text>
            <text x={TX + TW} y="92" textAnchor="middle" className="fill-neutral-400 text-xs">2π</text>
        </svg>
    );
}