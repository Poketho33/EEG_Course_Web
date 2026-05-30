// Math functions not included in Math.JS

// linspace
export const linspace = (start: number, stop: number, n: number) =>
    Array.from({ length: n }, (_, i) => start + (i * (stop - start)) / (n - 1));