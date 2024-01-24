import { createRouter, createWebHistory } from "vue-router";
import { cepBasename } from "../lib/utils/vue-router";

import Panel from "../layouts/Panel.vue";
import MainMenu from "../components/MainMenu.vue";

import menuExtras from "./menuExtras";

const router = createRouter({
    history: createWebHistory(cepBasename),
    routes: [
        {
            path: "/extras",
            alias: "/extras/index.html",
            name: "extras",
            component: Panel,
            children: [
                {
                    path: "/extras/index.html",
                    name: "home",
                    component: MainMenu,
                    props: {
                        extraOptions: menuExtras
                    }
                }
            ]
        }
    ]
});

export default router;
