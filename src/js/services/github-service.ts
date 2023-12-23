import BaseService from './base-service';

export default new class FileService extends BaseService {
    downloadFile(path: string): Promise<string> {
        return this.fetch<string>(`${this.baseUrl}/github/file/download?path=${path}`);
    }
}