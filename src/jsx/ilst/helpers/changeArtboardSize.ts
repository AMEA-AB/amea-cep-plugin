/**
 * Changes the size of an artboard while keeping its center in the same place.
 *
 * @param {Artboard} artboard - The artboard to resize.
 * @param {number} width - The new width for the artboard.
 * @param {number} height - The new height for the artboard.
 */
export default function changeArtboardSize(artboard: Artboard, width: number, height: number) {
    const artboardRect = artboard.artboardRect;

    // Get the center of the artboard
    const centerX = artboardRect[0] + (artboardRect[2] - artboardRect[0]) / 2;
    const centerY = artboardRect[1] - (artboardRect[1] - artboardRect[3]) / 2;

    // Calculate the new position so that the center stays in the same place
    const newLeft = centerX - width / 2;
    const newTop = centerY + height / 2;

    // Set the new artboard size
    artboard.artboardRect = [newLeft, newTop, newLeft + width, newTop - height];
}