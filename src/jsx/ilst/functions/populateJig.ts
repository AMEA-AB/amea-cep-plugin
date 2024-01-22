import currentTimestamp from "../helpers/currentTimestamp";
import saveDocument from "../helpers/saveDocument";

export default function fillJigAndSave(jigFile: string, files: string[], outputFolder: string) {
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
        placedItem.position = compoundPathItem.position;
        placedItem.width = compoundPathItem.width;
        placedItem.height = compoundPathItem.height;
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