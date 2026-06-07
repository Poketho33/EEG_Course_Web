import type { Data, PlotData } from 'plotly.js';

export type ExtendedData = Data | (Partial<PlotData> & { surfacecolor?: number[][] });

export enum plotTypes{
    potential,
    electric
};

export type parameters = {
    R: number;
    sigma: number; 
    I_tot: number; 
    posA: number[]; // [Theta, Phi] 
    posC: number[];
};