/**
 * Clips the document by creating a clipping mask that matches the size of the active artboard.
 * Excess outside the clipping mask is removed.
 *
 * @param {Document} doc - The document to clip.
 */
export default function clipDocument(doc: Document = app.activeDocument) {
    const clipGroup = doc.groupItems.add();

    // Collect all items to move
    const itemsToMove: PageItem[] = [];
    for (let i = 0; i < doc.pageItems.length; i++) {
        const item = doc.pageItems[i];
        if (item !== clipGroup && (item.parent as PageItem).typename === "Layer") {
            itemsToMove.push(item);
        }
    }

    // Move collected items to the clip group
    for (let i = 0; i < itemsToMove.length; i++) {
        itemsToMove[i].move(clipGroup, ElementPlacement.PLACEATBEGINNING);
    }

    // Create a clipping mask
    const artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    const artboardRect = artboard.artboardRect; // [left, top, right, bottom]
    const width = artboardRect[2] - artboardRect[0];
    const height = artboardRect[1] - artboardRect[3];
    const square = doc.pathItems.rectangle(artboardRect[1], artboardRect[0], width, height);
    square.clipping = true;
    square.selected = true;
    square.move(clipGroup, ElementPlacement.PLACEATBEGINNING);

    // Set the clipped property of the clipGroup to true
    clipGroup.clipped = true;
    clipGroup.selected = true;

    // Remove excess
    app.executeMenuCommand('OffsetPath v22');
    app.executeMenuCommand("Live Pathfinder Crop");
    app.executeMenuCommand("expandStyle");
}