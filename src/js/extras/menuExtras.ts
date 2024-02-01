import { evalTS } from "../lib/utils/bolt"

export default {
    "Crop to content": () => evalTS("cropToContent"),
    "Rotate document (clockwise)": () => evalTS("rotateDocument"),
    "Rotate document (counter clockwise)": () => evalTS("rotateDocument", undefined, true),
    "Mirror document (vertical)": () => evalTS("mirrorDocument", undefined, false),
    "Mirror document (horizontal)": () => evalTS("mirrorDocument", undefined, true),
}