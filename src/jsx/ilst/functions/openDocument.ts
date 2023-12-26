export default function openDocument(path: string) {
    const file = new File(path);
    if (file.exists) {
        app.open(file);
        return true;
    }
    return false;
}