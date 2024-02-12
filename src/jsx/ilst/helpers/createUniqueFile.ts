/**
 * Creates a unique file in the specified folder.
 * If a file with the specified name already exists, a number is appended to the base filename until a unique filename is found.
 *
 * @param {Folder} folder - The folder to create the file in.
 * @param {string} filename - The desired filename.
 * @returns {File} - The created unique file.
 */
export default function createUniqueFile(folder: Folder, filename: string): File {
    const baseFilename = filename.split(".").shift();
    const extension = filename.split(".").pop();
    let outputFile = new File(folder + "/" + filename);
    let i = 2;
    while (outputFile.exists) {
        filename = baseFilename + " " + i + "." + extension;
        outputFile = new File(folder + "/" + filename);
        i++;
    }
    return outputFile;
}