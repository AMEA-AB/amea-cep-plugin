<script setup lang="ts">
import { evalTS } from '../lib/utils/bolt';

const props = defineProps({
  modelValue: {
    type: String,
    default: undefined
  },
  title: {
    type: String,
    default: 'Select files'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue'])

const onSelectFolder = async () => {
  const folder = await evalTS('openFolderDialog', props.title);
  emit('update:modelValue', folder);
}

</script>

<template>
  <div>
    <button @click="onSelectFolder" v-bind:disabled="disabled" class="btn btn-secondary">
      <span>{{ modelValue ? 'Folder selected' : 'Select Folder' }}</span>
    </button>
  </div>
</template>