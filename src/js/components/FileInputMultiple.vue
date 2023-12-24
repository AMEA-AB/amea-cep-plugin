<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { evalTS } from '../lib/utils/bolt';

const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    default: () => []
  },
  title: {
    type: String,
    default: 'Select files'
  },
  filetypes: {
    type: Array as () => string[],
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue'])

const onSelectFiles = async () => {
  const files = await evalTS('openFileDialogMultiple', props.title, props.filetypes);
  emit('update:modelValue', files);
}

</script>

<template>
  <div class="mb-3">
    <button @click="onSelectFiles" v-bind:disabled="disabled" class="btn btn-secondary">
      <span>{{ modelValue.length > 0 ? `${modelValue.length} file(s) selected` : 'Select Files' }}</span>
    </button>
  </div>
</template>