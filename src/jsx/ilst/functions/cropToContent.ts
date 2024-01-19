export default function cropToContent(): void {
    const document = app.activeDocument;
    const artboardRect = document.artboards[0].artboardRect
    const right = artboardRect[2];
    const bottom = artboardRect[3];
    let mostTop = bottom;
    let mostLeft = right;
    const pageItems = document.pageItems;
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

    document.artboards[0].artboardRect = [mostLeft, mostTop, right, bottom];
}