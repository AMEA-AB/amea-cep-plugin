<script setup lang="ts">
import { useSettingsStore } from '../store';

import FolderInput from '../components/FolderInput.vue';

const settingsStore = useSettingsStore();
</script>

<template>
  <form class="p-3">
    <div class="mb-3">
      <label for="outputFolder">Output folder</label>
      <FolderInput id="outputFolder" v-model="settingsStore.settings.outputFolder" title="Select output folder">
      </FolderInput>
    </div>
    <fieldset class="border p-3">
      <legend>GitHub</legend>
      <div class="row mb-3">
        <div class="col">
          <label for="githubOwner" class="form-label">Owner</label>
          <input v-model="settingsStore.settings.githubOwner" id="githubOwner" type="text" class="form-control">
        </div>
        <div class="col">
          <label for="githubRepo" class="form-label">Repository</label>
          <input v-model="settingsStore.settings.githubRepo" id="githubRepo" type="text" class="form-control">
        </div>
      </div>
      <div class="row mb-3">
        <div class="col">
          <label for="githubBranch" class="form-label">Branch</label>
          <input v-model="settingsStore.settings.githubBranch" id="githubBranch" type="text" class="form-control">
        </div>
        <div class="col">
          <label for="githubToken" class="form-label">Token</label>
          <input v-model="settingsStore.settings.githubToken" id="githubToken" type="text" class="form-control">
        </div>
      </div>
    </fieldset>
    <div class="form-check mb-3">
      <label class="form-check-label" for="advancedMode">
        Advanced mode
      </label>
      <input v-model="settingsStore.settings.advancedMode" class="form-check-input" type="checkbox" value=""
        id="advancedMode">
    </div>
  </form>
</template>

<style scoped>
fieldset, legend {
   all: revert;
}
</style>