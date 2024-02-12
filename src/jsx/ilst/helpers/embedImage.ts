import { includes } from "../../utils/utils";

/**
 * Embeds a placed image in the document and returns the new embedded image item.
 * The function throws an error if the image cannot be embedded or if the embedded image cannot be found.
 *
 * @template T - The type of the embedded image, which must extend GroupItem or RasterItem.
 * @param {PlacedItem} placedItem - The placed image to embed.
 * @returns {T} - The new embedded image.
 * @throws {Error} - If the image cannot be embedded or if the embedded image cannot be found.
 */
export default function embedImage<T extends GroupItem | RasterItem>(placedItem: PlacedItem): T {
    const layer = placedItem.layer;
    const filename = placedItem.file.name;

    // Create a copy of the pageItems array before embedding
    let pageItemsBefore: Array<PageItem> = Array.prototype.slice.call(layer.pageItems);
    try {
        placedItem.embed();

        // Find the new item by comparing the pageItems array before and after embedding
        let embeddedItem;
        for (let i = 0; i < layer.pageItems.length; i++) {
            let found = includes<PageItem>(pageItemsBefore, layer.pageItems[i]);
            if (!found) {
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