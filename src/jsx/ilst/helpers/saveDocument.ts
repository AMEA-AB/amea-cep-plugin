export default function saveDocument(doc: Document, outputFile?: File) {
    if (!outputFile) {
        if(!doc.fullName) {
            throw new Error("Could not save document, no name")
        }
        outputFile = new File(Folder.temp + '/' + doc.fullName.name);
    }
    const outputFolder = outputFile.parent;
    if(!outputFolder.exists) {
        outputFolder.create();
    }
    const outputType = outputFile.name.split(".").pop();
    var saveOpts: PDFSaveOptions | IllustratorSaveOptions | undefined;
    var exportOpts: ExportOptionsSVG | undefined;
    var exportType;
    switch (outputType) {
        case "pdf":
            saveOpts = new PDFSaveOptions();
            break;
        case "ai":
            saveOpts = new IllustratorSaveOptions();
            break;
        case "svg":
            exportOpts = ExportOptionsSVG;
            /* exportOpts.embedRasterImages = true;
            exportOpts.embedAllFonts = false; */
            exportType = ExportType.SVG;
            break;
        default:
            throw new Error("Unsupported output type: " + outputType);
    }
    if (saveOpts) {
        doc.saveAs(outputFile, saveOpts);
    } else if(exportOpts && exportType) {
        doc.exportFile(outputFile, exportType, exportOpts);
    }
    return outputFile;
}