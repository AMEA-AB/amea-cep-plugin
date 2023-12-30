export default function closeDocument(name?: string) {
    const documents = app.documents;
    if(documents.length < 1) {
        throw "No documents open";
    }
    let document = documents[0];
    if(name) {
        for (let i = 0; i < documents.length; i++) {
            if (documents[i].name === name) {
                document = documents[i];
                break;
            }
        }
    }
    document.close();
}