import { os, fs, path, https } from '../lib/cep/node';

export default new class FileService {
    downloadFile(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const tempDir = os.tmpdir();
            const filePath = path.join(tempDir, path.basename(url));
    
            const fileStream = fs.createWriteStream(filePath);
    
            https.get(url, response => {
                response.pipe(fileStream);
    
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(filePath);
                });
            }).on('error', err => {
                fs.unlink(filePath, () => { });
                reject(`Error downloading file: ${err.message}`);
            });
        });
    }
}