export default function downloadFile(url: string): File {
    const filenameRegex = /.*\/(.*)/g;
    const filename = filenameRegex.exec(url)![1];
    const file = new File(Folder.temp + "/" + filename);
    if (file.exists) {
        file.remove();
    }
    JSXGetURL().get(url, file.fsName);
    
    if (!file.exists) {
        throw new Error("Could not download file " + url);
    }
    return file;
}