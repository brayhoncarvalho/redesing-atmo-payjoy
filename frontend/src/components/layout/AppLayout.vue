<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar: colapsável à esquerda -->
    <AppSidebar />

    <!-- Área direita: topbar + conteúdo empilhados verticalmente -->
    <div class="app-layout__content-wrapper">
      <AppTopbar />
      <main class="app-layout__main" id="main-content" tabindex="-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: var(--color-bg-app);
  overflow: hidden;
}

.app-layout__content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.app-layout__main {
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
  min-width: 0;
}
</style>
