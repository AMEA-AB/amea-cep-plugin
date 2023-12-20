import pad from './pad';

export default function currentTimestamp(format: string) {
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