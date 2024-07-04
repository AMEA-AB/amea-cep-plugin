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
 */
export function getAmeaSpotColorName(color: SpotColor): string {
    return color.spot.name.split('=')[1];
}