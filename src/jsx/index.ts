// @include './lib/json2.js'

import { ns } from "../shared/shared";

import * as ilst from "./ilst/ilst";

//@ts-ignore
const host = typeof $ !== "undefined" ? $ : window;

switch (BridgeTalk.appName as ApplicationName) {
  case "illustrator":
  case "illustratorbeta":
    host[ns] = ilst;
    break;
}

export type Scripts = typeof ilst

// https://extendscript.docsforadobe.dev/interapplication-communication/bridgetalk-class.html?highlight=bridgetalk#appname
type ApplicationName =
  | "aftereffects"
  | "aftereffectsbeta"
  | "ame"
  | "amebeta"
  | "audition"
  | "auditionbeta"
  | "bridge"
  | "bridgebeta"
  // | "flash"
  | "illustrator"
  | "illustratorbeta"
  | "indesign"
  | "indesignbeta"
  // | "indesignserver"
  | "photoshop"
  | "photoshopbeta"
  | "premierepro"
  | "premiereprobeta";
