<script setup lang="ts">
const version = __VERSION__;
</script>

<template>
  <div class="panel-content">
    <router-view />
    <div class="version-toolbar">
      v{{ version }}
    </div>
  </div>
</template>

<style>
:root {
  --version-height: 20px;
}

.panel-content {
  box-sizing: border-box;
  margin: 6px;
  height: calc(100vh - 12px)
}

.version-toolbar {
  user-select: none;
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
  box-sizing: border-box;
  letter-spacing: 0.25ch;
  background-color: var(--color-header);
  color: var(--color-checkbox-disabled);
  max-height: var(--version-height);
  font-size: 9px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 4px;
}
</style>