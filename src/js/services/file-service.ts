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

    public downloadFiles(urls: string[], options?: RequestOptions): Promise<{ [url: string]: string }> {
        return Promise.all(urls.map(url => this.downloadFile(url, options))).then(filePaths => {
            const urlToFilePaths: { [url: string]: string } = {};
            urls.forEach((url, index) => {
                urlToFilePaths[url] = filePaths[index];
            });
            return urlToFilePaths;
        });
        
    }
}