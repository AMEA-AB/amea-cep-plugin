export type TemplateFlag = 
    'mirror-horizontally' |
    'mirror-vertically' |
    'rotate-clockwise' |
    'rotate-counter-clockwise';

export interface RowData {
    "Output name": string;
    "Template": string;
    "Ouput type": string;
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