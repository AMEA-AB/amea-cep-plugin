import currentTimestamp from "../helpers/currentTimestamp";
import saveDocument from "../helpers/saveDocument";

function savePopulatedJig(doc: Document) {
    var bundlesFolder = new Folder(Folder.desktop + '/Bundles');
    if (!bundlesFolder.exists) {
        bundlesFolder.create();
    }
    var pdfFile = new File(bundlesFolder + '/' + currentTimestamp('YYYY-MM-DD hh.mm.ss') + '.pdf');
    saveDocument(doc, pdfFile);
}

export default function fillJigAndSave(jigFile: string, files: string[]) {
    var doc = app.open(File(jigFile));
    var layer = doc.layers[0];
    var compoundPathItems = layer.compoundPathItems;
    var fileIndex = 0;

    // Place images in compoundPathItems
    for (var i = 0; i < compoundPathItems.length && fileIndex < files.length; i++) {
        var file = new File(files[fileIndex]);
        if(!file.exists) {
            throw new Error("File " + file.name + " does not exist");
        }
        var compoundPathItem = compoundPathItems[i];
        var placedItem = compoundPathItem.layer.placedItems.add();
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
    for (var i = compoundPathItems.length - 1; i >= 0; i--) {
        compoundPathItems[i].remove();
    }

    savePopulatedJig(doc);
    doc.close();

    if (fileIndex < files.length) {
        var remainingFiles = files.slice(fileIndex);
        fillJigAndSave(jigFile, remainingFiles);
    }
}