<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import GithubService from '../../services/github-service';
import FolderService from '../../services/folder-service';
import FileInputSingle from '../../components/FileInputSingle.vue';
import FileInputMultiple from '../../components/FileInputMultiple.vue';
import { evalTS } from '../../lib/utils/bolt';
import { useSettingsStore } from '../../store/settings-store';

const props = defineProps({
    showJigSelect: {
        type: Boolean,
        default: () => true
    },
});

const jigs = ref<string[]>([]);
const selectedJig = ref<string | undefined>(undefined);
const selectedJigFile = ref<string | undefined>(undefined);
const selectedFiles = ref<string[]>([]);

onMounted(async () => {
    if (props.showJigSelect) {
        await populateJigSelect();
    }
});

watch(props, (newProps, oldProps) => {
    if (newProps.showJigSelect !== oldProps.showJigSelect) {
        selectedJig.value = undefined;
        selectedJigFile.value = undefined;
        if (newProps.showJigSelect === true) {
            populateJigSelect();
        }
    }
});

const populateJigSelect = async () => {
    const settingsStore = useSettingsStore();
    if (settingsStore.settings.useGithub) {
        jigs.value = (await GithubService.getFilenamesInFolder('jigs'), ['pdf', 'ai']);
    } else {
        jigs.value = FolderService.getFilesInFolder(settingsStore.settings.jigsFolder, ['pdf', 'ai']);
    }
}

const populateJig = async () => {
    let jigPath = selectedJigFile.value;
    if (selectedJig.value) {
        const settingsStore = useSettingsStore();
        jigPath = `${settingsStore.settings.jigsFolder}/${selectedJig.value}`;
        if (settingsStore.settings.useGithub) {
            jigPath = await GithubService.downloadFile(GithubService.getGithubFileUrl(`jigs/${selectedJig.value}`));
        }
    }
    if (jigPath && selectedFiles.value.length > 0) {
        const settingsStore = useSettingsStore();
        const outputFolder = settingsStore.settings.outputFolder;
        await evalTS('populateJig', jigPath, selectedFiles.value, outputFolder);
        selectedFiles.value = [];
    }
}
</script>

<template>
    <div>
        <div v-if="showJigSelect" class="input-group mb-3">
            <div class="input-group-prepend">
                <label class="input-group-text" for="jigSelect">Jig</label>
            </div>
            <select v-model="selectedJig" class="form-select" id="jigSelect">
                <option disabled value="">Choose...</option>
                <option v-for="filename in jigs" :key="filename" :value="filename">{{ filename }}</option>
            </select>
        </div>
        <div v-else class="mb-3">
            <label>Jig</label>
            <FileInputSingle v-model="selectedJigFile" title="Select jig file" :filetypes="['pdf', 'ai']">
            </FileInputSingle>
        </div>
        <FileInputMultiple v-model="selectedFiles" title="Select files" :filetypes="['pdf', 'ai']"></FileInputMultiple>
        <div class="mb-3">
            <button @click="populateJig" v-bind:disabled="!((selectedJig || selectedJigFile) && selectedFiles.length > 0)"
                class="btn btn-primary">Process</button>
        </div>
    </div>
</template>