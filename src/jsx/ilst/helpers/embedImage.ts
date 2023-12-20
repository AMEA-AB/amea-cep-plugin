export default function embedImage<T extends GroupItem | RasterItem>(placedItem: PlacedItem): T {
    const layer = placedItem.layer;
    const filename = placedItem.file.name;

    // Create a copy of the pageItems array before embedding
    var pageItemsBefore: Array<PageItem> = Array.prototype.slice.call(layer.pageItems);
    try {
        placedItem.embed();

        // Find the new item by comparing the pageItems array before and after embedding
        var embeddedItem;
        for (var i = 0; i < layer.pageItems.length; i++) {
            var found = false;
            for (var j = 0; j < pageItemsBefore.length; j++) {
                if (pageItemsBefore[j] === layer.pageItems[i]) {
                    found = true;
                    break;
                }
            }
            if (found) {
                embeddedItem = layer.pageItems[i] as unknown as T;
                break;
            }
        }
        if(!embeddedItem) {
            throw new Error("Could not find embedded image");
        }
        return embeddedItem;
    } catch {
        throw new Error("Could not embed image " + filename);
    }
}