import { RequestOptions } from 'https';
import { os, fs, path as _path, https, url as _url } from '../lib/cep/node';

export default new class FileService {
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

    public async downloadFiles(urls: string[], options?: RequestOptions): Promise<{ [url: string]: string }> {
        const filePaths = await Promise.all(urls.map(url_1 => this.downloadFile(url_1, options)));
        const urlToFilePaths: { [url_3: string]: string; } = {};
        urls.forEach((url_4, index) => {
            urlToFilePaths[url_4] = filePaths[index];
        });
        return urlToFilePaths;
    }

    public moveFileToFolder(source: string, destinationFolder: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const filename = _path.basename(source);
            const destination = _path.join(destinationFolder, filename);
            fs.rename(source, destination, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}