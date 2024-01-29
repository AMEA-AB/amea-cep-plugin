import { fs, os, path as _path, crypto } from '../lib/cep/node';

export default new class FolderService {
    public getSettingsFolder(): string {
        const appName = "AMEA CEP"
        let settingsFolder;

        switch (process.platform) {
            case 'win32':
                settingsFolder = _path.join(process.env.APPDATA!, appName);
                break;
            case 'darwin':
                settingsFolder = _path.join(os.homedir(), 'Library', 'Application Support', appName);
                break;
            default:
                settingsFolder = _path.join(os.homedir(), '.config', appName);
                break;
        }
        return settingsFolder;
    }

    public getDesktopFolder(path = ''): string {
        return _path.join(os.homedir(), 'Desktop', path);
    }

    public getTempFolder(): string {
        const folder = _path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex'));
        if(fs.existsSync(folder)) {
            return this.getTempFolder();
        }
        return folder;
    }

    public deleteFolder(path: string) {
        fs.rmSync(path, { recursive: true, force: true });
    }
}