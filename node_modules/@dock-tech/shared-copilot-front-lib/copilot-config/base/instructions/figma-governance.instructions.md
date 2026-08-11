---
applyTo: "**/{dock-ds.config.json,figma-node-data.json,.env*,dock.yaml}"
description: "Governança de acesso Figma: credenciais, ownership de arquivos, permissões por papel, service account para CI e convenções de sync."
---

# Figma — Governança de Acesso e Sincronização

## Princípio
**Um arquivo Figma oficial, um owner claro, credenciais nunca compartilhadas.** O DS vive no Figma como intenção visual; o frontend é a implementação técnica autoritativa.

## Escopo desta instrução
Esta governança se aplica apenas quando o projeto usa **arquivo Figma real** como origem operacional.

- Se a tarefa usa apenas **print, screenshot ou referência visual externa** (por exemplo, um dashboard visto na internet), **não** é necessário `figma:check`, `figma:sync`, token ou `dock-ds.config.json`.
- Nesses casos, tratar a imagem como referência visual e seguir as regras de fidelidade/revisão visual normalmente.
- O preflight e o sync passam a ser obrigatórios somente quando houver dependência do **arquivo Figma real**: file id, node id, frame específico, tokens via API ou sync oficial do projeto.

---

## 1. Modelo de Acesso — Papéis

| Papel | Permissão Figma | Token pessoal? | Pode rodar sync local? | Pode rodar sync CI? |
|-------|-----------------|----------------|------------------------|---------------------|
| **Designer DS** | Editor | Não necessário | Não | Não |
| **Dev frontend** | Viewer / Dev Mode | Sim (pessoal) | Sim | Não |
| **Tech Lead** | Viewer / Dev Mode | Sim (pessoal) | Sim | Não |
| **Bot CI** | Viewer (service account) | Sim (service) | — | Sim |
| **Dev sem acesso** | Nenhum | Não | Não (usa artefatos commitados) | Não |

### Regras
- Cada dev usa **seu próprio token** (Personal Access Token do Figma) em `.env.local`.
- **Nunca compartilhar** token pessoal entre devs.
- **Nunca commitar** tokens no repositório (`.env*` no `.gitignore`).
- Devs sem acesso ao Figma usam os artefatos já sincronizados (`figma-node-data.json`, `dock-ds.config.json`).
- O sync oficial (CI) usa um **service account** dedicado com permissão mínima de leitura.

---

## 2. Arquivo Figma Canônico

### Convenções obrigatórias

| Campo | Onde configurar | Exemplo |
|-------|-----------------|---------|
| File ID | `dock-ds.config.json` → `figma.fileId` | `"ENnwAECm4eFvT0pLXRVQXd"` |
| Páginas canônicas | `dock-ds.config.json` → `figma.canonicalPages` | `["Jornada Mobile Completa", "DS Tokens"]` |
| Node IDs aprovados | `dock-ds.config.json` → `figma.approvedNodes` | `["10012:105775", "10025:108479"]` |
| Owner do arquivo | `dock-ds.config.json` → `figma.owner` | `"design.system@dock.tech"` |
| Última sync oficial | `dock-ds.config.json` → `figma.lastSyncedAt` | `"2026-05-19T14:30:00Z"` |

### Regras
- Apenas **1 arquivo Figma é canônico** por projeto. Definido em `figma.fileId`.
- Se o time de design criar variações, o canônico é o que está no config — os outros são rascunho.
- **Páginas canônicas** definem quais páginas do Figma são fonte de verdade (ignora rascunhos, experimentações).
- **Node IDs aprovados** limitam o sync a frames específicos (evita puxar o arquivo inteiro em projetos grandes).
- O **owner** é responsável por manter o arquivo Figma atualizado e notificar mudanças.

---

## 3. Credenciais — Configuração Segura

### Para desenvolvimento local

```bash
# .env.local (NUNCA commitar — está no .gitignore)
FIGMA_TOKEN=figd_seu-token-pessoal-aqui
FIGMA_FILE_ID=ENnwAECm4eFvT0pLXRVQXd
```

### Para CI (GitHub Actions / Jenkins)

| Secret | Onde armazenar | Tipo |
|--------|---------------|------|
| `FIGMA_TOKEN` | GitHub Secrets / Jenkins Credentials | Secret text |
| `FIGMA_FILE_ID` | Repository variable (não é secret) | Plain text |

### Regras de token
- Token pessoal: escopo de **leitura** (file:read) — nunca escrita.
- Token de service account: criado em conta técnica (`design.system@dock.tech`), escopo de leitura.
- Rotacionar tokens a cada 90 dias (anotar no calendário do time).
- Se um dev sair do time: revogar imediatamente o token pessoal dele.
- Service account deve ter alertas de falha (notificar se sync falhar 3x seguidas).

---

## 4. Fluxo de Sync — Quem Roda e Quando

### Preflight obrigatório
```bash
npm run figma:check
```
- Todo projeto que quiser usar **Figma real** DEVE passar primeiro no preflight.
- Esse passo **não** se aplica a referência visual externa por print/screenshot.
- O preflight valida, em uma execução única:
	- existência de `dock-ds.config.json`
	- presença da seção `figma`
	- presença de `FIGMA_TOKEN`
	- presença de `FIGMA_FILE_ID` (config ou ambiente)
	- acesso ao arquivo Figma via API
	- artefatos mínimos (`DESIGN_SYSTEM.md`, `.env.example`, `figma-node-data.json`)
- Se o preflight falhar, **não seguir** para `figma:sync` nem implementação baseada em arquivo Figma real.
- Se o projeto não tiver `dock-ds.config.json`, o preflight deve falhar com instrução explícita de setup.

### Sync Local (dev individual)
```bash
# Rodar preflight primeiro
npm run figma:check

# Usa .env.local para tokens
npm run figma:sync
```
- **Propósito:** explorar mudanças, prototipar, verificar tokens novos.
- **Resultado:** atualiza arquivos locais, dev pode commitar se relevante.
- **Frequência:** sob demanda, quando o designer avisar de mudanças.
- **NÃO é autoritativo** — o sync oficial (CI) é a referência.

### Sync Oficial (CI — automatizado)
```yaml
# Roda em schedule ou trigger manual
# Resultado: PR automático com diff de tokens
```
- **Propósito:** manter os artefatos do repositório atualizados de forma controlada.
- **Resultado:** cria um PR com as mudanças (nunca merge direto).
- **Frequência:** diário (schedule) ou trigger manual pelo design lead.
- **É autoritativo** — tokens commitados na `main` via esse PR são a verdade.

### Sync de Emergência (hotfix visual)
- Dev pode rodar local + commitar direto em branch de hotfix.
- Requer approval do design lead antes de merge.

---

## 5. Fonte de Verdade — Por Camada

| Camada | Fonte de verdade | Secundário |
|--------|-----------------|------------|
| Intenção visual (layout, composição) | **Figma** | Screenshots do frontend |
| Tokens (cores, fontes, espaçamentos) | **Figma** → sync → `dock-ds.config.json` | Tailwind config |
| Comportamento (estados, interações) | **Frontend / Storybook** | Specs no Figma (informativo) |
| Acessibilidade (ARIA, keyboard, contrast) | **Frontend** | Nenhum |
| API de componente (props, events, slots) | **Frontend / Storybook** | Nenhum |

### Regras de conflito
- Se Figma diz cor X mas frontend implementou Y sem exceção formal → corrigir frontend.
- Se frontend tem estado Z (loading, error) que Figma não mostra → frontend está certo (Figma é incompleto).
- Se Figma mudou tokens mas CI sync ainda não rodou → esperar PR do sync, não mudar manualmente.

---

## 6. Notificações e Comunicação

| Evento | Quem notifica | Canal |
|--------|---------------|-------|
| Designer atualizou arquivo canônico | Designer | Slack #dock-ds-frontend |
| CI sync detectou tokens novos | Bot/CI | PR + Slack #dock-ds-frontend |
| Token novo requer validação | Dev reviewer | Comentário no PR |
| Sync falhou (API error, token expirado) | Bot/CI | Slack #dock-ds-alerts |
| Token de service account próximo de expirar | Calendário time | Email + Slack |

---

## 7. Onboarding de Novo Dev

1. Solicitar acesso Viewer/Dev Mode ao arquivo Figma canônico (pedir ao design lead).
2. Gerar Personal Access Token no Figma (Settings → Security → Personal Access Tokens).
3. Criar `.env.local` com `FIGMA_TOKEN` e `FIGMA_FILE_ID` (copiar file ID do `dock-ds.config.json`).
4. Rodar `npm run figma:check` para validar se o projeto está pronto para fluxo Figma.
5. Se o preflight passar, rodar `npm run figma:sync` para validar que o acesso funciona.
5. Se não tiver acesso: usar os artefatos commitados (`figma-node-data.json`, `dock-ds.config.json`) — sync local não é obrigatório para codar.

---

## Anti-Patterns (NUNCA fazer)

❌ Compartilhar token pessoal entre devs
❌ Commitar `.env` ou `.env.local` com tokens
❌ Usar token de dev individual no CI (deve ser service account)
❌ Ter múltiplos arquivos Figma "oficiais" para o mesmo projeto
❌ Fazer sync manual e commitar direto na main sem PR
❌ Ignorar notificação de token expirado
❌ Mudar tokens no código sem verificar se Figma mudou (pode ser conflito)
❌ Dar permissão de Editor no Figma para bots/CI (leitura é suficiente)
