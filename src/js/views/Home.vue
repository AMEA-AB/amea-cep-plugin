<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const filteredRoutes = router.options.routes
  .flatMap(route => route.children || []) // Flatten the array of child routes
  .filter(childRoute => !!childRoute.meta?.showInMenu); // Filter child routes
</script>

<template>
  <div>
    <h1 style="color: red">AMEA AB</h1>
    <div class="d-grid gap-2 col-6 mx-auto">
      <button v-for="route in filteredRoutes" :key="route.name" @click="router.push(route.path)" type="button"
        class="btn btn-primary">{{ route.name }}</button>
    </div>
  </div>
</template>