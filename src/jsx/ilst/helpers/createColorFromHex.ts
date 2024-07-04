/**
 * Converts a hexadecimal color code to an RGB color object.
 * 
 * @param {string} hex - The hexadecimal color code as a string. Can include the leading '#'.
 * @returns {RGBColor} An object containing the red, green, and blue components of the color.
 */
export function createColorFromHex(hex: string): RGBColor {
    hex = hex.replace(/^#/, ''); // Remove the hash at the start if it's there
    const color = new RGBColor();
    color.red = parseInt(hex.substring(0, 2), 16);
    color.green = parseInt(hex.substring(2, 4), 16);
    color.blue = parseInt(hex.substring(4, 6), 16);
    return color;
}