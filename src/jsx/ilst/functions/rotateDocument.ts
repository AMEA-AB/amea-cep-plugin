import groupAllItemsInLayer, { cleanupGroup } from "../helpers/groupAllItemsInLayer";

/**
 * Rotates the given artboard 90 degrees around its center by switching its width and height.
 *
 * @param {Artboard} artboard - The artboard to rotate.
 */
function rotateArtBoard(artboard: Artboard) {
    const artboardRect = artboard.artboardRect;
    const width = artboardRect[2] - artboardRect[0];
    const height = artboardRect[1] - artboardRect[3];

    // Calculate the center of the artboard
    const centerX = artboardRect[0] + width / 2;
    const centerY = artboardRect[1] - height / 2;

    // Switch width and height
    const newWidth = height;
    const newHeight = width;

    // Calculate the new position so that the center stays in the same place
    const newLeft = centerX - newWidth / 2;
    const newTop = centerY + newHeight / 2;

    artboard.artboardRect = [newLeft, newTop, newLeft + newWidth, newTop - newHeight];
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