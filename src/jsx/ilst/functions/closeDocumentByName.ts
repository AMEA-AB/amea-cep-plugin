export default function closeDocumentByName(name: string) {
    const documents = app.documents;
    for (let i = 0; i < documents.length; i++) {
        if (documents[i].name === name) {
            documents[i].close();
            break;
        }
    }
}