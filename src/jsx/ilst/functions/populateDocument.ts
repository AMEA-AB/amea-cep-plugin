import populateLayer from "../helpers/populateLayer";

export default function populateDocument(data: Record<string, string>) {
    const doc = app.activeDocument;
    const layers = doc.layers;
    const length = layers.length;
    for (var i = 0; i < length; i++) {
        var layer = layers[i];
        populateLayer(layer, data);
    }
}