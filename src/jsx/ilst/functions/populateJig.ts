import currentTimestamp from "../helpers/currentTimestamp";
import saveDocument from "../helpers/saveDocument";

type FilesGroup = string[];

function findFirstAvailibility(array: any[][], slots: number) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].length < slots) {
            return [i, array[i].length];
        }
    }
    return [null, null];
}

function structureFiles(slots: number, files: FilesGroup[]) {
    files = files.sort((a, b) => {
        return a.length > b.length ? -1 : 1;
    });
    const output: string[][] = [];

    for (let i = 0; i < files.length; i++) {
        let [index, innerIndex] = findFirstAvailibility(output, slots);

        if (index === null || innerIndex === null) {
            output.push([]);
            index = output.length - 1;
            innerIndex = 0;
        }

        for (let j = 0; j < files[i].length; j++) {
            if (index + j >= output.length) {
                output.push([]);
            }
            output[index + j][innerIndex] = files[i][j];
        }
    }
    return output;
}

function fillJigAndSave(jigFile: string, files: string[], outputFolder: string) {
    const doc = app.open(File(jigFile));
    const layer = doc.layers[0];
    const compoundPathItems = layer.compoundPathItems;
    let fileIndex = 0;

    // Place images in compoundPathItems
    for (let i = 0; i < compoundPathItems.length && fileIndex < files.length; i++) {
        const file = new File(files[fileIndex]);
        if (!file.exists) {
            throw new Error("File " + file.name + " does not exist");
        }
        const compoundPathItem = compoundPathItems[i];
        const placedItem = compoundPathItem.layer.placedItems.add();
        placedItem.file = file;
        const centerX = compoundPathItem.position[0] + compoundPathItem.width / 2;
        const centerY = compoundPathItem.position[1] + compoundPathItem.height / 2;
        const x = centerX - placedItem.width / 2;
        const y = centerY - placedItem.height / 2;
        placedItem.position = [x, y];
        fileIndex++;
        try {
            placedItem.embed();
        } catch (e) {
            throw new Error("Could not embed image " + file.name);
        }
    }
    // Remove all compoundPathItems
    for (let i = compoundPathItems.length - 1; i >= 0; i--) {
        compoundPathItems[i].remove();
    }

    const pdfFile = new File(outputFolder + '/' + currentTimestamp('YYYY-MM-DD hh.mm.ss') + '.pdf');
    saveDocument(doc, pdfFile);
    doc.close();

    if (fileIndex < files.length) {
        const remainingFiles = files.slice(fileIndex);
        fillJigAndSave(jigFile, remainingFiles, outputFolder);
    }
}

function fillJigSmartAndSave(jigFile: string, files: FilesGroup[], outputFolder: string) {
    const doc = app.open(File(jigFile));
    const layer = doc.layers[0];
    const compoundPathItems = layer.compoundPathItems;
    const slots = compoundPathItems.length;
    doc.close();
    const structuredFiles = structureFiles(slots, files);
    for(let i = 0; i < structuredFiles.length; i++) {
        fillJigAndSave(jigFile, structuredFiles[i], outputFolder);
    }
}

export {
    fillJigAndSave as populateJig,
    fillJigSmartAndSave as populateJigSmart
}