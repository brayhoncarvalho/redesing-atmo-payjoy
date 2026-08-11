<script setup lang="ts">
interface Step {
  number: number
  label: string
}

const props = defineProps<{
  currentStep: number
}>()

const steps: Step[] = [
  { number: 1, label: 'Forma de pago' },
  { number: 2, label: 'Registrar' },
  { number: 3, label: 'Confirmar' },
]
</script>

<template>
  <div class="stepper" role="list" aria-label="Pasos del proceso">
    <template v-for="(step, index) in steps" :key="step.number">
      <!-- Nodo -->
      <div
        class="stepper__step"
        role="listitem"
        :aria-current="step.number === currentStep ? 'step' : undefined"
      >
        <div
          class="stepper__circle"
          :class="{
            'stepper__circle--done':    step.number < currentStep,
            'stepper__circle--active':  step.number === currentStep,
            'stepper__circle--pending': step.number > currentStep,
          }"
        >
          <!-- Concluído: checkmark -->
          <svg
            v-if="step.number < currentStep"
            width="14" height="14" viewBox="0 0 14 14"
            fill="none" aria-hidden="true"
          >
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-else>{{ step.number }}</span>
        </div>
        <span
          class="stepper__label"
          :class="{
            'stepper__label--active':  step.number === currentStep,
            'stepper__label--done':    step.number < currentStep,
            'stepper__label--pending': step.number > currentStep,
          }"
        >{{ step.label }}</span>
      </div>

      <!-- Linha conectora (exceto após o último) -->
      <div
        v-if="index < steps.length - 1"
        class="stepper__line"
        :class="{ 'stepper__line--done': step.number < currentStep }"
        aria-hidden="true"
      />
    </template>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 20px 0 16px;
}

.stepper__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.stepper__circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s, border-color 0.2s;
}

.stepper__circle--active {
  background: var(--color-brand);
  color: #fff;
}

.stepper__circle--done {
  background: var(--color-brand);
  color: #fff;
}

.stepper__circle--pending {
  background: #fff;
  color: var(--color-gray-400);
  border: 1.5px solid var(--color-gray-300);
}

.stepper__label {
  font-size: 12px;
  white-space: nowrap;
  margin-top: 2px;
}

.stepper__label--active {
  font-weight: 600;
  color: var(--color-text-primary);
}

.stepper__label--done {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.stepper__label--pending {
  color: var(--color-gray-400);
}

.stepper__line {
  flex: 1;
  height: 1.5px;
  background: var(--color-gray-300);
  margin-top: 15px; /* centraliza na altura do círculo */
  transition: background 0.2s;
  min-width: 40px;
}

.stepper__line--done {
  background: var(--color-brand);
}
</style>
