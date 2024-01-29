import { os, path as _path } from '../lib/cep/node';

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

    public getTempFolder(path = ''): string {
        return _path.join(os.tmpdir(), path);
    }
}