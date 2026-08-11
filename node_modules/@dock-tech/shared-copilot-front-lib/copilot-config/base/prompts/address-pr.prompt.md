---
mode: agent
description: "Endereça comentários de revisão no PR aberto do branch atual. Lista todos os threads pendentes, pergunta quais devem ser resolvidos e aplica as correções uma a uma."
---

# Address PR — Endereçar comentários de revisão

## Workflow

1. **Verificar autenticação**
   ```bash
   gh auth status
   ```

2. **Identificar o PR do branch atual**
   ```bash
   gh pr view --json number,url,title
   ```

3. **Listar todos os review threads**
   ```bash
   gh pr view <número> --json reviews,reviewRequests
   gh api "/repos/<owner>/<repo>/pulls/<número>/comments" \
     --jq '.[] | {id, path, line, body, user: .user.login, resolved: .resolved}'
   ```

4. **Numerar e resumir os comentários para o usuário**
   Formato:
   ```
   [1] @reviewer — arquivo:linha
       "comentário"
       Ação necessária: <resumo curto>

   [2] ...
   ```

5. **Perguntar quais comentários endereçar**
   > "Quais números você quer que eu enderece? (ex: 1, 3, 5 ou 'todos')"

6. **Para cada comentário selecionado**
   - Ler o contexto do arquivo + código em volta
   - Aplicar a correção
   - Adicionar comentário de resposta no PR confirmando que foi endereçado:
     ```bash
     gh pr comment <número> --body "Endereçado em <commit/arquivo>: <explicação>"
     ```

7. **Não resolver threads automaticamente** — deixar o revisor confirmar
   (só marcar como resolvido se o usuário pedir explicitamente)

## Boas práticas

- Endereçar um comentário de cada vez para facilitar revisão
- Se um comentário for ambíguo, perguntar antes de implementar
- Preferir soluções mínimas e focadas — não refatorar além do escopo do comentário
- Se discordar da sugestão, apresentar a alternativa ao usuário antes de decidir
