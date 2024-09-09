<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '../../store/settings-store';
import GithubService from '../../services/github-service';
import FolderService from '../../services/folder-service';
import FileInputSingle from '../../components/FileInputSingle.vue';
import FolderInput from '../../components/FolderInput.vue';
import { evalTS } from '../../lib/utils/bolt';
import { TemplateFlags } from '../../../shared/shared';
import type { RowData, TemplateFlag, OutputType } from '../../../shared/types';

defineProps({
    showTemplateSelect: {
        type: Boolean,
        default: () => true
    },
});

const templates = ref<string[]>([]);
const selectedTemplate = ref<string | undefined>(undefined);
const selectedTemplateFile = ref<string | undefined>(undefined);
const outputName = ref<string | undefined>(undefined);
const outputType = ref<OutputType>('pdf');
const outputFolder = ref<string | undefined>(undefined);
const editableItems = ref<Record<string, string>>({});
const colorVariables = ref<string[]>([]);
const templateData = ref<Record<string, string>>({});
const flags = ref<TemplateFlag[]>([]);

onMounted(() => {
    const settingsStore = useSettingsStore();

    if (settingsStore.settings.useGithub) {
        GithubService.getFilenamesInFolder('templates', ['pdf', 'ai']).then((files) => {
            templates.value = files;
        });
    } else {
        templates.value = FolderService.getFilesInFolder(settingsStore.settings.templatesFolder, ['pdf', 'ai']);
    }

    watch(selectedTemplate, async (newValue) => {
        if (newValue) {
            const settingsStore = useSettingsStore();
            if (settingsStore.settings.useGithub) {
                selectedTemplateFile.value = await GithubService.downloadFile(GithubService.getGithubFileUrl(`templates/${newValue}`));
            } else {
                selectedTemplateFile.value = `${settingsStore.settings.templatesFolder}/${newValue}`;
            }
            return;
        }
        selectedTemplateFile.value = undefined;
    });

    watch(selectedTemplateFile, async (newValue) => {
        templateData.value = {};
        editableItems.value = {};
        colorVariables.value = [];
        if (newValue) {
            await evalTS('openDocument', newValue);
            editableItems.value = await evalTS('getEditableItems', ['RasterItem', 'GroupItem', "TextFrame"]);
            colorVariables.value = await evalTS('getColorVariables');
            await evalTS('closeDocument');
        }
    });
});

const populateTemplate = async () => {
    if (
        !selectedTemplateFile.value ||
        !outputName.value ||
        !outputFolder.value
    ) {
        return;
    }

    const rowData = {
        ...templateData.value,
        "Output name": outputName.value,
        "Template": selectedTemplateFile.value,
        "Output type": outputType.value,
        "Flags": flags.value,
    } as RowData;
    evalTS('generateFromRowData', rowData, outputFolder.value);
}
</script>

<template>
    <div>
        <div v-if="showTemplateSelect" class="mb-3">
            <label for="templateSelect">Template</label>
            <select v-model="selectedTemplate" class="form-select" id="templateSelect">
                <option disabled value="">Choose...</option>
                <option v-for="template in templates" :key="template" :value="template">{{ template }}</option>
            </select>
        </div>
        <div v-else class="mb-3">
            <label>Template</label>
            <FileInputSingle v-model="selectedTemplateFile" title="Select template file" :filetypes="['pdf', 'ai']">
            </FileInputSingle>
        </div>
        <div class="mb-3">
            <label for="flagsSelect">Flags</label>
            <select v-model="flags" class="form-select" id="flagsSelect" multiple>
                <option v-for="flag in TemplateFlags" :key="flag" :value="flag">{{ flag }}
                </option>
            </select>
        </div>
        <div class="mb-3">
            <label for="outputName">Output name</label>
            <input id="outputName" v-model="outputName" type="text" class="form-control">
        </div>
        <div class="mb-3">
            <label for="outputTypeSelect">Output type</label>
            <select v-model="outputType" class="form-select" id="outputTypeSelect">
                <option v-for="outputType in ['pdf', 'ai', 'svg']" :key="outputType" :value="outputType">{{ outputType }}
                </option>
            </select>
        </div>
        <div class="mb-3">
            <label for="outputFolder">Output folder</label>
            <FolderInput id="outputFolder" v-model="outputFolder" title="Select output folder"></FolderInput>
        </div>
        <div v-for="(type, title) in editableItems" :key="title" class="mb-3">
            <label :for="title">{{ title }}</label>
            <FileInputSingle v-if="type === 'RasterItem' || type === 'GroupItem'" v-model="templateData[title]"
                :title="`Select file for ${title}`" :filetypes="type === 'RasterItem' ? ['png', 'jpg'] : ['svg', 'ai']">
            </FileInputSingle>
            <input v-if="type === 'TextFrame'" v-model="templateData[title]" type="text" class="form-control" :id="title">
        </div>
        <div v-for="colorName in colorVariables" :key="colorName" class="mb-3">
            <label :for="colorName">{{ colorName }}</label>
            <input v-model="templateData[colorName]" type="string" class="form-control" :id="colorName">
        </div>
        <div class="mb-3">
            <button @click="populateTemplate" class="btn btn-primary"
                v-bind:disabled="!selectedTemplateFile || !outputName || !outputFolder || !editableItems">Process</button>
        </div>
    </div>
</template>