
Quebra da Spec — Sistema Shibuya Motores
Abaixo, a spec decomposta em entidades de dados, módulos, épicos/histórias, critérios de aceite e plano de entrega (MVP → v1 → v2).
1. Modelo de Dados (entidades e relacionamentos)
plain

USUARIO (id, nome, login, senha_hash, perfil: ADMIN|MECANICO, ativo)
CLIENTE (id, nome, telefone, cpf?, endereco?)
VEICULO (id, cliente_id → CLIENTE, placa, modelo, cor, ano?, observacoes?)
PECA (id, nome, codigo_interno, modelo_compativel, preco_min, preco_max,
      preco_medio, ultima_atualizacao)
ORDEM_SERVICO (id, numero, cliente_id, veiculo_id, data_entrada,
      previsao_entrega, responsavel_id → USUARIO, tipo: MECANICA|FUNILARIA|AMBOS,
      mao_de_obra, valor_total, status)
OS_PECA (id, os_id → OS, peca_id → PECA, quantidade, preco_unitario,
         fornecedor?)
VERIFICACAO_PLACA (id, veiculo_id, data, responsavel_id, observacao)  ← só ADMIN
ATUALIZACAO (id, os_id, autor_id, data_hora, status_anterior, status_novo,
             observacao)                                              ← imutável
MOVIMENTACAO_ESTOQUE (id, peca_id, tipo: COMPRA|CONSUMO, quantidade,
                      os_id?, data)
Regras de integridade:
placa é única por veículo; OS não pode ser criada sem VERIFICACAO_PLACA registrada (RF-007).
ATUALIZACAO é append-only — sem UPDATE/DELETE na API.
valor_total = Σ(OS_PECA.qtd × preço_unitário) + mão de obra (RF-020).


3. Módulos / Épicos

🔐 Épico A — Autenticação e Acesso (RF-001 a RF-004)
US-A1: Login com sessão; perfil ADMIN ou MECANICO.
US-A2: Middleware de autorização por rota — MECANICO nunca recebe campos sensíveis (CPF, telefone, endereço, valores). A restrição deve ocorrer no backend, não só escondendo na UI.
US-A3: Auditoria automática (usuário + timestamp) em toda criação/edição/status.
Aceite: token de MECANICO consultando /api/os/:id não retorna CPF, telefone, endereço nem valores; tentativa de acesso a rota admin retorna 403.

👤 Épico B — Clientes e Veículos (RF-005 a RF-007)
US-B1: CRUD de cliente (CPF/endereço opcionais).
US-B2: CRUD de veículo vinculado ao cliente.
US-B3: Registro de verificação de placa obrigatório antes de criar OS; visível só para ADMIN.
Aceite: tentativa de criar OS sem verificação de placa é bloqueada com mensagem clara.

📋 Épico C — Ordem de Serviço (RF-008 a RF-012)
US-C1: Criação de OS vinculada a cliente + veículo, com tipo (mecânica/funilaria/ambos).
US-C2: Máquina de estados com os 9 status, na ordem definida.
US-C3: Mudança de status com observação opcional → gera ATUALIZACAO automaticamente.
Aceite: transição inválida (ex: "Recebido" → "Entregue" pulando etapas) é rejeitada; cada transição gera registro no feed.

🕓 Épico D — Feed de Atualizações (RF-013 a RF-015)
US-D1: Timeline na OS: autor, data/hora, status anterior → novo, observação.
US-D2: MECANICO pode postar atualização técnica sem mudar status.
US-D3: Histórico imutável (sem endpoints de edição/exclusão)

🔩 Épico E — Peças, Estoque e Valores (RF-016 a RF-020)
US-E1: Catálogo de peças com faixa de preço de referência.
US-E2: Vincular peças à OS (qtd, preço unitário naquele momento — snapshot, não referência).
US-E3: Estoque simplificado: entradas (compra) e saídas (consumo por OS), saldo calculado.
US-E4: Cálculo automático do total da OS.

📊 Épico F — Relatórios e Buscas (RF-021 a RF-023)
US-F1: Dashboard ADMIN: OS em aberto, atrasadas, faturamento D/S/M, ranking de peças.
US-F2: Lista de veículos filtrável por status.
US-F3: Busca global por placa, cliente ou nº da OS.


4. Decisões técnicas implícitas na spec (não ditas, mas necessárias)
Planilhas
Ponto	Implicação
RNF-002 (hash de senha)	bcrypt/argon2; nunca SHA-1/MD5
RNF-003 (backup diário)	dump agendado + armazenamento externo
RNF-005 (baixa conectividade)	PWA com cache ou app offline-first com sync — decisão arquitetural crítica, definir no kickoff
RF-007 (verificação de placa)	Não integra com DETRAN — é registro interno de "consulta realizada"; deixar explícito no escopo
RF-017 (preço "naquele momento")	Exige snapshot do preço em OS_PECA, não FK viva


5. Plano de Entrega

🟢 MVP (semana 1–3) — núcleo operacional
Auth + perfis (Épico A)
Clientes/veículos + verificação de placa (Épico B)
OS com máquina de estados + feed imutável (Épicos C e D)
Busca por placa/nº OS (parcial do Épico F)
Resolve os problemas 1, 2 e 4 do cenário.

🟡 v1 (semana 4–6) — dinheiro e peças
Catálogo de peças + vinculação à OS + cálculo de total (Épico E, menos estoque)
Dashboard administrativo (Épico F completo)
Resolve os problemas 3 e 5.

🔵 v2 (semana 7–8) — robustez
Estoque com movimentações
PWA/offline (RNF-005) + backups automáticos (RNF-003)
Testes de autorização (fuzzing de rotas por perfil)


7. Riscos e lacunas da spec
RNF-005 (offline) é o item mais caro — se o prazo apertar, é o primeiro candidato a sair do MVP.
RF-011 não define transições permitidas — preciso que você valide: todos os status são alcançáveis a partir de qualquer um, ou há ordem estrita? Sugiro matriz de transições explícita.
RF-018 (estoque) — o sistema controla peças de reposição? Peças usadas? Só compradas para OS específicas? A definição impacta o modelo.
Faturamento (RF-021) — calculado pelo valor total da OS na data de entrega? Por pagamento registrado? Não existe registro de pagamento na spec — se "faturamento" importa, falta uma entidade PAGAMENTO.
Múltiplos responsáveis — uma OS de "ambos" pode ter mecânico e funileiro diferentes? Se sim, responsavel_id vira relação N:N.
