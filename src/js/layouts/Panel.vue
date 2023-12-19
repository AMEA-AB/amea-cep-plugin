<script setup lang="ts">
const version = __VERSION__;
</script>

<template>
  <div class="panel-content">
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