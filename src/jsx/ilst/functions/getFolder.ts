interface Options {
    path?: string;
    createIfNotExists?: boolean;
}

function getFolder(baseFolder: Folder, options: Options = {}): Folder {
    let folder = baseFolder;
    if(options.path) {
        folder = new Folder(folder + '/' + options.path);
    }
    if(options.createIfNotExists && !folder.exists) {
        folder.create();
    }
    return folder;
}

export function getTempFolder(options: Options = {}): string {
    const folder = getFolder(Folder.temp, options);
    return folder.fsName;
}

export function getDesktopFolder(options: Options = {}): string {
    const folder = getFolder(Folder.desktop, options);
    return folder.fsName;
}
