function arrayContains(array: string[], value: string): boolean {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
            return true;
        }
    }
    return false;
}

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

function createFilterForMac(filetypes: string[]) {
    return function(file: File) {
        if (file instanceof Folder) return true;
        try {
            const index = file.name.lastIndexOf(".");
            const ext = file.name.substring(index + 1);
            return arrayContains(filetypes, ext);
        } catch (e) {
            return false;
        }
    };
}

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

export function openFileDialogSingle(title: string, filetypes: string[] = []): string | undefined {
    const filter = getFilter(filetypes);
    const file = File.openDialog(title, filter, false);
    if(!file) {
        return undefined;
    }
    return file.fsName;
}

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