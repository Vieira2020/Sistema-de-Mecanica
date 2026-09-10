# Quebra da Spec — Sistema Shibuya Motores

## Sobre este documento

Decomposicao da especificacao original em **entidades de dados**, **modulos**, **epicos/historias**, **criterios de aceite** e **plano de entrega (MVP -> v1 -> v2)**.

---

## 1. Modelo de Dados (entidades e relacionamentos)

```javascript
USUARIO (id, nome, login, senha_hash, perfil: ADMIN|MECANICO, ativo)
CLIENTE (id, nome, telefone, cpf?, endereco?)
VEICULO (id, cliente_id -> CLIENTE, placa, modelo, cor, ano?, observacoes?)
PECA (id, nome, codigo_interno, modelo_compativel, preco_min, preco_max,
      preco_medio, ultima_atualizacao)
ORDEM_SERVICO (id, numero, cliente_id, veiculo_id, data_entrada,
      previsao_entrega, responsavel_id -> USUARIO, tipo: MECANICA|FUNILARIA|AMBOS,
      mao_de_obra, valor_total, status)
OS_PECA (id, os_id -> OS, peca_id -> PECA, quantidade, preco_unitario,
         fornecedor?)
VERIFICACAO_PLACA (id, veiculo_id, data, responsavel_id, observacao)  <- so ADMIN
ATUALIZACAO (id, os_id, autor_id, data_hora, status_anterior, status_novo,
             observacao)                                              <- imutavel
MOVIMENTACAO_ESTOQUE (id, peca_id, tipo: COMPRA|CONSUMO, quantidade,
                      os_id?, data)
```

### Regras de integridade

- `placa` e unica por veiculo; OS nao pode ser criada sem `VERIFICACAO_PLACA` registrada (RF-007).
- `ATUALIZACAO` e append-only — sem UPDATE/DELETE na API.
- `valor_total` = soma de (OS_PECA.qtd x preco_unitario) + mao de obra (RF-020).

---

## 2. Modulos / Epicos

### Epico A — Autenticacao e Acesso (RF-001 a RF-004)

- **US-A1:** Login com sessao; perfil ADMIN ou MECANICO.
- **US-A2:** Middleware de autorizacao por rota — MECANICO nunca recebe campos sensiveis (CPF, telefone, endereco, valores). A restricao deve ocorrer no **backend**, nao so escondendo na UI.
- **US-A3:** Auditoria automatica (usuario + timestamp) em toda criacao, edicao ou mudanca de status.

**Criterio de aceite:** token de MECANICO consultando `/api/os/:id` nao retorna CPF, telefone, endereco nem valores; tentativa de acesso a rota admin retorna 403.

### Epico B — Clientes e Veiculos (RF-005 a RF-007)

- **US-B1:** CRUD de cliente (CPF e endereco opcionais).
- **US-B2:** CRUD de veiculo vinculado ao cliente.
- **US-B3:** Registro de verificacao de placa obrigatorio antes de criar OS; visivel somente para ADMIN.

**Criterio de aceite:** tentativa de criar OS sem verificacao de placa e bloqueada com mensagem clara.

### Epico C — Ordem de Servico (RF-008 a RF-012)

- **US-C1:** Criacao de OS vinculada a cliente e veiculo, com tipo (*mecanica*, *funilaria* ou *ambos*).
- **US-C2:** Maquina de estados com os 9 status, na ordem definida em RF-011.
- **US-C3:** Mudanca de status com observacao opcional, gerando ATUALIZACAO automaticamente.

**Criterio de aceite:** transicao invalida (ex: *"Recebido" -> "Entregue"* pulando etapas) e rejeitada; cada transicao gera registro no feed.

### Epico D — Feed de Atualizacoes (RF-013 a RF-015)

- **US-D1:** Timeline na OS: autor, data/hora, status anterior -> status novo, observacao.
- **US-D2:** MECANICO pode postar atualizacao tecnica sem mudar o status (ex: *"Motor desmontado, identificado problema no cabecote"*).
- **US-D3:** Historico imutavel — sem endpoints de edicao ou exclusao.

### Epico E — Pecas, Estoque e Valores (RF-016 a RF-020)

- **US-E1:** Catalogo de pecas com faixa de preco de referencia (minimo, maximo, medio).
- **US-E2:** Vincular pecas a OS com quantidade e preco unitario **naquele momento** (*snapshot*, nao referencia viva).
- **US-E3:** Estoque simplificado: entradas (compra) e saidas (consumo por OS), saldo calculado.
- **US-E4:** Calculo automatico do valor total da OS.

### Epico F — Relatorios e Buscas (RF-021 a RF-023)

- **US-F1:** Dashboard ADMIN: OS em aberto, OS atrasadas, faturamento do dia/semana/mes e pecas mais utilizadas.
- **US-F2:** Lista de veiculos filtravel por status (ex: *"Quais carros estao em funilaria agora?"*).
- **US-F3:** Busca global por placa, nome do cliente ou numero da OS.

---

## 3. Decisoes tecnicas implicitas na spec

| Ponto | Implicacao |
| --- | --- |
| **RNF-002** (hash de senha) | bcrypt/argon2; nunca SHA-1/MD5 |
| **RNF-003** (backup diario) | dump agendado + armazenamento externo |
| **RNF-005** (baixa conectividade) | PWA com cache ou app offline-first com sync — decisao arquitetural critica, definir no kickoff |
| **RF-007** (verificacao de placa) | Nao integra com DETRAN — e registro interno de "consulta realizada"; deixar explicito no escopo |
| **RF-017** (preco "naquele momento") | Exige snapshot do preco em `OS_PECA`, nao FK viva |

---

## 4. Plano de Entrega

### MVP (semana 1–3) — nucleo operacional

1. Auth + perfis (Epico A)
2. Clientes/veiculos + verificacao de placa (Epico B)
3. OS com maquina de estados + feed imutavel (Epicos C e D)
4. Busca por placa/numero de OS (parcial do Epico F)

Resolve os **problemas 1, 2 e 4** do cenario.

### v1 (semana 4–6) — dinheiro e pecas

5. Catalogo de pecas + vinculacao a OS + calculo de total (Epico E, menos estoque)
6. Dashboard administrativo (Epico F completo)

Resolve os **problemas 3 e 5** do cenario.

### v2 (semana 7–8) — robustez

7. Estoque com movimentacoes
8. PWA/offline (RNF-005) + backups automaticos (RNF-003)
9. Testes de autorizacao (fuzzing de rotas por perfil)

---

## 5. Riscos e lacunas da spec

1. **RNF-005 (offline)** e o item mais caro — se o prazo apertar, e o primeiro candidato a sair do MVP.
2. **RF-011 nao define transicoes permitidas** — preciso validar: todos os status sao alcancaveis a partir de qualquer um, ou ha ordem estrita? Sugiro matriz de transicoes explicita.
3. **RF-018 (estoque)** — o sistema controla pecas de reposicao? Pecas usadas? So compradas para OS especificas? A definicao impacta o modelo de dados.
4. **Faturamento (RF-021)** — calculado pelo valor total da OS na data de entrega? Por pagamento registrado? Nao existe registro de pagamento na spec — se "faturamento" importa, falta uma entidade `PAGAMENTO`.
5. **Multiplos responsaveis** — uma OS de "ambos" pode ter mecanico e funileiro diferentes? Se sim, `responsavel_id` vira relacao N:N.

---

## 6. Schema SQL de referencia

Ver `schema_shibuya_motores.sql` — PostgreSQL 14+, com enums, triggers de imutabilidade (RF-015), recalculo automatico de valor total (RF-020) e bloqueio de OS sem verificacao de placa (RF-007).
