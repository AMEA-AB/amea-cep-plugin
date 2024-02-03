import type { TemplateFlags } from './shared';

export type OutputType = 'pdf' | 'ai' | 'svg';

export type TemplateFlag = typeof TemplateFlags[number];

export interface RowData {
    "Output name": string;
    "Template": string;
    "Output type": OutputType;
    "Jig"?: string;
    "Flags"?: TemplateFlag[];
    [key: string]: string;
}

interface RowDataExcel extends RowData {
    "Quantity": number;
}

export interface RowDataExcelRaw extends Omit<RowDataExcel, 'Flags'> {
    Flags?: string;
}