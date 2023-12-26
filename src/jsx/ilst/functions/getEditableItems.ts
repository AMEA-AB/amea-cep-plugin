function isEditableItem(item: PageItem) {
    if (item.locked || item.hidden) {
        return false;
    }

    // If the item has a parent, check if the parent is editable
    if (item.parent) {
        return isEditableItem(item.parent as PageItem);
    }

    // If the item doesn't have a parent, or if the parent is editable, the item is editable
    return true;
}

export default function getEditableItems<T extends string>(filterType: T[] = []): Record<string, T> {
    const editableItems: Record<string, T> = {};
    if(app?.activeDocument) {
        for(let i = 0; i < app.activeDocument.pageItems.length; i++) {
            const item = app.activeDocument.pageItems[i];
            if(isEditableItem(item) && (!filterType.length || Array.includes(filterType, item.typename))) {
                editableItems[item.name] = item.typename as T;
            }
        }
    }
    
    return editableItems;
}