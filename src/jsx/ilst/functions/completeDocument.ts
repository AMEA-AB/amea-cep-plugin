/**
 * Applies the 'OffsetPath v22' command to all path items in the specified document.
 * 
 * This function iterates over each path item in the document, selects it, applies the
 * 'OffsetPath v22' command, and then deselects it. This is particularly useful for batch
 * processing of path items to apply specific transformations or effects that are available
 * through Illustrator's menu commands.
 * 
 * @param {Document} doc - The document whose path items will be processed. Defaults to the currently active document.
 */
export default function completeDocument(doc: Document = app.activeDocument) {
    const items = doc.pathItems;
    for(let i = 0; i < items.length; i++) {
        items[i].selected = true;
        app.executeMenuCommand('OffsetPath v22');
        items[i].selected = false;
    }
}
