Análise UX/UI — Pagos PayJoy
1. A pergunta principal: RadioCard vs Tab no Step1?
Diagnóstico atual: Dois RadioCard grandes ocupando espaço horizontal para escolher entre dois modos de busca que mudam completamente o formulário abaixo.

A questão certa não é "combobox vs tab" — é: qual é o modelo mental do operador?

O operador de CAC não "navega" entre dois contextos — ele sabe antes de abrir o que vai fazer: "vou registrar um pagamento inicial" ou "vou registrar um pagamento parcial". É uma decisão de intenção, não de exploração.

Recomendação: Tab segmentado (Segmented Control)

Padrão	Quando usar	Carga cognitiva
RadioCard (atual)	Quando o usuário precisa ler a descrição para decidir	Alta — 2 cards + texto
Tab/Segmented	Quando a escolha é binária e o usuário já sabe	Baixa — 1 gesto
Combobox/Select	Quando há 4+ opções	Média
O RadioCard faz sentido em checkouts e-commerce onde o usuário compara opções. Aqui o operador usa o sistema dezenas de vezes por dia — a descrição "Registrar el pago inicial de una venta nueva" não acrescenta nada após a segunda vez.

2. Problemas de layout e hierarquia visual
Step1 — Búsqueda de la venta
Problema A — Carga cognitiva no formulário inicial
O formulário de Pago Inicial tem 5 campos numa grid de 2 colunas. O Voucher fica ao lado do Primer Nombre — dois campos sem relação semântica dividindo a mesma linha.

Proposta: agrupar por intenção semântica com separação visual leve:

Problema B — Segundo Nombre e Segundo Apellido
Campos opcionais misturados com obrigatórios no mesmo grid quebram o ritmo visual. O olho do usuário percorre: obrigatório → opcional → obrigatório → opcional. Isso gera micro-hesitação.

Solução: mover os opcionais para baixo dos obrigatórios ou marcá-los com "(opcional)" em cinza.

Step2 — Registrar
Problema C — Detalle del dispositivo e Opciones de pago no mesmo card
Dois conceitos distintos num card único. O dispositivo é informação (confirmar que é o equipamento certo). As opções são ação (selecionar). Misturar os dois aumenta a densidade e reduz clareza.

Proposta: separar em dois cards com divisão visual clara, como acontece no Step3.

Problema D — As opções de pago não comunicam urgência/prioridade financeira
A lista mostra: label | descrição | monto. Mas o operador precisa entender o que representa cada opção. "Sin atraso" e "7 días de atraso" são informativos, mas o monto fica à direita isolado — sem contexto de "o que cobre esse valor".

Proposta: adicionar um badge colorido de status de atraso:

Step3 — Confirmar
Problema E — Cliente (opcional) como seção colapsável quebra o fluxo linear
O usuário está num fluxo de 3 steps com progresso linear. De repente encontra um elemento accordion que exige decisão adicional ("devo expandir?"). Isso quebra o padrão de fluxo.

O que o operador pensa: "Preciso ou não preciso preencher isso? O que acontece se não preencher?"

Proposta: manter o formulário de cliente sempre visível, mas claramente opcional:

Campos opcionais com placeholder em cinza mais claro. Sem accordion — sem decisão extra.

Problema F — Checkbox de confirmação antes dos campos da tarjeta
Fluxo atual:

O usuário confirma que cobrou antes de preencher os dados do comprovante. Isso é semanticamente invertido — você preenche os dados do comprovante para confirmar.

Proposta de ordem:

3. Stepper — questão de escala
O stepper atual com 3 steps é correto para esse fluxo. Mas tem um gap: não comunica o que já foi feito.

Quando o usuário está no Step3, ele vê "Forma de pago ✓ | Registrar ✓ | Confirmar ←". Mas não há como voltar ao Step1 clicando no stepper — é navegação unidirecional.

Decisão de produto necessária: o operador pode voltar ao Step1 clicando no stepper? Se sim, isso precisa ser habilitado. Se não (por risco de perder dados), os steps completados deveriam ser visualmente distintos mas não clicáveis.

Resumo — O que questionar antes de implementar
Questão	Decisão necessária
RadioCard → Segmented Control no Step1?	Sim — menos ruído para tarefa repetitiva
Separar dispositivo e opções no Step2?	Sim — dois cards distintos
Cliente accordion → formulário sempre visível?	Sim — elimina decisão extra
Checkbox antes ou depois dos campos de tarjeta?	Depois — ordem semântica correta
Stepper clicável para voltar?	Depende de regra de negócio
Badge de urgência nas opções de pagamento?	Sim — dado crítico deve ter destaque
Campos opcionais mais destacados visualmente?	Sim — label "(opcional)" em cinza