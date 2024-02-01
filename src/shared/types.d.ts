export type TemplateFlag = 
    'mirror-horizontally' |
    'mirror-vertically' |
    'rotate-clockwise' |
    'rotate-counter-clockwise';

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