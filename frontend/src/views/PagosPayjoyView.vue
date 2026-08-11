<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import StepperBar from '@/components/pagos/StepperBar.vue'
import Step1FormaDepago from '@/components/pagos/Step1FormaDepago.vue'
import Step2Registrar from '@/components/pagos/Step2Registrar.vue'
import { defineAsyncComponent } from 'vue'
import { usePagosPayjoy } from '@/composables/usePagosPayjoy'

// Carregamento sob demanda — só baixa o bundle quando chega no Step3/Modal
const Step3Confirmar   = defineAsyncComponent(() => import('@/components/pagos/Step3Confirmar.vue'))
const ConfirmacionModal = defineAsyncComponent(() => import('@/components/pagos/ConfirmacionModal.vue'))

const { currentStep, resetFluxo } = usePagosPayjoy()
onMounted(() => resetFluxo())
</script>

<template>
  <AppLayout>
    <!-- Cabeçalho -->
    <div class="pj-header">
      <h1 class="pj-header__title">Registrar nuevo pago</h1>
      <p class="pj-header__subtitle">
        Completa los pasos para realizar el pago de un financiamiento.
      </p>
    </div>

    <!-- Stepper -->
    <div class="pj-stepper-wrap">
      <StepperBar :current-step="currentStep" />
    </div>

    <!-- Conteúdo do passo atual -->
    <Transition name="step-fade">
      <Step1FormaDepago v-if="currentStep === 1" key="step1" />
      <Step2Registrar   v-else-if="currentStep === 2" key="step2" />
      <Step3Confirmar   v-else key="step3" />
    </Transition>
    <!-- Modal de confirmação da transação -->
    <ConfirmacionModal />

  </AppLayout>
</template>

<style scoped>
.pj-header {
  margin-bottom: 20px;
}

.pj-header__title {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--color-gray-900);
  margin-bottom: 4px;
}

.pj-header__subtitle {
  font-size: 13px;
  color: var(--color-brand);
  font-weight: 300;
}

.pj-stepper-wrap {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0 32px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
  max-width: 70%;
  margin-left: auto;
  margin-right: auto;
}

/* Transição entre steps — CSS global necessário (classes aplicadas ao root do componente filho) */

/* ── Toast de sucesso ── */
.pj-toast {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #d1fae5;
  border-radius: 10px;
  padding: 12px 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  min-width: 220px;
}

.pj-toast__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pj-toast__text {
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-body);
  color: #166534;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
