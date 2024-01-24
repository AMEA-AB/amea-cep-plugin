export default function clipDocument(doc: Document) {
    const clipGroup = doc.groupItems.add();

    // Move all groups to the clip group
    const groups = doc.groupItems;
    for(var i = groups.length - 1; i >= 0; i--) {
        if (groups[i] !== clipGroup) {
            groups[i].move(clipGroup, ElementPlacement.PLACEATBEGINNING);
        }
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