import groupAllItemsInLayer, { cleanupGroup } from "../helpers/groupAllItemsInLayer";
import changeArtboardSize from "../helpers/changeArtboardSize";

/**
 * Rotates the given artboard 90 degrees around its center by switching its width and height.
 *
 * @param {Artboard} artboard - The artboard to rotate.
 */
function rotateArtBoard(artboard: Artboard) {
    const artboardRect = artboard.artboardRect;
    const width = artboardRect[2] - artboardRect[0];
    const height = artboardRect[1] - artboardRect[3];

    // Change the artboard size, switching width and height
    changeArtboardSize(artboard, height, width);
}

/**
 * Rotates all layers in the given document 90 degrees clockwise or counter-clockwise.
 *
 * @param {Document} [doc=app.activeDocument] - The document to rotate. If not provided, the active document is used.
 * @param {boolean} [counterClockwise=false] - If true, rotates the layers counter-clockwise. Otherwise, rotates them clockwise.
 */
export default function rotateDocument(doc: Document = app.activeDocument, counterClockwise: boolean = false) {
    for (let i = 0; i < doc.layers.length; i++) {
        const groupComponents = groupAllItemsInLayer(doc.layers[i]);
        groupComponents.group.rotate(counterClockwise ? 90 : -90);
        cleanupGroup(groupComponents);
    }
    const artboard = doc.artboards[0];
    rotateArtBoard(artboard);
}