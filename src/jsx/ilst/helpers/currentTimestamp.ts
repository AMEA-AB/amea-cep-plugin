import pad from './pad';

/**
 * Returns the current timestamp in the specified format.
 * The format string can contain the following placeholders:
 * - 'YYYY' for the full year
 * - 'MM' for the month
 * - 'DD' for the day
 * - 'hh' for the hours
 * - 'mm' for the minutes
 * - 'ss' for the seconds
 * Each placeholder is replaced with the corresponding value from the current date and time.
 *
 * @param {string} format - The format to return the timestamp in.
 * @returns {string} - The current timestamp in the specified format.
 */
export default function currentTimestamp(format: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    format = format.replace('YYYY', year.toString());
    format = format.replace('MM', month.toString());
    format = format.replace('DD', day.toString());
    format = format.replace('hh', hours.toString());
    format = format.replace('mm', minutes.toString());
    format = format.replace('ss', seconds.toString());

    return format;
}