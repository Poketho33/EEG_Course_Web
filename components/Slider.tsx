'use client'

import { useRef, useCallback } from 'react';

type ThumbKey = 'lo0' | 'hi0' | 'lo1' | 'hi1';

type RangeSliderProps = {
    min?: number;
    max?: number;
    values: [number, number, number, number]; // [lo0, hi0, lo1, hi1]
    onChange: (values: [number, number, number, number]) => void;
    format?: (v: number) => string;
};

const TX = 44, TW = 520;
const THUMB_R = 10;
const MIN_GAP = 0.05;
const LABEL_MIN_SEP = 86;

function valToX(v: number, min: number, max: number) {
    return TX + ((v - min) / (max - min)) * TW;
}

function xToVal(x: number, min: number, max: number) {
    return min + Math.max(0, Math.min(1, (x - TX) / TW)) * (max - min);
}

function fmtPi(v: number): string {
    const f = v / Math.PI;
    if (Math.abs(f) < 1e-9) return '0';
    return f.toFixed(2) + 'π';
}

function separateLabels(xs: number[]): number[] {
    const ys = [...xs];
    for (let iter = 0; iter < 10; iter++) {
        let moved = false;
        for (let i = 0; i < ys.length - 1; i++) {
            const gap = ys[i + 1] - ys[i];
            if (gap < LABEL_MIN_SEP) {
                const push = (LABEL_MIN_SEP - gap) / 2;
                ys[i] -= push;
                ys[i + 1] += push;
                moved = true;
            }
        }
        if (!moved) break;
    }
    return ys;
}

export default function RangeSlider({
    min = 0,
    max = 2 * Math.PI,
    values,
    onChange,
    format = fmtPi,
}: RangeSliderProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const dragging = useRef<ThumbKey | null>(null);

    const getSVGX = useCallback((e: React.PointerEvent) => {
        const pt = svgRef.current!.createSVGPoint();
        pt.x = e.clientX;
        return pt.matrixTransform(svgRef.current!.getScreenCTM()!.inverse()).x;
    }, []);

    const onPointerDown = (thumb: ThumbKey) => (e: React.PointerEvent) => {
        dragging.current = thumb;
        svgRef.current!.setPointerCapture(e.pointerId);
        e.stopPropagation();
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging.current) return;
        const v = xToVal(getSVGX(e), min, max);
        const [lo0, hi0, lo1, hi1] = values;

        const next: [number, number, number, number] = [lo0, hi0, lo1, hi1];
        switch (dragging.current) {
            case 'lo0': next[0] = Math.min(v, hi0 - MIN_GAP); break;
            case 'hi0': next[1] = Math.max(Math.min(v, lo1 - MIN_GAP), lo0 + MIN_GAP); break;
            case 'lo1': next[2] = Math.max(Math.min(v, hi1 - MIN_GAP), hi0 + MIN_GAP); break;
            case 'hi1': next[3] = Math.max(v, lo1 + MIN_GAP); break;
        }
        onChange(next);
    };

    const onPointerUp = () => { dragging.current = null; };

    const [lo0, hi0, lo1, hi1] = values;
    const xs = [lo0, hi0, lo1, hi1].map(v => valToX(v, min, max));
    const [xLo0, xHi0, xLo1, xHi1] = xs;

    // Separate label x positions to avoid overlap
    const labelXs = separateLabels([...xs]);
    const labelY = 76;

    const thumbs: { key: ThumbKey; cx: number; color: string; strokeW: number }[] = [
        { key: 'lo0', cx: xLo0, color: '#3b82f6', strokeW: 2 },
        { key: 'hi0', cx: xHi0, color: '#3b82f6', strokeW: 4 },
        { key: 'lo1', cx: xLo1, color: '#ef4444', strokeW: 2 },
        { key: 'hi1', cx: xHi1, color: '#ef4444', strokeW: 4 },
    ];

    return (
        <svg
            ref={svgRef}
            width="100%"
            viewBox="0 0 600 110"
            style={{ touchAction: 'none', overflow: 'visible' }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            {/* Track background */}
            <rect x={TX} y="34" width={TW} height="22" rx="6" className="fill-neutral-700" />

            {/* Filled range for piece 0 */}
            <rect x={xLo0} y="34" width={xHi0 - xLo0} height="22" rx="3" fill="#3b82f6" opacity="0.8" />

            {/* Filled range for piece 1 */}
            <rect x={xLo1} y="34" width={xHi1 - xLo1} height="22" rx="3" fill="#ef4444" opacity="0.8" />

            {/* Thumbs */}
            {thumbs.map(({ key, cx, color, strokeW }) => (
                <circle
                    key={key}
                    cx={cx} cy="44" r={THUMB_R}
                    stroke={color}
                    strokeWidth={strokeW}
                    className='cursor-e-resize fill-white'
                    onPointerDown={onPointerDown(key)}
                />
            ))}

            {/* Labels with leader lines if nudged */}
            {thumbs.map(({ key, cx, color }, i) => {
                const lx = labelXs[i];
                const nudged = Math.abs(lx - cx) > 2;
                return (
                    <g key={key}>
                        {nudged && (
                            <line
                                x1={cx} y1={56}
                                x2={lx} y2={labelY - 12}
                                stroke={color} strokeWidth="0.5" strokeDasharray="2 2"
                            />
                        )}
                        <text x={lx} y={labelY} textAnchor="middle"
                            className='text-3xl font-monospace'
                            fill={color}
                        >
                            {format(values[i])}
                        </text>
                    </g>
                );
            })}

            {/* Axis labels */}
            <text x={TX} y="96" textAnchor="middle" className="fill-lighter2 text-3xl">0</text>
            <text x={TX + TW / 2} y="96" textAnchor="middle" className="fill-lighter2 text-3xl">π</text>
            <text x={TX + TW} y="96" textAnchor="middle" className="fill-lighter2 text-3xl">2π</text>
        </svg>
    );
}