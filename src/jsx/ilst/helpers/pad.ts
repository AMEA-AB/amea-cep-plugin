/**
 * Pads a number with a leading zero if it is less than 10.
 *
 * @param {number} number - The number to pad.
 * @returns {string | number} - The padded number as a string if it is less than 10, otherwise the original number.
 */
export default function pad(number: number): string | number {
    if (number < 10) {
        return '0' + number;
    } else {
        return number;
    }
}