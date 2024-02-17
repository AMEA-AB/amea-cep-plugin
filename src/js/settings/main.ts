import { createPinia } from "pinia";
import createVueApp from "../lib/utils/create-vue-app";
import piniaJson from "../store/pinia-json";
import piniaCEP from "../store/pinia-cep";
import App from "./main.vue";

const pinia = createPinia();
pinia.use(piniaJson);
pinia.use(piniaCEP);
createVueApp(App, pinia);

