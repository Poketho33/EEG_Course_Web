import type { Data, PlotData } from 'plotly.js';

export type ExtendedData = Data | (Partial<PlotData> & { surfacecolor?: number[][] });