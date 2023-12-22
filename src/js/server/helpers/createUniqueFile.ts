import { fs, path } from '../../lib/cep/node';

export default function createUniqueFile(folder: string, filename: string) {
    const baseFilename = filename.split(".").shift();
    const extension = filename.split(".").pop();
    var outputFile = path.join(folder, filename);
    var i = 2;
    while (fs.existsSync(outputFile)) {
        filename = `${baseFilename} ${i}.${extension}`;
        outputFile = path.join(folder, filename);
        i++;
    }
    return outputFile;
}