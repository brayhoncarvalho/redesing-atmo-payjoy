<script setup lang="ts">
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <RouterView />
  <!-- Toast global — ao integrar ao ATMO substituir pelo <Toast> do PrimeVue -->
  <ToastContainer />
</template>
