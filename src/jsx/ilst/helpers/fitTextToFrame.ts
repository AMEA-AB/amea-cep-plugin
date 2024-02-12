// resizes text larger/smaller to fit the selected text frame(s)
// (the text frame must be fully selected; point text and non-text items are ignored)
// current limitations: this assumes all characters are same size; leading is not adjusted

const MIN_SIZE = 1, MAX_SIZE = 1296 // practical limits, in pts
const MIN_STEP = 0.1 // the smaller this is, the more precise (and slower) the fit

/**
 * Checks if the text in the given text frame overflows the frame.
 *
 * @param {TextFrame} textFrame - The text frame to check.
 * @param {number} length - The length of the text.
 * @returns {boolean} - True if the text overflows the frame, false otherwise.
 */
function hasOverflow(textFrame: TextFrame, length: number): boolean {
    const lastLine = textFrame.lines[textFrame.lines.length - 1]
    if (!lastLine) { return true } // no lines visible (frame is too small)
    const visibleLength = (lastLine.characters[0].characterOffset + lastLine.length - 1)
    return visibleLength < length
}

/**
 * Adjusts the size of the text in the given text frame to fit the frame if the text is overflowing.
 * If the text is not overflowing, the size is not changed.
 *
 * @param {TextFrame} textFrame - The text frame to adjust the text size in.
 */
export function fitTextToFrameIfOverflowing(textFrame: TextFrame) {
    if (textFrame.kind === TextType.POINTTEXT) { return }
    const length = textFrame.contents.replace(/\s+$/, "").length
    if (length === 0) { return }
    const style = textFrame.textRange.characterAttributes
    let size = style.size

    if (!hasOverflow(textFrame, length)) { return } // if not overflowing, don't change the size

    while (hasOverflow(textFrame, length) && size >= MIN_SIZE * 2) {
        size /= 2.0
        style.size = size
    }

    let step = size / 2.0
    while (step > MIN_STEP) {
        step /= 2.0
        size += hasOverflow(textFrame, length) ? -step : step
        style.size = size
    }

    while (hasOverflow(textFrame, length)) {
        style.size = size - step
        step *= 1.1
    }
}

/**
 * Adjusts the size of the text in the given text frame to fit the frame.
 * The size is increased until it overflows, then it is decreased until it fits.
 *
 * @param {TextFrame} textFrame - The text frame to adjust the text size in.
 */
export function fitTextToFrameAlways(textFrame: TextFrame) {
    if (textFrame.kind === TextType.POINTTEXT) { return }
    const length = textFrame.contents.replace(/\s+$/, "").length
    if (length === 0) { return }
    const style = textFrame.textRange.characterAttributes
    let size = style.size

    while (!hasOverflow(textFrame, length) && size <= MAX_SIZE / 2) {
        size *= 2.0
        style.size = size
    }

    fitTextToFrameIfOverflowing(textFrame)
}