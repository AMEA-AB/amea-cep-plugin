import { defineStore } from "pinia";
import { ref } from "vue";
import FolderService from "../services/folder-service";
import { path as _path } from "../lib/cep/node";

export interface Settings {
    outputFolder: string;
    templatesFolder: string;
    jigsFolder: string;

    useGithub: boolean;
    githubOwner: string;
    githubRepo: string;
    githubBranch: string;
    githubToken: string;

    advancedMode: boolean;
}

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings>({
        outputFolder: FolderService.getDesktopFolder('Bundles'),
        templatesFolder: FolderService.getDesktopFolder('Illustrator Assets/Templates'),
        jigsFolder: FolderService.getDesktopFolder('Illustrator Assets/Jigs'),
        useGithub: false,
        githubOwner: '',
        githubRepo: '',
        githubBranch: 'master',
        githubToken: '',
        advancedMode: false,
    });

    function updateSettings(updated: Partial<Settings>) {
        settings.value = { ...settings.value, ...updated };
    }

    return { settings, updateSettings }
}, {
    json: {
        path: _path.join(FolderService.getSettingsFolder(), 'settings.json')
    }
});