import cropClipGroup from "./cropClipGroup";
import saveDocument from "./saveDocument";
import embedImage from "./embedImage";

export interface RowData {
    "Ouput type": string;
    "Jig": string;
    "Template": string;
    "Order number": string;
    "Product": string;
    [key: string]: string;
}

const shouldEdit = (item: PageItem, data: RowData) => {
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
    const placedItem = item.layer.placedItems.add();
    placedItem.file = file;
    placedItem.position = item.position;
    placedItem.width = item.width;
    placedItem.height = item.height;
    return placedItem;
}

const setFillColorOfPathItems = (pathItems: PathItem[], color: Color) => {
    for (var i = 0; i < pathItems.length; i++) {
        pathItems[i].fillColor = color;
    }
}

const setFillColorOfGroupItem = (groupItem: GroupItem, color: Color) => {
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

const getFillColorOfGroup = (groupItem: GroupItem) => {
    if (groupItem.pathItems.length > 0) {
        return groupItem.pathItems[0].fillColor;
    } else if (groupItem.compoundPathItems.length > 0) {
        return groupItem.compoundPathItems[0].pathItems[0].fillColor;
    }
    return null;
}

const replaceSVG = (groupItem: GroupItem, file: File | string) => {
    if (typeof file === 'string') {
        file = File(file);
    }
    const doc = app.open(file);
    const fillColor = getFillColorOfGroup(groupItem)!;
    setFillColorOfGroupItem(doc.layers[0] as unknown as GroupItem, fillColor);
    const filename = file.name.split(".").shift();
    const pdfFile = new File(Folder.temp + '/' + filename + '.pdf');
    saveDocument(doc, pdfFile);
    doc.close();
    const placedItem = placeItem(groupItem, pdfFile);

    const embeddedItem = embedImage<GroupItem>(placedItem);
    cropClipGroup(embeddedItem);
    groupItem.remove();
}

const handleGroupItems = (groupItems: GroupItem[], data: RowData) => {
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

const handleRasterItems = (rasterItems: RasterItem[], data: RowData) => {
    const length = rasterItems.length;
    for (var i = 0; i < length; i++) {
        var rasterItem = rasterItems[i];
        if (shouldEdit(rasterItem, data)) {
            var file = File(data[rasterItem.name]);
            var placedItem = placeItem(rasterItem, file);
            embedImage(placedItem);
            rasterItem.remove();
        }
    }
}

const handleTextFrames = (textFrames: TextFrame[], data: RowData) => {
    for (var i = 0; i < textFrames.length; i++) {
        var textFrame = textFrames[i];
        if (shouldEdit(textFrame, data)) {
            textFrame.contents = data[textFrame.name];
            var groupItem = textFrame.createOutline();
            groupItem.locked = true;
            i--; // Textframe is now a group item
        }
    }
}

const handleGroup = (group: GroupItem, data: RowData) => {
    const groupItems = group.groupItems;
    handleGroupItems(groupItems, data);
    const rasterItems = group.rasterItems;
    handleRasterItems(rasterItems, data);
    const textFrames = group.textFrames;
    handleTextFrames(textFrames, data);
}

export default function populateLayer(layer: Layer, data: RowData) {
    handleGroup(layer as unknown as GroupItem, data);
}