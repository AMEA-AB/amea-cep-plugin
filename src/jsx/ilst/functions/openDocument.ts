/**
 * Opens a document at the specified path.
 * If the file exists, it is opened and the name of the document is returned.
 * If the file does not exist, undefined is returned.
 *
 * @param {string} path - The path to the document to open.
 * @returns {string | undefined} - The name of the opened document, or undefined if the file does not exist.
 */
export default function openDocument(path: string): string | undefined {
    const file = new File(path);
    if (file.exists) {
        const doc = app.open(file);
        return doc.name;
    }
    return undefined;
}