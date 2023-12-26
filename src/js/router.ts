import { createRouter, createWebHistory } from "vue-router";

import Panel from "./layouts/Panel.vue";

import Home from "./views/Home.vue";
import Generate from "./views/Generate.vue";
import Jig from "./views/Jig.vue";
import ManualTemplate from "./views/ManualTemplate.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/app/",
            alias: "/app/index.html",
            name: "app",
            component: Panel,
            children: [
                {
                    path: "",
                    name: "home",
                    component: Home
                },
                {
                    path: "/generate",
                    name: "generate",
                    component: Generate,
                    meta: {
                        showInMenu: true,
                        navBack: "/app/"
                    }
                },
                {
                    path: "/jig",
                    name: "jig",
                    component: Jig,
                    meta: {
                        showInMenu: true,
                        navBack: "/app/"
                    }
                },
                {
                    path: "/manual-template",
                    name: "manual-template",
                    component: ManualTemplate,
                    meta: {
                        showInMenu: true,
                        navBack: "/app/"
                    }
                }
            ]
        }
    ]
});

export default router;
