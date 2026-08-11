---
applyTo: "src/**/*.vue"
description: "Regras obrigatórias para campos de formulário: máscaras em tempo real, validações com feedback inline, estrutura de utils reutilizáveis."
---

# Formulários — Máscaras, Validações e Feedback

## Princípio
Todo campo de formulário DEVE ter máscara e validação adequadas ao tipo de dado.
**Nenhum campo pode ser "só texto"** quando o dado possui formato conhecido.

---

## Máscaras Obrigatórias por Tipo

| Tipo de dado        | Máscara / Formato                        | Exemplo              |
|---------------------|------------------------------------------|----------------------|
| CPF                 | `000.000.000-00`                         | `412.456.508-90`     |
| CNPJ                | `00.000.000/0000-00`                     | `13.370.835/0001-85` |
| CPF/CNPJ (auto)     | Detectar pelo comprimento e alternar     | Auto                 |
| Data                | `DD/MM/AAAA` ou `<input type="date">`    | `29/05/2000`         |
| Valor monetário BRL | `R$ 0.000,00`                            | `R$ 69.000,00`       |
| Telefone            | `(00) 00000-0000` ou `(00) 0000-0000`    | `(63) 95448-9531`    |
| CEP                 | `00000-000`                              | `06460-000`          |

---

## Regras de Implementação

1. **Funções puras** — Criar em `src/utils/masks.ts` e `src/utils/validators.ts`.
2. **Máscara em tempo real** — Formatar ao digitar via `@input`.
3. **Valor formatado ≠ valor limpo** — Armazenar internamente sem máscara (só dígitos).
4. **Não bloquear campo** — Usuário pode apagar e redigitar sem travamentos.
5. **CPF/CNPJ** — Máscara progressiva + validação módulo 11 no submit.
6. **Data** — Usar `<input type="date">` nativo como seletor. Exibir formatado DD/MM/AAAA.
7. **Monetário BRL** — Prefixo `R$`, pontos milhar, vírgula centavos. Só números.
8. **Telefone** — Detectar celular (9 dígitos) vs fixo (8 dígitos) automaticamente.
9. **Reatividade** — Campos DEVEM usar `v-model` ou `:value` + `@input` para binding reativo.

---

## Validações Antes de Submit

1. **Campos obrigatórios** — Erro inline abaixo do campo. Texto vermelho `#dc3545`, 12px.
2. **CPF inválido** — Módulo 11. Rejeitar dígitos iguais (111.111.111-11).
3. **CNPJ inválido** — Dígitos verificadores.
4. **Data inválida** — Verificar existência (30/02 = inválido). Idade mínima 18 para nascimento.
5. **Valor monetário** — Maior que zero. Respeitar min/max configurados.
6. **Nome** — Mínimo 3 caracteres, não permitir apenas espaços.
7. **Feedback visual** — Borda vermelha (`border-color: #dc3545`) no campo com erro.
8. **Timing** — Mostrar erro após blur ou ao tentar submeter.
9. **Submit** — Não desabilitar botão, mas impedir envio se houver erros.

---

## Testes Obrigatórios

- Todo composable de máscara DEVE ter testes unitários em `src/utils/__tests__/`.
- Testar: aplicação, remoção (valor limpo), casos limite, validação check-digits.
- Rodar `npm run test` antes de considerar feature completa.

---

## Estrutura de Arquivos

```
src/utils/
├── masks.ts              — maskCPF, maskCNPJ, maskDate, maskCurrency, maskPhone, maskCEP
├── validators.ts         — validateCPF, validateCNPJ, validateDate, validateRequired, etc.
└── __tests__/
    ├── masks.spec.ts
    └── validators.spec.ts
```
