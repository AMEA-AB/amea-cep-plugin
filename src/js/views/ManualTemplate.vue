<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router';
import GithubService, { GithubFile } from '../services/github-service';
import FileInputSingle from '../components/FileInputSingle.vue';
import FolderInput from '../components/FolderInput.vue';
import { evalTS } from '../lib/utils/bolt';

defineProps({
  showTemplateSelect: {
    type: Boolean,
    default: () => true
  },
});

const templates = ref<GithubFile[]>([]);
const selectedTemplate = ref<GithubFile | undefined>(undefined);
const selectedTemplateFile = ref<string | undefined>(undefined);
const activeDocumentName = ref<string | undefined>(undefined);
const outputName = ref<string | undefined>(undefined);
const outputType = ref<string>('pdf');
const outputFolder = ref<string | undefined>(undefined);
const editableItems = ref<Record<string, string> | undefined>(undefined);
const templateData = ref<Record<string, string>>({});

const closeDocument = () => {
    if(!activeDocumentName) return;
    return evalTS('closeDocument', activeDocumentName.value);
}

onMounted(() => {
    GithubService.getFileNamesInFolder('templates').then((files) => {
        templates.value = files;
    });

    watch(selectedTemplate, async (newValue) => {
        if (newValue) {
            selectedTemplateFile.value = await GithubService.downloadGithubFile(newValue);
            return;
        }
        selectedTemplateFile.value = undefined;
    });

    watch(selectedTemplateFile, async (newValue, oldValue) => {
        if (oldValue) {
            await closeDocument();
        }
        templateData.value = {};
        if(!newValue) {
            editableItems.value = undefined;
        } else {
            activeDocumentName.value = await evalTS('openDocument', newValue);
            editableItems.value = await evalTS('getEditableItems', ['RasterItem', 'GroupItem', "TextFrame"]);
        }
    });
});

onBeforeRouteLeave(closeDocument);

const populateTemplate = async () => {
    const outputFile = `${outputFolder.value}/${outputName.value}.${outputType.value}`
    evalTS('populateDocument', templateData.value);
    evalTS('saveDocument', outputFile);
    if(!selectedTemplate.value) return;

    // Reset UI
    closeDocument();
    selectedTemplate.value = undefined;
    outputName.value = undefined;
}
</script>

<template>
    <div>
        <div v-if="showTemplateSelect" class="input-group mb-3">
            <div class="input-group-prepend">
                <label class="input-group-text" for="templateSelect">Template</label>
            </div>
            <select v-model="selectedTemplate" class="form-select" id="templateSelect">
                <option disabled value="">Choose...</option>
                <option v-for="files in templates" :key="files.name" :value="files">{{ files.name }}</option>
            </select>
        </div>
        <div v-else class="mb-3">
            <label>Template</label>
            <FileInputSingle v-model="selectedTemplateFile"
                title="Select template file" :filetypes="['pdf', 'ai']">
            </FileInputSingle>
        </div>
        <div class="mb-3">
            <label for="outputName">Output name</label>
            <input id="outputName" v-model="outputName" type="text" class="form-control">
        </div>
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <label class="input-group-text" for="templateSelect">Output type</label>
            </div>
            <select v-model="outputType" class="form-select" id="templateSelect">
                <option v-for="outputType in ['pdf', 'ai', 'svg']" :key="outputType" :value="outputType">{{ outputType }}
                </option>
            </select>
        </div>
        <div class="mb-3">
            <label for="outputFolder">Output folder</label>
            <FolderInput id="outputFolder" v-model="outputFolder" title="Select output folder"></FolderInput>
        </div>
        <div v-if="editableItems">
            <div v-for="(type, title) in editableItems" :key="title" class="mb-3">
                <label :for="title">{{ title }}</label>
                <FileInputSingle v-if="type === 'RasterItem' || type === 'GroupItem'" v-model="templateData[title]"
                    :title="`Select file for ${title}`" :filetypes="type === 'RasterItem' ? ['png', 'jpg'] : ['svg', 'ai']">
                </FileInputSingle>
                <input v-if="type === 'TextFrame'" v-model="templateData[title]" type="text" class="form-control"
                    :id="title">
            </div>
        </div>
        <div class="mb-3">
            <button @click="populateTemplate" class="btn btn-primary"
                v-bind:disabled="!selectedTemplateFile || !outputName || !outputFolder || !editableItems">Process</button>
        </div>
    </div>
</template>