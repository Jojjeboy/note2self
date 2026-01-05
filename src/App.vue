<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const route = useRoute()
</script>

<template>
  <template v-if="route.name === 'login'">
    <RouterView />
  </template>
  <MainLayout v-else>
    <RouterView />
  </MainLayout>
</template>
