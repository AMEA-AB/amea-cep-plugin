import { CEP_Config } from "vite-cep-plugin";
import { version } from "./package.json";


const config: CEP_Config = {
  version,
  id: "com.amea.cep",
  displayName: "Amea AB",
  symlink: "local",
  port: 3000,
  servePort: 5000,
  startingDebugPort: 8860,
  extensionManifestVersion: 6.0,
  requiredRuntimeVersion: 9.0,
  hosts: [
    { name: "ILST", version: "[0.0,99.9]" }
  ],
  type: "Panel",
  iconDarkNormal: "./src/assets/light-icon.png",
  iconNormal: "./src/assets/dark-icon.png",
  iconDarkNormalRollOver: "./src/assets/light-icon.png",
  iconNormalRollOver: "./src/assets/dark-icon.png",
  parameters: ["--v=0", "--enable-nodejs", "--mixed-context"],
  width: 500,
  height: 550,

  panels: [
    {
      mainPath: "./app/index.html",
      name: "app",
      panelDisplayName: "AMEA AB",
      autoVisible: true,
      width: 400,
      height: 600,
      minWidth: 200,
      minHeight: 300,
    },
    {
      mainPath: "./server/index.html",
      name: "server",
      autoVisible: false,
      type: "Custom",
      startOnEvents: ["applicationActivate"]
    }
  ],
  build: {
    jsxBin: "off",
    sourceMap: true,
  },
  zxp: {
    country: "US",
    province: "CA",
    org: "MyCompany",
    password: "mypassword",
    tsa: "http://timestamp.digicert.com/",
    sourceMap: false,
    jsxBin: "off",
  },
  installModules: ["koa", "@koa/router", "@koa/cors"],
  copyAssets: [],
  copyZipAssets: [],
};
export default config;
