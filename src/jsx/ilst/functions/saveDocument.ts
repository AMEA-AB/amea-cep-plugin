import _saveDocument from "../helpers/saveDocument";

export default function saveDocument(outputPath: string) {
    const doc = app.activeDocument;
    const file = File(outputPath);
    _saveDocument(doc, file);
}