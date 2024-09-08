/**
 * Opens a folder window in Finder/Explorer.
 *
 * @param {string} path - The path of the folder.
 */
export default function openFolder(path: string) {
    if(Folder(path).exists){
        Folder(path).execute();
    }
}