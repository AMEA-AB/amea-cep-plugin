import applyTemplateFlags from "../helpers/applyTemplateFlags";
import createUniqueFile from "../helpers/createUniqueFile";
import populateLayer from "../helpers/populateLayer";
import saveDocument from "../helpers/saveDocument";

import type { RowData } from '../../../shared/types';

/**
 * Creates a unique output file based on the provided parameters.
 * @param {string} outputName - The name of the output file.
 * @param {string} outputType - The type of the output file.
 * @param {string} outputFolder - The folder where the output file will be created.
 * @param {string} [layerName] - The name of the layer, if any.
 * @returns {File} The created output file.
 */
function createOutputFile(outputName: string, outputType: string, outputFolder: string, layerName?: string): File {
    const filename = outputName + (layerName ? " " + layerName : "") + "." + outputType;
    const outputFile = createUniqueFile(new Folder(outputFolder), filename);
    return outputFile;
}

/**
 * Populate a layer with the provided row data and save the document to the output folder.
 * @param {Document} doc - The document containing the layer.
 * @param {number} layerIndex - The index of the layer in the document.
 * @param {RowData} rowData - The row data to be applied to the layer.
 * @param {string} outputFolder - The folder where the output file will be created.
 * @throws {Error} If the document could not be saved.
 */
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
    if(rowData.Flags) {
        applyTemplateFlags(doc, rowData["Flags"]);
    }
    const outputFile = createOutputFile(rowData['Output name'], rowData['Output type'], outputFolder, layerName);
    saveDocument(doc, outputFile);
    return outputFile;
}

/**
 * Generates output files from the provided row data.
 * @param {RowData} rowData - The row data to be used for generating the output files.
 * @param {string} outputFolder - The folder where the output files will be created.
 * @returns {string[]} The file system names of the created output files.
 * @throws {Error} If the template file does not exist or if no layers could be found in the template.
 */
export default function generateFromRowData(rowData: RowData, outputFolder: string): string[] {
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
            outputFile = handleLayer(doc, i, rowData, outputFolder);
            outputFiles.push(outputFile.fsName);
            doc.close(SaveOptions.DONOTSAVECHANGES);
        }
    }
    return outputFiles;
}