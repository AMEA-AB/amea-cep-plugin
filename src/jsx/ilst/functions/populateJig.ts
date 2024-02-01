import currentTimestamp from "../helpers/currentTimestamp";
import saveDocument from "../helpers/saveDocument";
import cropToContent from "./cropToContent";

type FilesGroup = string[];

/**
 * Searches for the first sub-array in a 2D array that has less elements than a specified number (slots).
 *
 * @param {any[][]} array - The 2D array to search.
 * @param {number} slots - The number of elements to compare against.
 * @returns {[number, number] | [null, null]} If a sub-array with less elements than slots is found, returns an array
 * containing the index of the sub-array and its first available index. If no such sub-array is found, returns an array containing two null values.
 */
function findFirstAvailibility(array: any[][], slots: number): [number, number] | [null, null] {
    for (let i = 0; i < array.length; i++) {
        if (array[i].length < slots) {
            return [i, array[i].length];
        }
    }
    return [null, null];
}

/**
 * Structures the FilesGroups in a way that each file in a group is placed in a seperate list but
 * at the same index. 
 *
 * @param {number} slots - The number of slots to structure the files into.
 * @param {FilesGroup[]} files - The groups of files to structure.
 * @returns {string[][]} The structured files in a 2D array.
 */
function structureFiles(slots: number, files: FilesGroup[]): string[][] {
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

/**
 * Place files at the center of the compound path items in a jig file, crops the document to content,
 * saves the document as a PDF. If there are more images than compound path items, the function is
 * called recursively with the remaining images.
 *
 * @param {string} jigFile - The path to the jig file.
 * @param {string[]} files - The paths to the files to place in the compound path items.
 * @param {string} outputFolder - The path to the folder where the PDF files should be saved.
 * @throws {Error} If an image file does not exist or cannot be embedded.
 */
function fillJigAndSave(jigFile: string, files: string[], outputFolder: string) {
    const doc = app.open(File(jigFile));
    const layer = doc.layers[0];
    const compoundPathItems = layer.compoundPathItems;
    let fileIndex = 0;

    // Place files in center of compoundPathItems
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

    // Crop to content
    cropToContent(doc);

    const pdfFile = new File(outputFolder + '/' + currentTimestamp('YYYY-MM-DD hh.mm.ss') + '.pdf');
    saveDocument(doc, pdfFile);
    doc.close();

    if (fileIndex < files.length) {
        const remainingFiles = files.slice(fileIndex);
        fillJigAndSave(jigFile, remainingFiles, outputFolder);
    }
}

/**
 * Populate a jig smart, each file in a FilesGroup is placed in seperate outputfiles,
 * but at the same position in the jig. 
 *
 * @param {string} jigFile - The path to the jig file.
 * @param {FilesGroup[]} files - The groups of image files to place in the compound path items.
 * @param {string} outputFolder - The path to the folder where the PDF should be saved.
 */
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