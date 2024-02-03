/**
 * Closes a document in Adobe Illustrator. If a name is provided, it closes the document with that name. 
 * If no name is provided, it closes the currently active document.
 *
 * @param {string} [name] - The name of the document to close. If not provided, the currently active document is closed.
 * @throws {Error} If no document is found with the provided name or if there is no active document.
 */
export default function closeDocument(name?: string) {
    let document: Document | null = app.activeDocument;
    if(name) {
        const documents = app.documents;
        for (let i = 0; i < documents.length; i++) {
            if (documents[i].name === name) {
                document = documents[i];
                break;
            }
        }
    }
    if(!document) throw new Error('No document found');
    document.close();
}