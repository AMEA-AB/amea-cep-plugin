import { RequestOptions } from 'https';
import { os, fs, path as _path, https, url as _url } from '../lib/cep/node';

/**
 * Service for handling file operations.
 */
export default new class FileService {

    /**
     * Downloads a file from a given URL.
     * @param {string} url - The URL of the file to download.
     * @param {RequestOptions} [options] - Optional request options.
     * @param {string} [filename] - Optional filename for the downloaded file.
     * @returns {Promise<string>} A promise that resolves to the path of the downloaded file.
     */
    public downloadFile(url: string, options?: RequestOptions, filename?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const urlObject = _url.parse(url);

            const tempDir = os.tmpdir();
            const filePath = _path.join(tempDir, filename ?? _path.basename(url));

            const fileStream = fs.createWriteStream(filePath);

            const _options: RequestOptions = {
                method: 'GET',
                hostname: urlObject.hostname,
                path: urlObject.path,
                ...options
            };

            const req = https.request(_options, (response) => {
                response.pipe(fileStream);
                fileStream.on('finish', function () {
                    fileStream.close();
                    resolve(filePath);
                });
            }).on('error', function (error) {
                fs.unlink(filePath, () => { });
                reject(error);
            });

            req.end();
        });
    }

    /**
     * Downloads multiple files from given URLs.
     * @param {string[]} urls - The URLs of the files to download.
     * @param {RequestOptions} [options] - Optional request options.
     * @returns {Promise<Record<string, string>>} A promise that resolves to a map of URLs to file paths.
     */
    public async downloadFiles(urls: string[], options?: RequestOptions): Promise<Record<string, string>> {
        const filePaths = await Promise.all(urls.map(url => this.downloadFile(url, options)));
        const urlToFilePaths: Record<string, string> = {};
        urls.forEach((url, index) => {
            urlToFilePaths[url] = filePaths[index];
        });
        return urlToFilePaths;
    }

    /**
     * Moves a file to a specified folder.
     * @param {string} sourceFile - The path of the file to move.
     * @param {string} destinationFolder - The destination folder.
     */
    public moveFileToFolder(sourceFile: string, destinationFolder: string) {
        fs.mkdirSync(destinationFolder, { recursive: true });
        const filename = _path.basename(sourceFile);
        const destination = _path.join(destinationFolder, filename);
        fs.renameSync(sourceFile, destination);
    }
}