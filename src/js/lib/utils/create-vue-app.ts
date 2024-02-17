import { Component, ComputedOptions, MethodOptions, createApp, Plugin } from "vue";
import { initBolt } from "./bolt";

import "bootstrap/scss/bootstrap.scss";
import 'bootstrap-icons/font/bootstrap-icons.scss';

export default function createVueApp(root: Component<any, any, any, ComputedOptions, MethodOptions, {}, any>, ...plugins: Plugin[]) {
    initBolt();
  
    const app = createApp(root);
    plugins.forEach(plugin => app.use(plugin));
    app.mount("#root");
    return app;
}
