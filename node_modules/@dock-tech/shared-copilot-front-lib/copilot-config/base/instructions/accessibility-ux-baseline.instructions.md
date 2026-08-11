---
applyTo: "src/components/**/*.vue"
description: "Baseline obrigatória de acessibilidade e usabilidade para componentes Vue: WCAG 2.2 AA e heurísticas de Nielsen em novas telas e melhorias."
---

# Guardian — Acessibilidade e Usabilidade

## Regra obrigatória

Toda criação de interface e toda melhoria em componente existente deve ser revisada com base em:
- **WCAG 2.2 nível AA** como baseline obrigatória de acessibilidade.
- **Heurísticas de Nielsen** como framework obrigatório de revisão de usabilidade.

Essas duas referências se aplicam independentemente de o modo escolhido ser Dock DS ou Figma.

## Checklist de acessibilidade
- Contraste visual adequado entre conteúdo, fundo, bordas e estados.
- Navegação por teclado funcional em todos os elementos interativos.
- Foco visível e consistente.
- HTML semântico e nomes acessíveis corretos.
- Labels, ajuda e erro associados corretamente aos campos.
- Não comunicar estado apenas por cor.
- Tamanho e acionamento de alvos interativos adequados.

## Checklist de usabilidade
- Estado do sistema sempre perceptível.
- Rótulos e fluxo alinhados com a linguagem do usuário.
- Possibilidade de corrigir, voltar, cancelar e editar com baixa fricção.
- Consistência com o design system escolhido.
- Prevenção de erro antes da correção do erro.
- Interface baseada em reconhecimento e clareza.
- Design limpo, claro e completo, sem simplificação excessiva.

## Regra de atuação
- Se identificar violação importante de acessibilidade ou usabilidade, não seguir adiante silenciosamente.
- Informar o problema, propor correção e ajustar a implementação antes de considerar a solução pronta.