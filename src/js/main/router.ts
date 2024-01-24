import { createRouter, createWebHistory } from "vue-router";
import { cepBasename } from "../lib/utils/vue-router";

import Panel from "../layouts/Panel.vue";

import MainMenu from "../components/MainMenu.vue";
import Generate from "./views/Generate.vue";
import Process from "./views/Process.vue";
import Jig from "./views/Jig.vue";
import ManualTemplate from "./views/ManualTemplate.vue";

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
                    component: MainMenu
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
                    path: "/process",
                    name: "process",
                    component: Process,
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
