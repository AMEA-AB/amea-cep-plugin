import { evalTS } from "../lib/utils/bolt"

export default {
    "Crop to content": () => evalTS("cropToContent"),
    "Mirror document (vertical)": () => evalTS("mirrorDocument", undefined, false),
    "Mirror document (horizontal)": () => evalTS("mirrorDocument", undefined, true),
}