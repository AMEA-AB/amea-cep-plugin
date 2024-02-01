export type TemplateFlag = 'mirror-horizontally' | 'mirror-vertically';

export interface RowData {
    "Order number": string;
    "Quantity": number;
    "Template": string;
    "Ouput type": string;
    "Jig"?: string;
    "Flags"?: TemplateFlag[];
    [key: string]: string;
}

export interface RowDataRaw extends Omit<RowData, 'Flags'> {
    Flags?: string;
}