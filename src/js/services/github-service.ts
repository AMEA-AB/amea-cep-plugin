import { os, fs, path as _path, https } from '../lib/cep/node';

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

    public downloadFileFromRepo(path: string, filename?: string): Promise<string> {
        const urlPath = `/${this.githubOwner}/${this.githubRepo}/${this.githubBranch}/${path}`;
        return this.downloadFile(urlPath, filename);
    }

    public downloadFile(url: string, filename?: string): Promise<string> {
        return new Promise((resolve, reject) => {

            const tempDir = os.tmpdir();
            const filePath = _path.join(tempDir, filename ?? _path.basename(url));

            const fileStream = fs.createWriteStream(filePath);

            const options = {
                'method': 'GET',
                'hostname': 'raw.githubusercontent.com',
                'path': url,
                'headers': this.githubHeaders,
                'maxRedirects': 20
            };

            const req = https.request(options, (response) => {
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


}