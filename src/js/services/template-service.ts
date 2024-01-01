import FileService from "./file-service";

export default new class TemplateService {
    public getTemplateUrl (templateName: string) {
        const url = "https://cdn.ameaab.se/illustrator-templates/" + encodeURIComponent(templateName);
        return url;
    }

    public downloadTemplate(templateName: string) {
        const url = this.getTemplateUrl(templateName);
        return FileService.downloadFile(url);
    }
}