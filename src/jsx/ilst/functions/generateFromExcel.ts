import currentTimestamp from "../helpers/currentTimestamp";
import createUniqueFile from "../helpers/createUniqueFile";
import populateLayer from "../helpers/populateLayer";
import saveDocument from "../helpers/saveDocument";

export interface RowData {
    "Ouput type": string;
    "Jig": string;
    "Template": string;
    "Order number": string;
    "Product": string;
    [key: string]: string;
}

function generateFilename(rowData: RowData, layerName?: string) {
    const replaceAllInString = function (input: string, search: string, replace: string) {
        return input.split(search).join(replace);
    }
    const order_number = replaceAllInString(rowData['Order number'], '#', '');
    const filename = order_number + (layerName ? " " + layerName : "") + "." + rowData["Ouput type"];
    return filename;
}

function createOutputFile(rowData: RowData, outputFolder: string, groupByJig: boolean, layerName?: string) {
    const jig = rowData["Jig"].split('.')[0];
    const timestamp = currentTimestamp('YYYY-MM-DD');
    const _outputFolder = new Folder(outputFolder + '/' + timestamp + ((jig && groupByJig) ? '/' + jig : ''));
    if (!_outputFolder.exists) {
        _outputFolder.create();
    }
    const filename = generateFilename(rowData, layerName);
    const outputFile = createUniqueFile(_outputFolder, filename);
    return outputFile;
}

function handleLayer(doc: Document, layerIndex: number, rowData: RowData, outputFolder: string, groupByJig: boolean) {
    const layer = doc.layers[layerIndex];
    const layerName = doc.layers.length > 1 ? layer.name : undefined;

    // Remove all layers except the current one from the copy
    for (var j = 0; j < doc.layers.length; j++) {
        if (doc.layers[j] !== layer) {
            doc.layers[j].remove();
        }
    }
    populateLayer(layer, rowData);
    try {
        const outputFile = createOutputFile(rowData, outputFolder, groupByJig, layerName);
        saveDocument(doc, outputFile);
        return outputFile;
    } catch (e) {
        throw new Error("Could not save document");
    }
}

export default function generateFromExcel(rowData: RowData, outputFolder: string = Folder.desktop + '/Output/', groupByJig = true) {
    const templateFile = File(rowData["Template"]);
    if(!templateFile.exists) {
        Window.alert("Template file " + templateFile.name + " does not exist");
        return;
    }
    var doc = app.open(templateFile);
    const numLayers = doc.layers.length;
    if(numLayers <= 0) {
        throw new Error("Could not find any layers in the template");
    }
    handleLayer(doc, 0, rowData, outputFolder, groupByJig);
    doc.close(SaveOptions.DONOTSAVECHANGES);
    if (numLayers > 1) {
        for (var i = 1; i < numLayers; i++) {
            doc = app.open(templateFile);
            handleLayer(doc, 0, rowData, outputFolder, groupByJig);
            doc.close(SaveOptions.DONOTSAVECHANGES);
        }
    }
}