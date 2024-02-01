import { mirrorDocument } from "../functions/mirror";
import rotateDocument from "../functions/rotateDocument";

import type { TemplateFlag } from "../../../shared/types";

/**
 * Applies a set of template flags to a document.
 *
 * @param {Document} doc - The document to apply the flags to.
 * @param {TemplateFlag[]} flags - The flags to apply. Each flag should be one of the following:
 * - 'mirror-horizontally': Mirrors the document horizontally.
 * - 'mirror-vertically': Mirrors the document vertically.
 * - 'rotate-clockwise': Rotates the document 90 degrees clockwise.
 * - 'rotate-counter-clockwise': Rotates the document 90 degrees counter-clockwise.
 * @returns {Document} The modified document.
 * @throws {Error} If an unknown flag is passed.
 */
export default function applyTemplateFlags(doc: Document, flags: TemplateFlag[]): Document {
    for (const flag of flags) {
        switch (flag) {
            case 'mirror-horizontally':
                mirrorDocument(doc, true);
                break;
            case 'mirror-vertically':
                mirrorDocument(doc, false);
                break;
            case 'rotate-clockwise':
                rotateDocument(doc);
                break;
            case 'rotate-counter-clockwise':
                rotateDocument(doc, true);
                break;
            default:
                throw new Error("Unknown template flag " + flag);
        }
    }
    return doc;
}