import groupAllItemsInLayer, { cleanupGroup } from "../helpers/groupAllItemsInLayer";

/**
 * Mirrors all items in a given layer either vertically or horizontally.
 *
 * @param {Layer} [layer=app.activeDocument.activeLayer] - The layer to mirror. If not provided, the active layer is used.
 * @param {boolean} [horizontally=false] - If true, mirrors the layer horizontally. Otherwise, mirrors it vertically.
 */
export function mirrorLayer(layer: Layer = app.activeDocument.activeLayer, horizontally: boolean = false) {
    const groupComponents = groupAllItemsInLayer(layer);

    // Mirror the group
    let matrix = app.getScaleMatrix(100, -100);
    if (horizontally) {
        matrix = app.getScaleMatrix(-100, 100);
    }
    groupComponents.group.transform(matrix);

    cleanupGroup(groupComponents);
}

/**
 * Mirrors the entire document either horizontally or vertically.
 *
 * @param {Document} [doc] - The document to mirror. If not provided, the active document will be used.
 * @param {boolean} [horizontally=false] - If true, mirrors the document horizontally. Otherwise, mirrors it vertically.
 */
export function mirrorDocument(doc: Document = app.activeDocument, horizontally: boolean = false) {
    for (let i = 0; i < doc.layers.length; i++) {
        mirrorLayer(doc.layers[i], horizontally);
    }
}