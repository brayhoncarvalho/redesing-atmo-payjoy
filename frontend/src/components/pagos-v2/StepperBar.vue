<script setup lang="ts">
interface Step {
  number: number
  label: string
}

defineProps<{
  currentStep: number
}>()

const steps: Step[] = [
  { number: 1, label: 'Forma de pago' },
  { number: 2, label: 'Registrar' },
  { number: 3, label: 'Confirmar' },
]
</script>

<template>
  <nav class="stepper" aria-label="Progreso" role="list">
    <template v-for="(step, index) in steps" :key="step.number">
      <div
        class="stepper__step"
        role="listitem"
        :aria-current="step.number === currentStep ? 'step' : undefined"
      >
        <span
          class="stepper__bubble"
          :class="{
            'stepper__bubble--active':  step.number === currentStep,
            'stepper__bubble--done':    step.number < currentStep,
            'stepper__bubble--pending': step.number > currentStep,
          }"
        >{{ step.number }}</span>
        <span
          class="stepper__label"
          :class="{
            'stepper__label--active':  step.number === currentStep,
            'stepper__label--pending': step.number > currentStep,
          }"
        >{{ step.label }}</span>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="stepper__line"
        :class="{ 'stepper__line--done': step.number < currentStep }"
        aria-hidden="true"
      />
    </template>
  </nav>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  background: #fff;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 100px;
  padding: 6px 16px;
  flex-shrink: 0;
}

.stepper__step {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stepper__bubble {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.stepper__bubble--active {
  background: #2196f3;
  color: #fff;
}

.stepper__bubble--done {
  background: #2196f3;
  color: #fff;
}

.stepper__bubble--pending {
  background: var(--color-gray-200, #e5e7eb);
  color: var(--color-gray-500, #6b7280);
}

.stepper__label {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-text-primary, #111827);
}

.stepper__label--pending {
  color: var(--color-gray-400, #9ca3af);
  font-weight: 400;
}

.stepper__line {
  width: 40px;
  height: 1px;
  background: var(--color-gray-300, #d1d5db);
  margin: 0 4px;
  flex-shrink: 0;
}

.stepper__line--done {
  background: #2196f3;
}
</style>


