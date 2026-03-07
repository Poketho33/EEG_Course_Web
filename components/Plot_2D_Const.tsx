'use client'
import dynamic from 'next/dynamic';
import type { Data } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function App() {
    // Parameters
    let R = 0.01, sigma  = 0.33, I_tot = 2e-3, alpha = 0.2, J0 = I_tot / (2 * alpha * R); 

    // Helper functions
    const linspace = (start: number, stop: number, n: number) =>
        Array.from({ length: n }, (_, i) => start + (i * (stop - start)) / (n - 1));
    
    let Ngrid = 300;

    const x = linspace(-R, R, Ngrid);
    const y = [...x];
    const z: number[][] = Array.from({ length: Ngrid }, () => new Array(Ngrid));

    for (let i = 0; i < Ngrid; i++) {
        for (let j = 0; j < Ngrid; j++) {
            const r_grid = Math.sqrt(x[i] ** 2 + y[j] ** 2);
            const th_grid = Math.atan2(y[j], x[i]);
            if (r_grid > R) {
                z[j][i] = NaN;
            } else {
                z[j][i] = 0; // phi_0 reference set to 0
                // solve first k elements of the Fourier
                for(let k = 1; k < 100; k++){
                    let n = 2 * k - 1; 
                    let Cn = 4 * R * J0 * Math.sin(n * alpha) / (sigma * n ** 2 * Math.PI);;
                    z[j][i] += Cn * (r_grid / R) ** n * Math.cos(n * th_grid);
                }
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
        <Plot
            data={data}
            layout={{
                width: 420,
                height: 420,
                title: { text: 'A Fancy Plot' },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
            }}
        />
    );
}