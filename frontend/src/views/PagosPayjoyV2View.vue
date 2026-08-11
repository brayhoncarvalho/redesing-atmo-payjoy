<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import StepperBar from '@/components/pagos-v2/StepperBar.vue'
import Step1FormaDepago from '@/components/pagos-v2/Step1FormaDepago.vue'
import Step2Registrar from '@/components/pagos-v2/Step2Registrar.vue'
import { usePagosPayjoy } from '@/composables/usePagosPayjoy'

const Step3Confirmar   = defineAsyncComponent(() => import('@/components/pagos-v2/Step3Confirmar.vue'))
const ConfirmacionModal = defineAsyncComponent(() => import('@/components/pagos-v2/ConfirmacionModal.vue'))

const { currentStep, resetFluxo } = usePagosPayjoy()
onMounted(() => resetFluxo())
</script>

<template>
  <AppLayout>
    <div class="pagos-view">
      <div class="pagos-view__header">
        <div class="pagos-view__header-left">
          <h1 class="pagos-view__title">Registrar nuevo pago</h1>
          <p class="pagos-view__subtitle">Completá los 3 pasos para registrar el pago de un financiamiento.</p>
        </div>
        <StepperBar :current-step="currentStep" />
      </div>

      <div class="pagos-view__content">
        <Transition name="step-fade">
          <Step1FormaDepago v-if="currentStep === 1" key="step1" />
          <Step2Registrar   v-else-if="currentStep === 2" key="step2" />
          <Step3Confirmar   v-else-if="currentStep === 3" key="step3" />
        </Transition>
      </div>

      <ConfirmacionModal />
    </div>
  </AppLayout>
</template>

<style scoped>
.pagos-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 8px 40px;
}

.pagos-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pagos-view__header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pagos-view__title {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-heading, inherit);
  color: var(--color-gray-900, #111827);
  margin: 0;
}

.pagos-view__subtitle {
  font-size: 14px;
  color: var(--color-text-muted, #6b7280);
  margin: 0;
}

.pagos-view__content {
  position: relative;
}
</style>
