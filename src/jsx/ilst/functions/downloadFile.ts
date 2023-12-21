import downloadFile from "../helpers/downloadFile";

export default (url: string): string => {
    return downloadFile(url).fsName;
}