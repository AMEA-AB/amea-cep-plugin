import { createRouter, createWebHistory } from "vue-router";

import Panel from "../layouts/Panel.vue";
import MainMenu from "../components/MainMenu.vue";

import menuExtras from "./menuExtras";

const posix = (str: string) => str.replace(/\\/g, "/");
const encodeSpaces = (str: string) => str.replace(/ /g, "%20");

const cepBasename = window.cep_node
  ? encodeSpaces(posix(window.cep_node.global.__dirname))
  : '/';

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
