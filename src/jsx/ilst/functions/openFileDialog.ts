import { includes } from "../../utils/utils";

/**
 * Creates a filter string for Windows file dialog.
 *
 * @param {string[]} filetypes - The file types to include in the filter.
 * @returns {string} - The filter string.
 */
function createFilterForWindows(filetypes: string[]): string {
    let filter = '';
    for (var i = 0; i < filetypes.length; i++) {
        filter += '*.' + filetypes[i];
        if (i < filetypes.length - 1) {
            filter += ';';
        }
    }
    return filter;
}

/**
 * Creates a filter function for Mac file dialog.
 *
 * @param {string[]} filetypes - The file types to include in the filter.
 * @returns {Function} - The filter function.
 */
function createFilterForMac(filetypes: string[]): (file: File) => boolean {
    return function(file: File) {
        if (file instanceof Folder) return true;
        try {
            const index = file.name.lastIndexOf(".");
            const ext = file.name.substring(index + 1);
            return includes(filetypes, ext);
        } catch (e) {
            return false;
        }
    };
}

/**
 * Gets the appropriate filter for the current OS.
 *
 * @param {string[]} filetypes - The file types to include in the filter.
 * @returns {string | undefined | Function} - The filter for the current OS.
 */
function getFilter (filetypes: string[]): string | undefined | ((file: File) => boolean) {
    if(filetypes.length === 0) {
        return undefined;
    }
    if ($.os.indexOf('Windows') !== -1) {
        return createFilterForWindows(filetypes);
    } else {
        return createFilterForMac(filetypes);
    }
}

/**
 * Opens a file dialog to select a single file.
 *
 * @param {string} title - The title of the dialog.
 * @param {string[]} [filetypes=[]] - The file types to include in the filter.
 * @returns {string | undefined} - The selected file's path, or undefined if no file was selected.
 */
export function openFileDialogSingle(title: string, filetypes: string[] = []): string | undefined {
    const filter = getFilter(filetypes);
    const file = File.openDialog(title, filter, false);
    if(!file) {
        return undefined;
    }
    return file.fsName;
}

/**
 * Opens a file dialog to select multiple files.
 *
 * @param {string} title - The title of the dialog.
 * @param {string[]} [filetypes=[]] - The file types to include in the filter.
 * @returns {string[]} - The selected files' paths, or an empty array if no files were selected.
 */
export function openFileDialogMultiple(title: string, filetypes: string[] = []): string[] {
    const filter = getFilter(filetypes);
    const files = File.openDialog(title, filter, true);
    if (!files) {
        return [];
    }
    const filesArray = Array.prototype.slice.call(files) as File[]; // Convert FileList to array
    var filePaths = [];
    for (var i = 0; i < filesArray.length; i++) {
        filePaths.push(filesArray[i].fsName);
    }
    return filePaths;
}