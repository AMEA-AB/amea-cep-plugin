import { defineStore } from "pinia";
import { ref } from "vue";

interface Settings {
    outputFolder?: string;

    githubOwner: string;
    githubRepo: string;
    githubBranch: string;
    githubToken: string;

    advancedMode: boolean;
}

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Settings>({
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
}, { persist: true });