export interface RowData {
    "Order number": string;
    "Product": string;
    "Quantity": number;
    "Template": string;
    "Jig"?: string;
    "Ouput type": string;
    [key: string]: string;
}