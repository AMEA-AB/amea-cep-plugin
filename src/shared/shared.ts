import config from "../../cep.config";
export const ns = config.id;

export const TemplateFlags = [
    'mirror-horizontally',
    'mirror-vertically',
    'rotate-clockwise',
    'rotate-counter-clockwise',
] as const;
