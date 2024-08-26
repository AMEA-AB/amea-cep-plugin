import { fs, os, path as _path, crypto } from '../lib/cep/node';

/**
 * Service for handling folder operations.
 */
export default new class FolderService {

    /**
     * Gets the settings folder path based on the platform.
     * @returns {string} The path of the settings folder.
     */
    public getSettingsFolder(): string {
        const appName = "Spoties CEP"
        let settingsFolder;

        switch (process.platform) {
            case 'win32':
                settingsFolder = _path.join(os.homedir(), 'AppData', 'Roaming', appName);
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

    /**
     * Gets the desktop folder path.
     * @param {string} [path=''] - Optional path to append to the desktop folder path.
     * @returns {string} The path of the desktop folder.
     */
    public getDesktopFolder(path: string = ''): string {
        return _path.join(os.homedir(), 'Desktop', path);
    }

    /**
     * Gets a temporary folder path.
     * @returns {string} The path of the temporary folder.
     */
    public getTempFolder(): string {
        const folder = _path.join(os.tmpdir(), crypto.randomBytes(16).toString('hex'));
        if(fs.existsSync(folder)) {
            return this.getTempFolder();
        }
        return folder;
    }

    /**
     * Deletes a folder at a given path.
     * @param {string} path - The path of the folder to delete.
     */
    public deleteFolder(path: string) {
        fs.rmSync(path, { recursive: true, force: true });
    }
}