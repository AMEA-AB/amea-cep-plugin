export default function cropClipGroup(clipGroup: GroupItem) {
    const layer = clipGroup.layer;
    clipGroup.selected = true;
    const groupItemsBefore: Array<GroupItem> = Array.prototype.slice.call(layer.groupItems);

    // Remove excess
    app.executeMenuCommand('OffsetPath v22');
    app.executeMenuCommand("Live Pathfinder Crop");
    app.executeMenuCommand("expandStyle");

    // Find the new group item
    var groupItem: GroupItem | undefined;
    for (var i = 0; i < layer.groupItems.length; i++) {
        var found = false;
        for (var j = 0; j < groupItemsBefore.length; j++) {
            if (groupItemsBefore[j] === layer.groupItems[i]) {
                found = true;
                break;
            }
        }
        if (found) {
            groupItem = layer.groupItems[i];
            break;
        }
    }
    if (!groupItem) {
        throw new Error("Could not find group item");
    }
    return groupItem;
}