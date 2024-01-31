export default function mirrorDocument(doc?: Document, horizontally = false) {
    if (!doc) {
        doc = app.activeDocument;
    }

    // Create a group and move all items in the document to that group
    const group = doc.groupItems.add();
    for (let i = doc.pageItems.length - 1; i >= 0; i--) {
        doc.pageItems[i].move(group, ElementPlacement.INSIDE);
    }

    // Create an invisible rectangle that has the same size as the artboard
    const artboardRect = doc.artboards[0].artboardRect;
    const rectangle = doc.pathItems.rectangle(artboardRect[1], artboardRect[0], artboardRect[2] - artboardRect[0], artboardRect[1] - artboardRect[3]);
    rectangle.fillColor = new NoColor();
    rectangle.stroked = false;
    rectangle.move(group, ElementPlacement.PLACEATBEGINNING);

    let matrix = app.getScaleMatrix(100, -100);
    if (horizontally) {
        matrix = app.getScaleMatrix(-100, 100);
    }
    group.transform(matrix);

    rectangle.remove();
    for (let i = group.pageItems.length - 1; i >= 0; i--) {
        group.pageItems[i].move(doc, ElementPlacement.PLACEATBEGINNING);
    }
    group.remove();
}