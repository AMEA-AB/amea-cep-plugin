<script setup lang="ts">
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import FileService from '../../services/file-service';
import FolderService from '../../services/folder-service';
import GithubService from '../../services/github-service';
import type { RowData } from '../../../shared/types';
import { evalTS } from '../../lib/utils/bolt';

const rowData = ref<RowData[] | undefined>(undefined)
const loading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array((e.target as FileReader).result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        const jsonData = XLSX.utils.sheet_to_json<RowData>(worksheet);
        rowData.value = jsonData;
    };
    reader.readAsArrayBuffer(file);
}

const buttonTitle = computed(() => {
    if (!rowData.value) return 'Process';
    const rows = rowData.value.length;
    return `Process ${rows} row${rows > 1 ? 's' : ''}`;
})

const getTemplateUrl = (templateName: string) => GithubService.getGithubFileUrl(`templates/${templateName}`);

const getFilesForRows = async (rows: RowData[]) => {
    const urlRegex = /^https?:\/\/((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    const dataUrls: Set<string> = new Set();
    const templateUrls: Set<string> = new Set();

    for (const row of rows) {
        for (const columnName of Object.keys(row)) {
            if (columnName === 'Template') {
                templateUrls.add(getTemplateUrl(row[columnName]));
            } else if (urlRegex.test(row[columnName])) {
                dataUrls.add(row[columnName]);
            }
        }
    }
    const urlToFilePaths = await FileService.downloadFiles(Array.from(dataUrls));
    const templateToFilePaths = await GithubService.downloadFiles(Array.from(templateUrls));

    for (const row of rows) {
        for (const column of Object.keys(row)) {
            if (column === 'Template') {
                const url = getTemplateUrl(row[column]);
                row[column] = templateToFilePaths[url];
            } else if (urlToFilePaths.hasOwnProperty(row[column])) {
                row[column] = urlToFilePaths[row[column]];
            }
        }
    }
}

const processRows = async () => {
    if (!rowData.value) return;
    loading.value = true;
    const jigFiles: Record<string, Array<string[]>> = {};
    const nonJigFiles: string[] = [];
    try {
        await getFilesForRows(rowData.value);
        const templateOuputFolder = FolderService.getTempFolder();
        for (const row of rowData.value) {
            const outputs = await evalTS('generateFromRowData', row, templateOuputFolder);
            if(row.hasOwnProperty('Jig') && row.Jig) {
                if (!jigFiles.hasOwnProperty(row.Jig)) {
                    jigFiles[row.Jig] = [];
                }
                for(let i = 0; i < row['Quantity']; i++) {
                    jigFiles[row.Jig].push(outputs);
                }
            } else {
                nonJigFiles.push(...outputs);
            }
        }
        const outputFolder = FolderService.getDesktopFolder('Bundles');
        for (const jigName of Object.keys(jigFiles)) {
            const inputs = jigFiles[jigName];
            const jigFileURL = GithubService.getGithubFileUrl(`jigs/${jigName}`);
            const jigFile = await GithubService.downloadFile(jigFileURL);
            await evalTS('populateJigSmart', jigFile, inputs, outputFolder);
        }
        for(const file of nonJigFiles) {
            FileService.moveFileToFolder(file, outputFolder);
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
    fileInput.value!.value = '';
    rowData.value = undefined;
}

</script>

<template>
    <div class="container-sm">
        <div class="mb-3">
            <label for="formFile" class="form-label">Choose a XLSX-file</label>
            <input ref="fileInput" @change="onFileChange" class="form-control" type="file" accept=".xlsx">
        </div>
        <button @click="processRows" class="btn btn-primary" v-bind:disabled="!rowData || loading">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span>{{ buttonTitle }}</span>
        </button>
    </div>
</template>w