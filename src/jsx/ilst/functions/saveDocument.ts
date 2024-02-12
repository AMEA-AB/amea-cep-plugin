import _saveDocument from "../helpers/saveDocument";

/**
 * Saves the active document to the specified output path.
 * If no output path is provided, the document is saved to a temporary file.
 *
 * @param {string} [outputPath] - The path to save the document to.
 * @returns {string} - The path where the document was saved.
 */
export default function saveDocument(outputPath?: string): string {
    const doc = app.activeDocument;
    const file = outputPath ? new File(outputPath) : undefined;
    const outputFile = _saveDocument(doc, file);
    return outputFile.fsName;
}