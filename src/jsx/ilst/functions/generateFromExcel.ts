import createUniqueFile from "../helpers/createUniqueFile";
import populateLayer from "../helpers/populateLayer";
import saveDocument from "../helpers/saveDocument";

import type { RowData } from '../../../shared/types';

function generateFilename(rowData: RowData, layerName?: string) {
    const replaceAllInString = function (input: string, search: string, replace: string) {
        return input.split(search).join(replace);
    }
    const order_number = replaceAllInString(rowData['Order number'], '#', '');
    const filename = order_number + (layerName ? " " + layerName : "") + "." + rowData["Ouput type"];
    return filename;
}

function createOutputFile(rowData: RowData, outputFolder: string, layerName?: string) {
    const filename = generateFilename(rowData, layerName);
    const outputFile = createUniqueFile(new Folder(outputFolder), filename);
    return outputFile;
}

function handleLayer(doc: Document, layerIndex: number, rowData: RowData, outputFolder: string) {
    const layer = doc.layers[layerIndex];
    const layerName = doc.layers.length > 1 ? layer.name : undefined;

    // Remove all layers except the current one from the copy
    for (let j = 0; j < doc.layers.length; j++) {
        if (doc.layers[j] !== layer) {
            doc.layers[j].remove();
        }
    }
    populateLayer(layer, rowData);
    try {
        const outputFile = createOutputFile(rowData, outputFolder, layerName);
        saveDocument(doc, outputFile);
        return outputFile;
    } catch (e) {
        throw new Error("Could not save document");
    }
}

export default function generateFromExcel(rowData: RowData, outputFolder: string) {
    const templateFile = new File(rowData["Template"]);
    if (!templateFile.exists) {
        throw new Error("Template file " + templateFile.name + " does not exist");
    }
    let doc = app.open(templateFile);
    const numLayers = doc.layers.length;
    if (numLayers <= 0) {
        throw new Error("Could not find any layers in the template");
    }
    let outputFile = handleLayer(doc, 0, rowData, outputFolder);
    doc.close(SaveOptions.DONOTSAVECHANGES);
    const outputFiles: string[] = [outputFile.fsName];
    if (numLayers > 1) {
        for (let i = 1; i < numLayers; i++) {
            doc = app.open(templateFile);
            outputFile = handleLayer(doc, 0, rowData, outputFolder);
            outputFiles.push(outputFile.fsName);
            doc.close(SaveOptions.DONOTSAVECHANGES);
        }
    }
    return outputFiles;
}