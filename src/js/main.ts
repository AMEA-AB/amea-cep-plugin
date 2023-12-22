import { createApp } from "vue";
import App from "./main.vue";
import { initBolt } from "./lib/utils/bolt";
import router from "./router";

import "bootstrap/scss/bootstrap.scss";
import 'bootstrap-icons/font/bootstrap-icons.scss';

initBolt();
const app = createApp(App);
app.use(router);
app.mount("#root");
