/**
 * Checks if the given color is a SpotColor.
 * 
 * Utilizes TypeScript's type guard feature to narrow the type from `Color` to `SpotColor`
 * by checking if the 'spot' property exists on the color object.
 * 
 * @param {Color} color - The color object to check.
 * @returns {color is SpotColor} `true` if the color is a SpotColor, otherwise `false`.
 */
export function isSpotColor(color: Color): color is SpotColor {
    return 'spot' in color;
}

/**
 * Determines if the given page item is a PathItem.
 * 
 * This function acts as a type guard, allowing TypeScript to understand that the item
 * is a PathItem if the function returns true, based on the item's typename.
 * 
 * @param {PageItem} item - The page item to check.
 * @returns {item is PathItem} `true` if the item is a PathItem, otherwise `false`.
 */
export function isPathItem(item: PageItem): item is PathItem {
    return item.typename === 'PathItem';
}

/**
 * Checks if the provided page item is a GroupItem.
 * 
 * Uses the typename property of the item to determine if it is a GroupItem,
 * serving as a type guard for TypeScript to narrow down the type.
 * 
 * @param {PageItem} item - The page item to evaluate.
 * @returns {item is GroupItem} `true` if the item is a GroupItem, otherwise `false`.
 */
export function isGroupItem(item: PageItem): item is GroupItem {
    return item.typename === 'GroupItem';
}

/**
 * Verifies if a page item is a TextFrame.
 * 
 * By examining the typename of the item, this function acts as a type guard,
 * allowing TypeScript to infer that the item is a TextFrame if the function returns true.
 * 
 * @param {PageItem} item - The page item to check.
 * @returns {item is TextFrame} `true` if the item is a TextFrame, otherwise `false`.
 */
export function isTextFrame(item: PageItem): item is TextFrame {
    return item.typename === 'TextFrame';
}