/**
 * Recursively gets all items in a layer, including those inside groups.
 *
 * @param {Layer} layer - The layer to get items from.
 * @returns {PageItem[]} An array of all items in the layer.
 */
export default function getItemsInLayer(layer: Layer): PageItem[] {
    let items: PageItem[] = [];

    function addItems(pageItems: PageItems): void {
        for (let i = 0; i < pageItems.length; i++) {
            let pageItem: PageItem = pageItems[i];
            items.push(pageItem);

            // If the item is a group or compound path, add its child items
            if (pageItem.typename === 'GroupItem') {
                addItems((pageItem as GroupItem).pageItems);
            }
        }
    }

    addItems(layer.pageItems);

    return items;
}