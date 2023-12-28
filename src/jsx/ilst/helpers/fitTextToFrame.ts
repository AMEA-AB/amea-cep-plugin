// resizes text larger/smaller to fit the selected text frame(s)
// (the text frame must be fully selected; point text and non-text items are ignored)
// current limitations: this assumes all characters are same size; leading is not adjusted

const MIN_SIZE = 1, MAX_SIZE = 1296 // practical limits, in pts
const MIN_STEP = 0.1 // the smaller this is, the more precise (and slower) the fit

// Function to check if text is overflowing the frame
function hasOverflow(textFrame: TextFrame, length: number) {
    const lastLine = textFrame.lines[textFrame.lines.length - 1]
    if (!lastLine) { return true } // no lines visible (frame is too small)
    const visibleLength = (lastLine.characters[0].characterOffset + lastLine.length - 1)
    return visibleLength < length
}

// Function to fit text to frame only if it's overflowing
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

// Function to fit text to frame, even if it's not overflowing at the start
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