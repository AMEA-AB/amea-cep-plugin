import getItemsInLayer from "./getItemsInLayer";

interface GroupComponents {
    group: GroupItem;
    rectangle: PathItem;
    lockedItems: PageItem[];
    hiddenItems: PageItem[];
}

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
export default function groupAllItemsInLayer(layer: Layer): GroupComponents {
    const lockedItems = [];
    const hiddenItems = [];
    const doc = layer.parent as Document;

    const artboardRect = doc.artboards[0].artboardRect;
    const rectangle = layer.pathItems.rectangle(artboardRect[1], artboardRect[0], artboardRect[2] - artboardRect[0], artboardRect[1] - artboardRect[3]);
    rectangle.fillColor = new NoColor();

    // Unlock and unhide all items
    for(let pageItem of getItemsInLayer(layer)) {
        if (pageItem.locked) {
            lockedItems.push(pageItem);
            pageItem.locked = false;
        }
        if(pageItem.hidden) {
            hiddenItems.push(pageItem);
            pageItem.hidden = false;
        }
    }
    // Create a new group
    const group = layer.groupItems.add();

    // Move all top-level items to the new group
    for (let i = layer.pageItems.length - 1; i >= 0; i-- ) {
        const pageItem = layer.pageItems[i];
        if (pageItem !== group) {
            pageItem.move(group, ElementPlacement.INSIDE);
        }
    }

    return {
        group,
        rectangle,
        lockedItems,
        hiddenItems
    }
}

/**
 * Cleans up after grouping items in a layer. Removes the rectangle, ungroups the items, and re-locks any items that were originally locked.
 *
 * @param {GroupComponents} groupComponents - The components of the group. This includes the group to ungroup, the rectangle to remove,
 * and an array of items that were originally locked and should be re-locked.
 */
export function cleanupGroup(groupComponents: GroupComponents) {
    const { group, rectangle, lockedItems, hiddenItems } = groupComponents;
    // Remove the rectangle
    rectangle.remove();

    for (let i = group.pageItems.length - 1; i >= 0; i-- ) {
        const pageItem = group.pageItems[i];
        pageItem.move(group.parent, ElementPlacement.INSIDE);
    }
    for(let pageItem of lockedItems) {
        pageItem.locked = true;
    }
    for(let pageItem of hiddenItems) {
        pageItem.hidden = true;
    }
}