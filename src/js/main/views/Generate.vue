<script setup lang="ts">
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import FileService from '../../services/file-service';
import TemplateService from '../../services/template-service';
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

const getFilesForRows = async (rows: RowData[]) => {
    const urlRegex = /^https?:\/\/((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    const dataUrls: Set<string> = new Set();

    for (const row of rows) {
        for (const key of Object.keys(row)) {
            if (urlRegex.test(row[key])) {
                dataUrls.add(row[key]);
            }
        }
        dataUrls.add(TemplateService.getTemplateUrl(row['Template']));
    }
    const urlToFilePaths = await FileService.downloadFiles(Array.from(dataUrls));

    for (const row of rows) {
        for(const column of Object.keys(row)) {
            if(column === 'Template') {
                const url = TemplateService.getTemplateUrl(row[column]);
                row[column] = urlToFilePaths[url];
                continue;
            }
            if(urlToFilePaths.hasOwnProperty(row[column])) {
                row[column] = urlToFilePaths[row[column]];
            }
        }
    }
}

const processRows = async () => {
    if (!rowData.value) return;
    loading.value = true;
    try {
        await getFilesForRows(rowData.value)
        for(const row of rowData.value) {
            await evalTS('generateFromExcel', row);
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