<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast-slide" tag="div" class="toast-container__list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="toast-item"
          :class="`toast-item--${msg.severity}`"
          role="alert"
        >
          <span class="toast-item__icon" aria-hidden="true">
            <!-- success -->
            <svg v-if="msg.severity === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
              <path d="M7 12l3.5 3.5L17 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- error -->
            <svg v-else-if="msg.severity === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <!-- warn -->
            <svg v-else-if="msg.severity === 'warn'" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L2 21h20L12 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M12 10v4M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <!-- info -->
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
          <div class="toast-item__body">
            <span class="toast-item__summary">{{ msg.summary }}</span>
            <span class="toast-item__detail">{{ msg.detail }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastState } from '@/composables/useToast'
const { messages } = useToastState()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-container__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 300px;
  max-width: 420px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--p-surface-0, #fff);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  pointer-events: all;
  border-left: 4px solid transparent;
}

.toast-item--success { border-left-color: var(--p-green-600, #16a34a); color: var(--p-green-700, #15803d); }
.toast-item--error   { border-left-color: var(--p-red-600, #dc2626);   color: var(--p-red-600, #dc2626); }
.toast-item--warn    { border-left-color: var(--p-amber-600, #d97706);  color: var(--p-amber-700, #b45309); }
.toast-item--info    { border-left-color: var(--p-sky-600, #0284c7);   color: var(--p-sky-700, #0369a1); }

.toast-item__icon { flex-shrink: 0; margin-top: 2px; }

.toast-item__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-item__summary {
  font-size: var(--p-font-size-sm, 0.8125rem);
  font-weight: 600;
  font-family: var(--font-body);
  color: inherit;
}

.toast-item__detail {
  font-size: var(--p-font-size-sm, 0.8125rem);
  font-weight: 400;
  font-family: var(--font-body);
  color: var(--p-surface-700, #374151);
  line-height: 1.4;
}

/* Transição */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-slide-enter-from { opacity: 0; transform: translateX(24px); }
.toast-slide-leave-to   { opacity: 0; transform: translateX(24px); }
</style>
