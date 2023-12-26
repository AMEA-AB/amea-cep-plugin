<script setup lang="ts">
import { ref, onMounted, watch} from 'vue'
import { onBeforeRouteLeave } from 'vue-router';
import GithubService, {GithubFile} from '../services/github-service';
import FileInputSingle from '../components/FileInputSingle.vue';
import { evalTS } from '../lib/utils/bolt';

const templates = ref<GithubFile[]>([]);
const selectedTemplate = ref<GithubFile | undefined>(undefined);
const editableItems = ref<Record<string, string> | undefined>(undefined);
const templateData = ref<Record<string, string>>({});

onMounted(() => {
    GithubService.getFileNamesInFolder('templates').then((files) => {
        templates.value = files;
    });

    watch(selectedTemplate, async (newValue, oldValue) => {
        editableItems.value = undefined;
        templateData.value = {};
        if(oldValue) {
            await evalTS('closeDocumentByName', oldValue.name);
        }
        if(!newValue) return;
        const templateFile = await GithubService.downloadFile(newValue.download_url, newValue.name);
        await evalTS('openDocument', templateFile);
        editableItems.value = await evalTS('getEditableItems', ['RasterItem', 'GroupItem', "TextFrame"]);
    });
});

onBeforeRouteLeave(() => {
    if(selectedTemplate.value) {
        evalTS('closeDocumentByName', selectedTemplate.value.name);
    }
});

const populateTemplate = async () => {
    evalTS('populateDocument', templateData.value);
}
</script>

<template>
    <div>
        <pre>
            {{ templateData }}
        </pre>
        <h1 style="color: red">Manual Populate template</h1>
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <label class="input-group-text" for="templateSelect">Template</label>
            </div>
            <select v-model="selectedTemplate" class="form-select" id="templateSelect">
                <option disabled value="">Choose...</option>
                <option v-for="files in templates" :key="files.name" :value="files">{{ files.name }}</option>
            </select>
        </div>
        <div v-if="editableItems">
            <div v-for="(type, title) in editableItems" :key="title">
                <label :for="title">{{ title }}</label>
                <FileInputSingle
                    v-if="type === 'RasterItem' || type === 'GroupItem'"
                    v-model="templateData[title]"
                    :title="`Select file for ${title}`"
                    :filetypes="type === 'RasterItem' ? ['png', 'jpg'] : ['svg', 'ai']"
                ></FileInputSingle>
                <input
                    v-if="type === 'TextFrame'"
                    v-model="templateData[title]"
                    :title="`Enter text for ${title}`"
                    type="text"
                    class="form-control"
                    :id="title"
                >
            </div>
        </div>
        <div class="mb-3">
            <button @click="populateTemplate" class="btn btn-primary">Process</button>
        </div>
    </div>
</template>