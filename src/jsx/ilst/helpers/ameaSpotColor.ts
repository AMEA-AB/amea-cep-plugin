import { createColorFromHex } from "./createColorFromHex";
import { isSpotColor } from "./typeGuards";

/**
 * Checks if a given color is an AMEA spot color.
 * 
 * An AMEA spot color is defined as a spot color whose name matches the pattern "AMEA-COLOR=".
 * This function utilizes a type guard to narrow the type from `Color` to `SpotColor` if the condition is true.
 * 
 * @param {Color} color - The color to check.
 * @returns {color is SpotColor} `true` if the color is an AMEA spot color, otherwise `false`.
 */
export function isAmeaSpotColor(color: Color): color is SpotColor{
    return color && isSpotColor(color) && /^AMEA-COLOR=/g.test(color.spot.name);
}

/**
 * Extracts the name of an AMEA spot color.
 * 
 * Given an AMEA spot color, this function splits the color's name at '=' and returns the part after it,
 * which represents the actual name of the AMEA spot color.
 * 
 * @param {SpotColor} color - The AMEA spot color.
 * @returns {string} The name of the AMEA spot color.
 * @throws {Error} Throws an error if the color is not an AMEA spot color or if the color name cannot be found in the data.
 */
export function getAmeaSpotColorName(color: SpotColor): string {
    if(!isAmeaSpotColor(color)) {
        throw new Error(`Color is not an AMEA spot color`);
    }
    return color.spot.name.split('=')[1];
}

/**
 * Retrieves the hexadecimal color value for a given AMEA spot color.
 * 
 * This function first checks if the provided color is an AMEA spot color. If it is,
 * it then attempts to find the corresponding hexadecimal color value using the color's
 * name as a key in the provided data object. If the color name is found, it returns
 * a color object created from the hexadecimal value. If any step fails, it throws an error.
 * 
 * @param {SpotColor} color - The AMEA spot color to retrieve the hex value for.
 * @param {Record<string, string>} data - An object mapping color names to their hexadecimal values.
 * @returns A color object created from the hexadecimal value of the AMEA spot color.
 * @throws {Error} Throws an error if the color is not an AMEA spot color or if the color name cannot be found in the data.
 */
export function getAmeaSpotColor(color: SpotColor, data: Record<string, string>) {
    if(!isAmeaSpotColor(color)) {
        throw new Error(`Color is not an AMEA spot color`);
    }
    let colorName = getAmeaSpotColorName(color);
    let hex = data[colorName];
    if(!hex) {
        throw new Error(`Could not find color '${colorName}'`);
    }
    return createColorFromHex(hex);
}