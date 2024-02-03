import { OutputType } from "../../../shared/types";

/**
 * Saves a document to a specified output file. If no output file is provided, the document is saved to a temporary folder with its current name.
 * The document can be saved as a PDF, AI, or SVG file. The output type is determined by the file extension of the output file.
 *
 * @param {Document} doc - The document to save.
 * @param {File} [outputFile] - The file to save the document to. If not provided, the document is saved to a temporary folder with its current name.
 * @throws {Error} If the document does not have a name and no output file is provided.
 * @throws {Error} If the output type is not supported.
 * @returns {File} The file the document was saved to.
 */
export default function saveDocument(doc: Document, outputFile?: File): File {
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
    const outputType = outputFile.name.split(".").pop() as OutputType;
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