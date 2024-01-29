import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaJson from "../store/pinia-json";
import piniaCEP from "../store/pinia-cep";
import App from "./main.vue";
import { initBolt } from "../lib/utils/bolt";
import router from "./router";

import "bootstrap/scss/bootstrap.scss";
import 'bootstrap-icons/font/bootstrap-icons.scss';

initBolt();
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaJson);
pinia.use(piniaCEP);
app.use(pinia);
app.use(router);
app.mount("#root");
