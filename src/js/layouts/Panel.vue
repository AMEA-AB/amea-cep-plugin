<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const version = __VERSION__;
</script>

<template>
  <div class="panel-content">
    <div class="header d-flex justify-content-center position-relative">
      <button v-if="$route.meta.navBack !== undefined" @click="router.push($route.meta.navBack)"
        class="btn back-button position-absolute start-0">
        <i class="bi-arrow-left-circle"></i>
      </button>
      <h1 v-if="!!$route.meta.showInMenu">{{ $route.name }}</h1>
    </div>
    <router-view />
  </div>
  <div class="version-toolbar">
    v{{ version }}
  </div>
</template>

<style scoped>
.panel-content {
  box-sizing: border-box;
  margin: 6px;
  height: calc(100vh - 40px)
}

.version-toolbar {
  user-select: none;
  height: 20px;
  text-align: right;
  line-height: 20px;
  padding: 4px;
}
</style>