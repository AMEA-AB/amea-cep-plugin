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
  filetypes: {
    type: Array as () => string[],
    default: []
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue'])

const onSelectFile = async () => {
  const file = await evalTS('openFileDialogSingle', props.title, props.filetypes);
  emit('update:modelValue', file);
}

</script>

<template>
  <div class="mb-3">
    <button @click="onSelectFile" v-bind:disabled="disabled" class="btn btn-secondary">
      <span>{{ modelValue ? 'File selected' : 'Select File' }}</span>
    </button>
  </div>
</template>