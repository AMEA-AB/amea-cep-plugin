import { path as _path, https } from '../lib/cep/node';
import FileService from './file-service';
import { useSettingsStore } from '../store';

export interface GithubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    _links: {
        self: string;
        git: string;
        html: string;
    };
}

export default new class GithubService {

    private get settings() {
        return useSettingsStore().settings;
    }

    private get githubOwner(): string {
        return this.settings.githubOwner;
    }

    private get githubRepo(): string {
        return this.settings.githubRepo;
    }

    private get githubBranch(): string {
        return this.settings.githubBranch;
    }

    private get githubToken(): string {
        return this.settings.githubToken;
    }

    private get githubHeaders() {
        return {
            'Accept': 'application/vnd.github.v4.raw',
            'Authorization': `token ${this.githubToken}`,
            'User-Agent': 'Node.js'
        }
    }

    public getGithubFileUrl(path: string): string {
        return `https://raw.githubusercontent.com/${this.githubOwner}/${this.githubRepo}/${this.githubBranch}/${path}`
    }

    public getFileNamesInFolder(path: string, extension?: string[]): Promise<GithubFile[]> {
        return new Promise((resolve, reject) => {
            const urlPath = `/repos/${this.githubOwner}/${this.githubRepo}/contents/${path}?ref=${this.githubBranch}`;

            const options = {
                'method': 'GET',
                'hostname': 'api.github.com',
                'path': urlPath,
                'headers': this.githubHeaders
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const response = JSON.parse(data) as GithubFile[];
                    const files = response
                        .filter((content: any) => content.type === 'file' && (!extension || content.name.endsWith(`.${extension}`)));
                    resolve(files);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }

    public downloadGithubFile(file: GithubFile): Promise<string> {
        return this.downloadFile(file.download_url, file.name);
    }

    public downloadFile(url: string, filename?: string): Promise<string> {
        const options = {
            'headers': this.githubHeaders
        };
        return FileService.downloadFile(url, options, filename);
    }

    public downloadFiles(urls: string[]) {
        const options = {
            'headers': this.githubHeaders
        };
        return FileService.downloadFiles(urls, options);
    }
}