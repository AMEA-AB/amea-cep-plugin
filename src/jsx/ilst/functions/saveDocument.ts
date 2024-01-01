import _saveDocument from "../helpers/saveDocument";

export default function saveDocument(outputPath?: string): string {
    const doc = app.activeDocument;
    const file = outputPath ? new File(outputPath) : undefined;
    const outputFile = _saveDocument(doc, file);
    return outputFile.fsName;
}