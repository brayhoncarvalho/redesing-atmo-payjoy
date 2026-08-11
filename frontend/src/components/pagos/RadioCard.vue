<script setup lang="ts">
defineProps<{
  value: string
  title: string
  description: string
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label
    class="radio-card"
    :class="{ 'radio-card--selected': modelValue === value }"
  >
    <input
      type="radio"
      class="radio-card__input"
      :value="value"
      :checked="modelValue === value"
      @change="emit('update:modelValue', value)"
    />
    <span class="radio-card__dot" aria-hidden="true">
      <span v-if="modelValue === value" class="radio-card__dot-fill" />
    </span>
    <span class="radio-card__content">
      <span class="radio-card__title">{{ title }}</span>
      <span class="radio-card__desc">{{ description }}</span>
    </span>
    <slot name="trailing" />
  </label>
</template>

<style scoped>
.radio-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  background: #fff;
  flex: 1;
  user-select: none;
}

.radio-card:hover {
  border-color: var(--color-gray-300);
  background: var(--color-gray-50);
}

.radio-card--selected {
  border-color: var(--color-brand);
  background: var(--color-brand-light);
}

.radio-card__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-card__dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.radio-card--selected .radio-card__dot {
  border-color: var(--color-brand);
}

.radio-card__dot-fill {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-brand);
}

.radio-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.radio-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.radio-card__desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
