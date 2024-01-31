import getItemsInLayer from "../helpers/getItemsInLayer";

export function mirrorLayer(layer: Layer = app.activeDocument.activeLayer, horizontally: boolean = false) {
    app.selection = null;
    const lockedItems = [];
    const doc = layer.parent as Document;

    // Create an rectangle that has the same size as the artboard
    const artboardRect = doc.artboards[0].artboardRect;
    const rectangle = layer.pathItems.rectangle(artboardRect[1], artboardRect[0], artboardRect[2] - artboardRect[0], artboardRect[1] - artboardRect[3]);

    // Create a group and move all items in the document to that group
    for(let pageItem of getItemsInLayer(layer)) {
        if (pageItem.locked) {
            lockedItems.push(pageItem);
            pageItem.locked = false;
        }
    }
    for(let i = 0; i < layer.pageItems.length; i++) {
        layer.pageItems[i].selected = true;
    }
    app.executeMenuCommand("group");
    const group = doc.selection[0] as GroupItem;

    // Mirror the group
    let matrix = app.getScaleMatrix(100, -100);
    if (horizontally) {
        matrix = app.getScaleMatrix(-100, 100);
    }
    group.transform(matrix);

    // Remove the rectangle
    rectangle.remove();

    // Move all items back to the layer
    app.executeMenuCommand("ungroup");
    for(let pageItem of lockedItems) {
        pageItem.locked = true;
    }
}

/**
 * Mirrors the entire document either horizontally or vertically.
 *
 * @param {Document} [doc] - The document to mirror. If not provided, the active document will be used.
 * @param {boolean} [horizontally=false] - Whether to mirror the document horizontally. If false, the document will be mirrored vertically.
 */
export function mirrorDocument(doc: Document = app.activeDocument, horizontally: boolean = false) {
    for (let i = 0; i < doc.layers.length; i++) {
        mirrorLayer(doc.layers[i], horizontally);
    }
}