<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GithubService, { GithubFile } from '../services/github-service';
import FileInputMultiple from '../components/FileInputMultiple.vue';
import { evalTS } from '../lib/utils/bolt';

const jigs = ref<GithubFile[]>([]);
const selectedJig = ref<GithubFile | undefined>(undefined);
const selectedFiles = ref<string[]>([]);

onMounted(async () => {
    jigs.value = (await GithubService.getFileNamesInFolder('jigs'));
});

const populateJig = async () => {
    if (selectedJig.value && selectedFiles.value.length > 0) {
        const jigPath = await GithubService.downloadFile(selectedJig.value.download_url);
        await evalTS('populateJig', jigPath, selectedFiles.value);
        selectedFiles.value = [];
    }
}
</script>

<template>
    <div>
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <label class="input-group-text" for="jigSelect">Jig</label>
            </div>
            <select v-model="selectedJig" class="form-select" id="jigSelect">
                <option disabled value="">Choose...</option>
                <option v-for="file in jigs" :key="file.name" :value="file">{{ file.name }}</option>
            </select>
        </div>
        <FileInputMultiple v-model="selectedFiles" title="Select files" multiple :filetypes="['pdf', 'ai']"></FileInputMultiple>
        <div class="mb-3">
            <button @click="populateJig" v-bind:disabled="!(selectedJig && selectedFiles.length > 0)"
                class="btn btn-primary">Process</button>
        </div>
    </div>
</template>