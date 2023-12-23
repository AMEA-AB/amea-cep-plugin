import { os, fs, path as _path, https } from '../lib/cep/node';

interface GithubFile {
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

    public getFileNamesInFolder(path: string, extension?: string[]): Promise<string[]> {
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
                    const fileNames = response
                        .filter((content: any) => content.type === 'file' && (!extension || content.name.endsWith(`.${extension}`)))
                        .map((content: any) => content.name);
                    resolve(fileNames);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }

    public downloadFile(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const urlPath = `/${this.githubOwner}/${this.githubRepo}/${this.githubBranch}/${path}`;

            const tempDir = os.tmpdir();
            const filePath = _path.join(tempDir, _path.basename(path));

            const fileStream = fs.createWriteStream(filePath);

            const options = {
                'method': 'GET',
                'hostname': 'raw.githubusercontent.com',
                'path': urlPath,
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