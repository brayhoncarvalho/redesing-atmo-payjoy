---
applyTo: "src/**/*.vue"
description: "Regras de interatividade: todo componente interativo deve funcionar de verdade, não ser apenas visual. Sliders, botões, seleções e cálculos em tempo real."
---

# Interatividade — Regras Obrigatórias

## Princípio
**Todo componente interativo DEVE funcionar**, não apenas parecer visual.
Se parece clicável, DEVE ser clicável. Se parece arrastável, DEVE ser arrastável.

---

## Regras por Tipo de Componente

### Sliders / Range Inputs
- USAR `<input type="range">` nativo estilizado — usuário DEVE conseguir arrastar.
- Botões +/- DEVEM alterar o state reativo.
- **Posição:** botão `-` (decrementar) à ESQUERDA, `+` (incrementar) à DIREITA.
- **NUNCA inverter** a posição dos botões +/-.
- Valor exibido DEVE atualizar em tempo real ao arrastar.

### Botões de Ação
- Botões DEVEM ter handler (`@click`) que produz efeito visível.
- Botões de navegação DEVEM navegar.
- Botões de submit DEVEM validar + enviar (ou mostrar erros).

### Seleção de Opções (Parcelas, Planos, etc.)
- Clicar DEVE alterar state e refletir visualmente (selecionado vs normal).
- Estado selecionado DEVE ter estilo diferenciado claro.
- Apenas UMA opção selecionada por vez (single select).

### Valores Calculados
- Parcela mensal, taxa, total — DEVEM atualizar em tempo real conforme inputs mudam.
- Usar `computed()` ou `watch()` do Vue para reatividade.
- Nunca mostrar valor estático quando depende de input do usuário.

### Formulários
- Todo input DEVE ter `v-model` conectado a state reativo.
- Validação em tempo real (blur) + no submit.
- Feedback visual claro (borda, mensagem inline).

---

## Anti-Patterns (NUNCA fazer)

❌ Criar slider que é apenas uma imagem/div estática
❌ Botão sem @click handler
❌ Lista de opções sem estado de seleção
❌ Valor "R$ 1.234,00" hardcoded que nunca muda
❌ Input sem v-model
❌ Componente que "parece" interativo mas é decorativo
