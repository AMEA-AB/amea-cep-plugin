import { path as _path, https } from '../lib/cep/node';
import FileService from './file-service';
import { useSettingsStore, Settings } from '../store/settings-store';

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

/**
 * Service for handling Github operations.
 */
export default new class GithubService {

    /**
     * Gets the settings from the settings store.
     * @returns {Settings} The settings.
     */
    private get settings(): Settings {
        return useSettingsStore().settings;
    }

    /**
     * Gets the Github owner from the settings.
     * @returns {string} The Github owner.
     */
    private get githubOwner(): string {
        return this.settings.githubOwner;
    }

    /**
     * Gets the Github repository from the settings.
     * @returns {string} The Github repository.
     */
    private get githubRepo(): string {
        return this.settings.githubRepo;
    }

    /**
     * Gets the Github branch from the settings.
     * @returns {string} The Github branch.
     */
    private get githubBranch(): string {
        return this.settings.githubBranch;
    }

    /**
     * Gets the Github token from the settings.
     * @returns {string} The Github token.
     */
    private get githubToken(): string {
        return this.settings.githubToken;
    }

    /**
     * Gets the headers for Github requests.
     * @returns {Object} The headers.
     */
    private get githubHeaders() {
        return {
            'Accept': 'application/vnd.github.v4.raw',
            'Authorization': `token ${this.githubToken}`,
            'User-Agent': 'Node.js'
        }
    }

    /**
     * Gets the URL for a file on Github.
     * @param {string} path - The path of the file.
     * @returns {string} The URL of the file.
     */
    public getGithubFileUrl(path: string): string {
        return `https://raw.githubusercontent.com/${this.githubOwner}/${this.githubRepo}/${this.githubBranch}/${path}`
    }

    /**
     * Gets the names of files in a folder on Github.
     * @param {string} path - The path of the folder.
     * @param {string[]} [extension] - Optional array of file extensions to filter by.
     * @returns {Promise<GithubFile[]>} A promise that resolves to an array of GithubFile objects.
     */
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

    /**
     * Downloads a file from Github.
     * @param {GithubFile} file - The GithubFile object representing the file to download.
     * @returns {Promise<string>} A promise that resolves to the path of the downloaded file.
     */
    public downloadGithubFile(file: GithubFile): Promise<string> {
        return this.downloadFile(file.download_url, file.name);
    }

    /**
     * Downloads a file from a given URL.
     * @param {string} url - The URL of the file to download.
     * @param {string} [filename] - Optional filename for the downloaded file.
     * @returns {Promise<string>} A promise that resolves to the path of the downloaded file.
     */
    public downloadFile(url: string, filename?: string): Promise<string> {
        const options = {
            'headers': this.githubHeaders
        };
        return FileService.downloadFile(url, options, filename);
    }

    /**
     * Downloads multiple files from given URLs.
     * @param {string[]} urls - The URLs of the files to download.
     * @returns {Promise<{ [url: string]: string }>} A promise that resolves to a map of URLs to file paths.
     */
    public downloadFiles(urls: string[]): Promise<{ [url: string]: string; }> {
        const options = {
            'headers': this.githubHeaders
        };
        return FileService.downloadFiles(urls, options);
    }
}