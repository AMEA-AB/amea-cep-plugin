import getItemsInLayer from "./getItemsInLayer";

/**
 * Groups all items in a given layer into a single group. If an item is locked, it is unlocked before grouping.
 * A invisible rectangle is created to make the group the same size as the artboard.
 *
 * @param {Layer} layer - The layer whose items should be grouped.
 * @returns {Object} An object containing the new group, the rectangle, and an array of items that were originally locked.
 * @returns {GroupItem} .group - The new group containing all items from the layer.
 * @returns {PathItem} .rectangle - The rectangle covering the entire artboard.
 * @returns {Array<PageItem>} .lockedItems - An array of items that were originally locked.
 */
export default function groupAllItemsInLayer(layer: Layer) {
    app.selection = null;
    const lockedItems = [];
    const doc = layer.parent as Document;

    const artboardRect = doc.artboards[0].artboardRect;
    const rectangle = layer.pathItems.rectangle(artboardRect[1], artboardRect[0], artboardRect[2] - artboardRect[0], artboardRect[1] - artboardRect[3]);
    rectangle.fillColor = new NoColor();

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

    return {
        group,
        rectangle,
        lockedItems
    }
}

/**
 * Cleans up after grouping items in a layer. Removes the rectangle, ungroups the items, and re-locks any items that were originally locked.
 *
 * @param {GroupItem} group - The group to ungroup.
 * @param {PathItem} rectangle - The rectangle to remove.
 * @param {Array<PageItem>} lockedItems - An array of items that were originally locked and should be re-locked.
 */
export function cleanupGroup(group: GroupItem, rectangle: PathItem, lockedItems: PageItem[]) {
    // Remove the rectangle
    rectangle.remove();

    group.selected = true;
    // Move all items back to the layer
    app.executeMenuCommand("ungroup");
    for(let pageItem of lockedItems) {
        pageItem.locked = true;
    }
}