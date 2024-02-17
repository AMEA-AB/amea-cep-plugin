import { createPinia } from "pinia";
import createVueApp from "../lib/utils/create-vue-app";
import App from "./main.vue";
import router from "./router";

const pinia = createPinia();
createVueApp(App, pinia, router);
