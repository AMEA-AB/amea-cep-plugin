import { includes } from '../../utils/utils';
import { getAmeaSpotColorName, isAmeaSpotColor } from '../helpers/ameaSpotColor';
import { isPathItem, isTextFrame } from "../helpers/typeGuards";

/**
 * Extracts and returns a list of unique color variable names from the active document.
 * It specifically looks for spot colors with names that match the pattern "AMEA-COLOR=",
 * indicating they are designated color variables. This function iterates through all page items
 * in the active document, checks if the item has a fill color that is a spot color matching the
 * pattern, and then extracts the variable name part of the spot color's name.
 * 
 * @returns {string[]} An array of unique color variable names found in the document.
 */
export default function getColorVariables(): string[] {
    const colorVariables: string[] = [];
    if(app?.activeDocument) {
        for(let i = 0; i < app.activeDocument.pageItems.length; i++) {
            const item = app.activeDocument.pageItems[i];
            let color: Color | undefined  = undefined;
            if(isTextFrame(item)) {
                color = item.textRange.characterAttributes.fillColor;
            }
            if(isPathItem(item)) {
                color = item.fillColor;
            }
            if(color && isAmeaSpotColor(color)) {
                const colorName = getAmeaSpotColorName(color);
                if(!includes(colorVariables, colorName)) {
                    colorVariables.push(colorName);
                }
            }
        }
    }
    
    return colorVariables;
}