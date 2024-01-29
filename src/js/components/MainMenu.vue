<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../store';
import type { RouteRecordRaw } from 'vue-router';

const settingsStore = useSettingsStore();

const props = defineProps({
  title: {
    type: String,
    default: 'AMEA AB'
  },
  extraOptions: {
    type: Object as () => Record<string, () => any>,
    default: () => {}
  }
});

const router = useRouter()

const filteredRoutes = computed(() => {
  return router.options.routes
    .flatMap(route => route.children || []) // Flatten the array of child routes
    .filter(childRoute => {
      if(!childRoute.meta?.showInMenu) {
        return false;
      }
      if(childRoute.meta?.advanced && !settingsStore.settings.advancedMode) {
        return false;
      }
      return true;
    }); // Filter child routes
});


const menuTitle = (route: RouteRecordRaw) => {
  if(!route.name) {
    return route.path;
  }
  let routeName = route.name.toString();
  routeName = routeName.replaceAll('-', ' ');
  routeName = routeName.charAt(0).toUpperCase() + routeName.slice(1);
  return routeName;
}
</script>

<template>
  <div>
    <h1 style="color: red">{{ props.title }}</h1>
    <div class="d-grid gap-2 col-6 mx-auto">
      <button
        v-for="route in filteredRoutes"
        :key="route.name"
        @click="router.push(route.path)"
        type="button"
        class="btn btn-primary"
      >{{ menuTitle(route) }}</button>
      <button
        v-for="(callback, title) in props.extraOptions"
        :key="title"
        @click="callback"
        type="button"
        class="btn btn-primary"
      >{{ title }}</button>
    </div>
  </div>
</template>