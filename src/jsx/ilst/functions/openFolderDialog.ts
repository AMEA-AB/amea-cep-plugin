export default function openFolderDialog(title: string): string | undefined {
    const folder = Folder.selectDialog(title);
    if (!folder) {
        return undefined;
    }
    return folder.fsName;
}