import BaseService from './base-service';

export default new class FileService extends BaseService {
    createUniqueFile(folder: string, filename: string): Promise<string> {
        return this.fetch<string>(`${this.baseUrl}/create-unique-file?folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(filename)}`);
    }

    downloadFile(url: string): Promise<string> {
        return this.fetch<string>(`${this.baseUrl}/download-file?url=${encodeURIComponent(url)}`);
    }
}