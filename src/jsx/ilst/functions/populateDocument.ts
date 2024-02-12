import populateLayer from "../helpers/populateLayer";

/**
 * Populates the layers of the active document with the provided data.
 *
 * @param {Record<string, string>} data - The data to populate the layers with.
 */
export default function populateDocument(data: Record<string, string>) {
    const doc = app.activeDocument;
    const layers = doc.layers;
    const length = layers.length;
    for (var i = 0; i < length; i++) {
        var layer = layers[i];
        populateLayer(layer, data);
    }
}