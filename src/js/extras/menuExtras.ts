import { evalTS } from "../lib/utils/bolt"

export default {
    "Crop to content": () => evalTS("cropToContent"),
    "Mirror document": () => evalTS("mirrorDocument"),
}