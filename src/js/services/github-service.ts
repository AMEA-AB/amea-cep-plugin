import { os, fs, path as _path, https } from '../lib/cep/node';

export default new class GithubService {
    downloadFileFromGithub(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const githubOwner = process.env.GITHUB_OWNER!;
            const githubRepo = process.env.GITHUB_REPO!;
            const githubBranch = process.env.GITHUB_BRANCH!;
            const githubToken = process.env.GITHUB_TOKEN!;
            const urlPath = `/${githubOwner}/${githubRepo}/${githubBranch}/${path}`;

            const tempDir = os.tmpdir();
            const filePath = _path.join(tempDir, _path.basename(path));

            const fileStream = fs.createWriteStream(filePath);

            const options = {
                'method': 'GET',
                'hostname': 'raw.githubusercontent.com',
                'path': urlPath,
                'headers': {
                    'Accept': 'application/vnd.github.v4.raw',
                    'Authorization': `token ${githubToken}`
                },
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