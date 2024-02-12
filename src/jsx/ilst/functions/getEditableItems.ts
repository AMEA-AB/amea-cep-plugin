import { includes } from '../../utils/utils';

/**
 * Checks if a page item is editable.
 * A page item is considered editable if it is not locked or hidden, and if its parent (if any) is also editable.
 *
 * @param {PageItem} item - The page item to check.
 * @returns {boolean} - Returns true if the item is editable, false otherwise.
 */
function isEditableItem(item: PageItem): boolean {
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

/**
 * Gets all editable items from the active document, optionally filtered by type.
 * An item is considered editable if it is not locked or hidden, and if its parent (if any) is also editable.
 *
 * @template T - The type of the filter.
 * @param {T[]} [filterType=[]] - An optional array of types to filter the items by.
 * @returns {Record<string, T>} - An object mapping item names to their types for all editable items.
 */
export default function getEditableItems<T extends string>(filterType: T[] = []): Record<string, T> {
    const editableItems: Record<string, T> = {};
    if(app?.activeDocument) {
        for(let i = 0; i < app.activeDocument.pageItems.length; i++) {
            const item = app.activeDocument.pageItems[i];
            if(isEditableItem(item) && (!filterType.length || includes(filterType, item.typename))) {
                editableItems[item.name] = item.typename as T;
            }
        }
    }
    
    return editableItems;
}