<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GithubService from '../services/github-service';
import { evalTS } from '../lib/utils/bolt';

const jigs = ref<string[]>([]);
const selectedJig = ref<string | undefined>(undefined);
const selectedFiles = ref<string[]>([]);

onMounted(async () => {
    jigs.value = await GithubService.getFileNamesInFolder('jigs');
});

const onSelectFiles = async () => {
    selectedFiles.value = await evalTS('openFileDialogMultiple', "");
}

const populateJig = async () => {
    if (selectedJig.value && selectedFiles.value.length > 0) {
        const jigPath = await GithubService.downloadFile(`jigs/${selectedJig.value}`);
        await evalTS('populateJig', jigPath, selectedFiles.value);
        selectedFiles.value = [];
    }
}
</script>

<template>
    <div>
        <h1 style="color: red">Jig</h1>
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <label class="input-group-text" for="jigSelect">Jig</label>
            </div>
            <select v-model="selectedJig" class="form-select" id="jigSelect">
                <option disabled value="">Choose...</option>
                <option v-for="filename in jigs" :key="filename" :value="filename">{{ filename }}</option>
            </select>
        </div>
        <div class="mb-3">
            <button @click="onSelectFiles" class="btn btn-secondary">
                <span>{{ selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Select Files' }}</span>
            </button>
        </div>
        <div class="mb-3">
            <button @click="populateJig" v-bind:disabled="!(selectedJig && selectedFiles.length > 0)"
                class="btn btn-primary">Process</button>
        </div>
    </div>
</template>