import cropClipGroup from "./cropClipGroup";
import saveDocument from "./saveDocument";
import embedImage from "./embedImage";
import { fitTextToFrameIfOverflowing } from "./fitTextToFrame";


declare global {
    const enum ElementPlacement {
        PLACEBEFORE = 'placeBefore',
    }
}

type LayerGroupOverlap = GroupItem | Layer;

const shouldEdit = (item: PageItem, data: Record<string, string>) => {
    if (item.locked || item.hidden) {
        return false;
    }
    if (!data[item.name]) {
        item.hidden = true;
        return false;
    }
    return true;
}

const placeItem = (item: PageItem, file: File) => {
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

const setFillColorOfPathItems = (pathItems: PathItem[], color: Color) => {
    for (var i = 0; i < pathItems.length; i++) {
        pathItems[i].fillColor = color;
    }
}

const setFillColorOfGroupItem = (groupItem: LayerGroupOverlap, color: Color) => {
    if (groupItem.pathItems.length > 0) {
        setFillColorOfPathItems(groupItem.pathItems, color);
    }
    for (var i = 0; i < groupItem.compoundPathItems.length; i++) {
        setFillColorOfPathItems(groupItem.compoundPathItems[i].pathItems, color);
    }
    for (var i = 0; i < groupItem.groupItems.length; i++) {
        setFillColorOfGroupItem(groupItem.groupItems[i], color);
    }
}

const getFillColorOfGroup = (groupItem: LayerGroupOverlap) => {
    if (groupItem.pathItems.length > 0) {
        return groupItem.pathItems[0].fillColor;
    } else if (groupItem.compoundPathItems.length > 0) {
        return groupItem.compoundPathItems[0].pathItems[0].fillColor;
    }
    return null;
}

const replaceSVG = (groupItem: GroupItem, file: File | string) => {
    if (typeof file === 'string') {
        file = new File(file);
    }
    const doc = app.open(file);
    const fillColor = getFillColorOfGroup(groupItem)!;
    setFillColorOfGroupItem(doc.layers[0], fillColor);
    const filename = file.name.split(".").shift();
    const pdfFile = new File(Folder.temp + '/' + filename + '.pdf');
    saveDocument(doc, pdfFile);
    doc.close();
    const placedItem = placeItem(groupItem, pdfFile);

    const embeddedItem = embedImage<GroupItem>(placedItem);
    cropClipGroup(embeddedItem);
}

const handleGroupItems = (groupItems: GroupItem[], data: Record<string, string>) => {
    const length = groupItems.length;
    for (var i = 0; i < length; i++) {
        var groupItem = groupItems[i];
        if (!groupItem.locked && !groupItem.hidden) {
            if (data[groupItem.name]) {
                replaceSVG(groupItem, data[groupItem.name]);
            } else {
                handleGroup(groupItem, data);
            }
        }
    }
}

const handleRasterItems = (rasterItems: RasterItem[], data: Record<string, string>) => {
    const length = rasterItems.length;
    for (var i = 0; i < length; i++) {
        var rasterItem = rasterItems[i];
        if (shouldEdit(rasterItem, data)) {
            var file = new File(data[rasterItem.name]);
            var placedItem = placeItem(rasterItem, file);
            embedImage(placedItem);
        }
    }
}

const handleTextFrames = (textFrames: TextFrame[], data: Record<string, string>) => {
    for (var i = 0; i < textFrames.length; i++) {
        var textFrame = textFrames[i];
        if (shouldEdit(textFrame, data)) {
            textFrame.contents = data[textFrame.name];
            if(textFrame.kind === TextType.AREATEXT) {
                fitTextToFrameIfOverflowing(textFrame);
            }
            var groupItem = textFrame.createOutline();
            groupItem.locked = true;
            i--; // Textframe is now a group item
        }
    }
}

const handleGroup = (group: LayerGroupOverlap, data: Record<string, string>) => {
    const groupItems = group.groupItems;
    handleGroupItems(groupItems, data);
    const rasterItems = group.rasterItems;
    handleRasterItems(rasterItems, data);
    const textFrames = group.textFrames;
    handleTextFrames(textFrames, data);
}

export default function populateLayer(layer: LayerGroupOverlap, data: Record<string, string>) {
    handleGroup(layer, data);
}