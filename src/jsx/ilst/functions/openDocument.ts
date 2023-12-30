export default function openDocument(path: string): string | undefined {
    const file = new File(path);
    if (file.exists) {
        const doc = app.open(file);
        return doc.name;
    }
    return undefined;
}