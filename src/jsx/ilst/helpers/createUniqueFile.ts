export default function createUniqueFile(folder: Folder, filename: string) {
    const baseFilename = filename.split(".").shift();
    const extension = filename.split(".").pop();
    var outputFile = new File(folder + "/" + filename);
    var i = 2;
    while (outputFile.exists) {
        filename = baseFilename + " " + i + "." + extension;
        outputFile = new File(folder + "/" + filename);
        i++;
    }
    return outputFile;
}