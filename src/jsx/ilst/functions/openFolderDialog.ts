/**
 * Opens a folder selection dialog.
 * If a folder is selected, its path is returned.
 * If no folder is selected, undefined is returned.
 *
 * @param {string} title - The title of the dialog.
 * @returns {string | undefined} - The selected folder's path, or undefined if no folder was selected.
 */
export default function openFolderDialog(title: string): string | undefined {
    const folder = Folder.selectDialog(title);
    if (!folder) {
        return undefined;
    }
    return folder.fsName;
}