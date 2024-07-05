import clipDocument from "../functions/clipDocument";
import saveDocument from "./saveDocument";
import embedImage from "./embedImage";
import { fitTextToFrameIfOverflowing } from "./fitTextToFrame";
import { getAmeaSpotColor, isAmeaSpotColor } from "./ameaSpotColor";
import completeDocument from "../functions/completeDocument";

type LayerGroupOverlap = GroupItem | Layer;

/**
 * Determines whether a page item should be edited based on its properties and the provided data.
 *
 * @param {PageItem} item - The page item to check.
 * @param {Record<string, string>} data - The data to check against.
 * @returns {boolean} - True if the item should be edited, false otherwise.
 */
function shouldEdit(item: PageItem, data: Record<string, string>): boolean {
    if (item.locked || item.hidden) {
        return false;
    }
    if (!data[item.name]) {
        item.hidden = true;
        return false;
    }
    return true;
}

/**
 * Places a file in the same position and dimensions as a given page item, then removes the original item.
 *
 * @param {PageItem} item - The page item to replace.
 * @param {File} file - The file to place.
 * @returns {PlacedItem} - The new placed item.
 */
function placeItem(item: PageItem, file: File): PlacedItem {
    const parent = item.parent as GroupItem | Layer;
    const placedItem = parent.placedItems.add();
    placedItem.file = file;
    placedItem.position = item.position;
    placedItem.width = item.width;
    placedItem.height = item.height;
    placedItem.move(item, ElementPlacement.PLACEBEFORE);
    item.remove();
    return placedItem;
}

/**
 * Sets the fill color of all path items in the given array.
 *
 * @param {PathItem[]} pathItems - The path items to set the fill color of.
 * @param {Color} color - The color to set.
 */
function setFillColorOfPathItems(pathItems: PathItem[], color: Color) {
    for (let i = 0; i < pathItems.length; i++) {
        pathItems[i].fillColor = color;
    }
}

/**
 * Sets the fill color of all path items in the given group item, including those in nested group items.
 *
 * @param {LayerGroupOverlap} groupItem - The group item to set the fill color of.
 * @param {Color} color - The color to set.
 */
function setFillColorOfGroupItem(groupItem: LayerGroupOverlap, color: Color) {
    if (groupItem.pathItems.length > 0) {
        setFillColorOfPathItems(groupItem.pathItems, color);
    }
    for (let i = 0; i < groupItem.compoundPathItems.length; i++) {
        setFillColorOfPathItems(groupItem.compoundPathItems[i].pathItems, color);
    }
    for (let i = 0; i < groupItem.groupItems.length; i++) {
        setFillColorOfGroupItem(groupItem.groupItems[i], color);
    }
}

/**
 * Gets the fill color of the first filled path item in the given group item.
 *
 * @param {LayerGroupOverlap} groupItem - The group item to get the fill color from.
 * @returns {Color | null} - The fill color of the first filled path item, or null if no filled path item is found.
 */
function getFillColorOfGroup(groupItem: LayerGroupOverlap): Color | null {
    for (let i = 0; i < groupItem.pathItems.length; i++) {
        if (groupItem.pathItems[i].filled) {
            return groupItem.pathItems[i].fillColor;
        }
    }

    for (let i = 0; i < groupItem.compoundPathItems.length; i++) {
        for (let j = 0; j < groupItem.compoundPathItems[i].pathItems.length; j++) {
            if (groupItem.compoundPathItems[i].pathItems[j].filled) {
                return groupItem.compoundPathItems[i].pathItems[j].fillColor;
            }
        }
    }

    return null;
}

/**
 * Replaces a group item with an SVG file, preserving the fill color of the group item.
 * The original group item is removed.
 *
 * @param {GroupItem} groupItem - The group item to replace.
 * @param {File | string} file - The SVG file to replace the group item with, or a string representing the path to the file.
 */
function replaceSVG(groupItem: GroupItem, file: File | string, data: Record<string, string>) {
    if (typeof file === 'string') {
        file = new File(file);
    }
    const doc = app.open(file);
    clipDocument(doc);
    completeDocument(doc);
    let fillColor = getFillColorOfGroup(groupItem);
    if (fillColor) {
        if(isAmeaSpotColor(fillColor)) {
            fillColor = getAmeaSpotColor(fillColor, data);
        }
        setFillColorOfGroupItem(doc.layers[0], fillColor);
    }

    const filename = file.name.split(".").shift()!;
    const pdfFile = new File(Folder.temp + '/' + filename + '.pdf');
    saveDocument(doc, pdfFile);
    doc.close();
    const placedItem = placeItem(groupItem, pdfFile);

    embedImage<GroupItem>(placedItem);
}

/**
 * Handles group items based on provided data. If the group item's name is a key in the data, 
 * it is replaced with an SVG. Otherwise, the group item is handled with the handleGroup function.
 *
 * @param {GroupItem[]} groupItems - The group items to handle.
 * @param {Record<string, string>} data - The data to use for handling the group items.
 */
function handleGroupItems(groupItems: GroupItem[], data: Record<string, string>) {
    const length = groupItems.length;
    for (let i = 0; i < length; i++) {
        let groupItem = groupItems[i];
        if (!groupItem.locked && !groupItem.hidden) {
            if (data[groupItem.name]) {
                replaceSVG(groupItem, data[groupItem.name], data);
            } else {
                handleGroup(groupItem, data);
            }
        }
    }
}

/**
 * Handles raster items based on provided data. If the raster item should be edited, 
 * it is replaced with a file and the image is embedded.
 *
 * @param {RasterItem[]} rasterItems - The raster items to handle.
 * @param {Record<string, string>} data - The data to use for handling the raster items.
 */
function handleRasterItems(rasterItems: RasterItem[], data: Record<string, string>) {
    const length = rasterItems.length;
    for (let i = 0; i < length; i++) {
        let rasterItem = rasterItems[i];
        if (shouldEdit(rasterItem, data)) {
            let file = new File(data[rasterItem.name]);
            let placedItem = placeItem(rasterItem, file);
            embedImage<RasterItem>(placedItem);
        }
    }
}

/**
 * Handles text frames based on provided data. If the text frame should be edited, 
 * its contents are replaced with the corresponding value from the data, and it is converted to a group item.
 *
 * @param {TextFrame[]} textFrames - The text frames to handle.
 * @param {Record<string, string>} data - The data to use for handling the text frames.
 */
function handleTextFrames(textFrames: TextFrame[], data: Record<string, string>) {
    for (let i = 0; i < textFrames.length; i++) {
        let textFrame = textFrames[i];
        if (shouldEdit(textFrame, data)) {
            textFrame.contents = data[textFrame.name];
            if(textFrame.kind === TextType.AREATEXT) {
                fitTextToFrameIfOverflowing(textFrame);
            }
            let fillColor = textFrame.textRange.characterAttributes.fillColor;
            if(isAmeaSpotColor(fillColor)) {
                let color = getAmeaSpotColor(fillColor, data);;
                textFrame.textRange.characterAttributes.fillColor = color;
            }
            let groupItem = textFrame.createOutline();
            groupItem.locked = true;
            i--; // Textframe is now a group item
        }
    }
}

/**
 * Handles a group item based on provided data. The group's group items, raster items, and text frames are each handled with their respective functions.
 *
 * @param {LayerGroupOverlap} group - The group to handle.
 * @param {Record<string, string>} data - The data to use for handling the group.
 */
function handleGroup(group: LayerGroupOverlap, data: Record<string, string>) {
    const groupItems = group.groupItems;
    handleGroupItems(groupItems, data);
    const rasterItems = group.rasterItems;
    handleRasterItems(rasterItems, data);
    const textFrames = group.textFrames;
    handleTextFrames(textFrames, data);
}

/**
 * Populates a layer based on provided data.
 *
 * @param {LayerGroupOverlap} layer - The layer to populate.
 * @param {Record<string, string>} data - The data to use for populating the layer.
 */
export default function populateLayer(layer: LayerGroupOverlap, data: Record<string, string>) {
    handleGroup(layer, data);
}