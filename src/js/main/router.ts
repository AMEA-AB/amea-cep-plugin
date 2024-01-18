import { createRouter, createWebHistory } from "vue-router";

import Panel from "../layouts/Panel.vue";

import Home from "./views/Home.vue";
import Generate from "./views/Generate.vue";
import Jig from "./views/Jig.vue";
import ManualTemplate from "./views/ManualTemplate.vue";

const posix = (str: string) => str.replace(/\\/g, "/");
const encodeSpaces = (str: string) => str.replace(/ /g, "%20");

const cepBasename = window.cep_node
  ? encodeSpaces(posix(window.cep_node.global.__dirname))
  : '/';

const router = createRouter({
    history: createWebHistory(cepBasename),
    routes: [
        {
            path: "/main",
            alias: "/main/index.html",
            name: "main",
            component: Panel,
            children: [
                {
                    path: "/main/index.html",
                    name: "home",
                    component: Home
                },
                {
                    path: "/generate",
                    name: "generate",
                    component: Generate,
                    meta: {
                        showInMenu: true,
                        navBack: {
                            name: "home"
                        }
                    }
                },
                {
                    path: "/jig",
                    name: "jig",
                    component: Jig,
                    meta: {
                        showInMenu: true,
                        navBack: {
                            name: "home"
                        }
                    }
                },
                {
                    path: "/jig-local",
                    name: "jig-local",
                    component: Jig,
                    props: {
                        showJigSelect: false
                    },
                    meta: {
                        showInMenu: true,
                        navBack: {
                            name: "home"
                        }
                    }
                },
                {
                    path: "/manual-template",
                    name: "manual-template",
                    component: ManualTemplate,
                    meta: {
                        showInMenu: true,
                        navBack: {
                            name: "home"
                        }
                    }
                },
                {
                    path: "/manual-template-local",
                    name: "manual-template-local",
                    component: ManualTemplate,
                    props: {
                        showTemplateSelect: false
                    },
                    meta: {
                        showInMenu: true,
                        navBack: {
                            name: "home"
                        }
                    }
                }
            ]
        }
    ]
});

export default router;
