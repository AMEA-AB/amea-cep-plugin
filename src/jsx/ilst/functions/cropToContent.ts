/**
 * Crops the artboard of a document to its content.
 *
 * This function adjusts the size of the first artboard in the document so that it fits tightly around the content.
 *
 * @param {Document} [doc=app.activeDocument] - The document to crop. If not specified, the active document is used.
 * @returns {Document} The modified document.
 */
export default function cropToContent(doc: Document = app.activeDocument): Document {
    const artboardRect = doc.artboards[0].artboardRect
    const right = artboardRect[2];
    const bottom = artboardRect[3];
    let mostTop = bottom;
    let mostLeft = right;
    const pageItems = doc.pageItems;
    for (let i = 0; i < pageItems.length; i++) {
        const [left, top] = pageItems[i].geometricBounds;

        if (pageItems[i].typename === 'GroupItem') {
            continue;
        } else if(pageItems[i].typename === 'PathItem' && (pageItems[i] as PathItem).clipping) {
            continue
        }
            
        if (left < mostLeft) {
            mostLeft = left;
        }
        if (top > mostTop) {
            mostTop = top;
        }
    }

    doc.artboards[0].artboardRect = [mostLeft, mostTop, right, bottom];
    return doc;
}