---
applyTo: "**/*.{spec,test}.{ts,js}"
description: "Padrões de testes: unitários (Vitest), integração de componentes (Vue Test Utils), E2E (Playwright), cobertura mínima e organização."
---

# Testes — Padrões Obrigatórios

## Princípio
**Código sem teste é código que vai quebrar.** A pirâmide de testes garante confiança sem lentidão.

---

## 1. Pirâmide de Testes

| Camada | Ferramenta | Foco | Velocidade | Quantidade |
|--------|-----------|------|------------|------------|
| Unitário | Vitest | Utils, composables, stores, lógica pura | Muito rápido | Alta |
| Componente | Vitest + Vue Test Utils | Renderização, interações, props, emits | Rápido | Média |
| E2E | Playwright | Fluxos completos do usuário | Lento | Baixa (críticos) |

---

## 2. Testes Unitários (Vitest)

### Obrigatório ter testes para:
- `src/utils/*.ts` — 100% coverage (masks, validators, errorMessages, retry).
- `src/composables/*.ts` — behavior testing.
- `src/stores/*.ts` — actions, getters.
- `src/services/*.ts` — mocking de fetch, tratamento de erros.

### Organização
```
src/
  utils/
    masks.ts
    validators.ts
    __tests__/
      masks.spec.ts
      validators.spec.ts
  composables/
    useToast.ts
    __tests__/
      useToast.spec.ts
  stores/
    user.ts
    __tests__/
      user.spec.ts
```

### Padrão de escrita
```ts
import { describe, it, expect } from 'vitest'
import { maskCPF, unmaskCPF } from '../masks'

describe('maskCPF', () => {
  it('aplica máscara completa para 11 dígitos', () => {
    expect(maskCPF('41245650890')).toBe('412.456.508-90')
  })

  it('aplica máscara parcial durante digitação', () => {
    expect(maskCPF('4124')).toBe('412.4')
  })

  it('retorna vazio para input vazio', () => {
    expect(maskCPF('')).toBe('')
  })

  it('ignora caracteres não numéricos', () => {
    expect(maskCPF('412.456')).toBe('412.456')
  })
})

describe('unmaskCPF', () => {
  it('remove pontos e traço', () => {
    expect(unmaskCPF('412.456.508-90')).toBe('41245650890')
  })
})
```

### Regras
- **Describe** por função/módulo.
- **It** descritivo em português (o que faz, não como faz).
- Testar: happy path + edge cases + inputs inválidos.
- NÃO testar implementação interna — testar comportamento.
- NÃO usar `any` em testes — tipar mocks.

---

## 3. Testes de Componente (Vue Test Utils)

### Quando usar
- Componentes com lógica condicional (v-if, computed).
- Componentes com interação (click, input, submit).
- Componentes que emitem eventos.
- Componentes com slots ou props complexas.

### Padrão
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PropostaScreen from '../PropostaScreen.vue'

describe('PropostaScreen', () => {
  it('exibe erro de CPF inválido no blur', async () => {
    const wrapper = mount(PropostaScreen)
    const cpfInput = wrapper.find('[data-testid="cpf-input"]')

    await cpfInput.setValue('111.111.111-11')
    await cpfInput.trigger('blur')

    expect(wrapper.find('[data-testid="cpf-error"]').text())
      .toContain('CPF inválido')
  })

  it('desabilita botão durante submit', async () => {
    const wrapper = mount(PropostaScreen)
    // ... preencher campos válidos
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('[data-testid="submit-btn"]').attributes('disabled'))
      .toBeDefined()
  })
})
```

### Regras
- Usar `data-testid` para selecionar elementos (não classes CSS que podem mudar).
- Não testar estilos — testar comportamento e conteúdo.
- Montar com mocks de dependências externas (stores, services).
- Testar acessibilidade: `role`, `aria-*`, label association.

---

## 4. Testes E2E (Playwright)

### Quando usar
- Fluxos críticos de negócio (cadastro completo, simulação, proposta).
- Navegação entre telas (stepper, rotas).
- Integração com APIs reais em ambiente de teste.

### Estrutura
```
e2e/
  fixtures/
    test-data.ts              — dados de teste reutilizáveis
  pages/
    simulador.page.ts         — Page Object Model
    proposta.page.ts
  tests/
    simulacao-completa.spec.ts
    cadastro-fluxo.spec.ts
    navegacao.spec.ts
  playwright.config.ts
```

### Page Object Model
```ts
// e2e/pages/simulador.page.ts
import { type Page, type Locator } from '@playwright/test'

export class SimuladorPage {
  readonly page: Page
  readonly sliderValue: Locator
  readonly btnIncrease: Locator
  readonly btnDecrease: Locator
  readonly parcelas: Locator

  constructor(page: Page) {
    this.page = page
    this.sliderValue = page.getByTestId('slider-value')
    this.btnIncrease = page.getByRole('button', { name: '+' })
    this.btnDecrease = page.getByRole('button', { name: '−' })
    this.parcelas = page.getByTestId('parcelas-list')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.getByText('Simule seu empréstimo').waitFor()
  }

  async setValor(clicks: number) {
    for (let i = 0; i < clicks; i++) {
      await this.btnIncrease.click()
    }
  }

  async selectParcela(index: number) {
    await this.parcelas.locator(`[data-testid="parcela-${index}"]`).click()
  }
}
```

### Teste E2E
```ts
// e2e/tests/simulacao-completa.spec.ts
import { test, expect } from '@playwright/test'
import { SimuladorPage } from '../pages/simulador.page'

test.describe('Fluxo de Simulação', () => {
  test('usuário ajusta valor e seleciona parcela', async ({ page }) => {
    const simulador = new SimuladorPage(page)
    await simulador.goto()

    await simulador.setValor(5)
    const valor = await simulador.sliderValue.textContent()
    expect(valor).not.toBe('R$ 1.000,00') // valor mudou

    await simulador.selectParcela(2)
    // verificar estado visual de seleção
    const selected = page.getByTestId('parcela-2')
    await expect(selected).toHaveAttribute('aria-selected', 'true')
  })
})
```

### Regras E2E
- Usar Page Object Model (POM) — nunca selectors hardcoded no teste.
- Rodar contra ambiente local (`vite preview`) ou ambiente de dev.
- Testes E2E NÃO substituem unitários — são complemento para fluxos críticos.
- Máximo 10-15 testes E2E por projeto (apenas fluxos principais).
- Usar `data-testid` para locators estáveis.
- Testes devem ser independentes (não depender de ordem).

---

## 5. Testes de Acessibilidade (axe-core)

### Integrado com Vitest
```ts
// src/components/__tests__/a11y.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Acessibilidade', () => {
  it('HeroSection não tem violations', async () => {
    const wrapper = mount(HeroSection)
    const results = await axe(wrapper.element)
    expect(results).toHaveNoViolations()
  })
})
```

### Integrado com Playwright
```ts
// e2e/tests/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('página inicial sem violations de acessibilidade', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  expect(results.violations).toEqual([])
})
```

---

## 6. Coverage — Thresholds Mínimos

```ts
// vitest.config.ts — coverage config
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        'src/utils/**': { statements: 95, branches: 90, functions: 95, lines: 95 },
        'src/composables/**': { statements: 80, branches: 75, functions: 80, lines: 80 },
        'src/stores/**': { statements: 80, branches: 75, functions: 80, lines: 80 },
        'src/services/**': { statements: 70, branches: 65, functions: 70, lines: 70 },
      },
    },
  },
})
```

### Thresholds por camada
| Camada | Coverage Mínimo |
|--------|----------------|
| Utils (masks, validators) | 95% |
| Composables | 80% |
| Stores | 80% |
| Services | 70% |
| Componentes | Sem threshold (a11y + behavior) |

---

## 7. Scripts de Teste

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:a11y": "vitest run src/components/__tests__/a11y.spec.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Anti-Patterns (NUNCA fazer)

❌ Testar implementação interna (private methods, state interno)
❌ Testes que dependem de ordem de execução
❌ Selecionar elementos por classe CSS em testes (usar data-testid)
❌ Testes E2E para toda feature (apenas fluxos críticos)
❌ Ignorar erros em testes (catch vazio, expect sem assertion)
❌ Mocks que nunca são verificados
❌ Testes lentos no unitário (> 100ms por test)
❌ Skip de testes falhando em vez de corrigir
