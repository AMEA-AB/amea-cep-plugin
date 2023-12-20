export default function pad(number: number) {
    if (number < 10) {
        return '0' + number;
    } else {
        return number;
    }
}