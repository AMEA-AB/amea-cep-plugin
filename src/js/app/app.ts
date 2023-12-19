import { createApp } from "vue";
import App from "./app.vue";
import { initBolt } from "../lib/utils/bolt";
import router from "../router";

import "bootstrap/scss/bootstrap.scss";

initBolt();
const app = createApp(App);
app.use(router);
app.mount("#root");
