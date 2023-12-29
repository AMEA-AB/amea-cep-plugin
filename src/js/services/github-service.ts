import { path as _path, https } from '../lib/cep/node';
import FileService from './file-service';

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
    private get githubOwner(): string {
        return process.env.GITHUB_OWNER!;
    }

    private get githubRepo(): string {
        return process.env.GITHUB_REPO!;
    }

    private get githubBranch(): string {
        return process.env.GITHUB_BRANCH!;
    }

    private get githubToken(): string {
        return process.env.GITHUB_TOKEN!;
    }

    private get githubHeaders() {
        return {
            'Accept': 'application/vnd.github.v4.raw',
            'Authorization': `token ${this.githubToken}`,
            'User-Agent': 'Node.js'
        }
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
}