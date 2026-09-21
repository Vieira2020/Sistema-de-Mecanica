# Entrega do Sistema - 1ª Versão (Shibuya Motores)

---

## 1. Link da Aplicação Hospedada no GitHub Pages

🔗 **Link da Aplicação:**
`https://<usuario_github>.github.io/<nome_repositorio>/`
*(A aplicação foi construída e empacotada na pasta `dist/` com caminhos relativos `base: './'`, pronta para ser servida pelo GitHub Pages).*

---

## 2. Dados de Login para Acesso do Professor / Avaliador

O sistema possui controle de acesso hierárquico por perfil (RBAC) com tela de seleção rápida no login:

### 👤 Perfil Administrador (Dono da Oficina)
- **Login:** `admin`
- **Senha:** `admin123`
- **Acesso:** Visão total a dados financeiros, cadastros de clientes (CPF, endereço, telefone), controle de pecas, criação/edição de OS, dashboard e auditoria de verificação de placas.

### 🔧 Perfil Mecânico / Funileiro (Operacional)
- **Login:** `mecanico`
- **Senha:** `mecanico123`
- **Acesso:** Visão limitada ao atendimento técnico (placa/modelo do veículo, status, descrição dos serviços e feed de atualizações técnicas). **Não visualiza valores financeiros, CPF, telefone ou endereço do cliente** (cumprindo a regra RF-003 da SPEC).

---

## 3. Resumo do que foi Implementado na 1ª Versão

A aplicação foi desenvolvida rigorosamente de acordo com a **SPEC.md**, o **schema.md** e o guia de estilo **desing.md**:

- **Autenticação e Permissões (RF-001 a RF-004):** Login com perfis ADMIN e MECANICO, restrição de visualização no frontend e auditoria de responsável por cada ação.
- **Clientes e Veículos (RF-005 e RF-006):** Cadastro completo de clientes e veículos vinculados com validação de placa.
- **Auditoria de Verificação de Placas (RF-007):** Registro interno de consulta prévia da placa para prevenção de receptação de veículos roubados (restrito ao Admin).
- **Ordem de Serviço - OS (RF-008 a RF-012):** Suporte para serviços de Mecânica, Funilaria ou Ambos, cobrindo as **9 etapas de status** (`RECEBIDO` → `EM_DIAGNOSTICO` → `AGUARDANDO_APROVACAO` → `AGUARDANDO_PECAS` → `EM_FUNILARIA` → `EM_MECANICA` → `TESTE_QUALIDADE` → `PRONTO_PARA_ENTREGA` → `ENTREGUE`).
- **Feed Imutável de Atualizações Técnicas (RF-013 a RF-015):** Linha do tempo na OS permitindo ao mecânico publicar observações técnicas em tempo real sem alterar o status.
- **Catálogo de Peças e Valores (RF-016 a RF-020):** Tabela de peças com faixas de preços de referência (Mínimo, Médio e Máximo), vinculação de peças com preço snapshot à OS e cálculo automático do valor total.
- **Dashboard e Buscas (RF-021 a RF-023):** Dashboard em tempo real para o Admin com métricas de faturamento, contador de veículos em cada setor e busca global por placa, cliente ou número de OS.
- **Conexão com Banco de Dados Supabase:** Integração com cliente `@supabase/supabase-js`, script SQL de migração (`supabase_schema.sql`) e modal de configuração no sistema, além de fallback local para funcionamento offline.

---

## 4. Lista do que falta finalizar na Aplicação (Próximas Versões / v2)

Conforme planejado para entregas futuras do projeto:

1. **Módulo Avançado de Estoque de Peças (RF-018 expandido):**
   - Controle de entradas/saídas por lote e fornecedor com histórico de fornecedores.
2. **Integração com API Externa de Detran/SINESP:**
   - Preenchimento e verificação automatizada dos dados da placa a partir de API externa em tempo real.
3. **Notificações Automáticas para Clientes:**
   - Envio de alertas de status (ex: "Seu veículo está Pronto para Entrega") via WhatsApp / SMS.
4. **Relatórios Financeiros Avançados:**
   - Gráficos de comissão por mecânico/funileiro e fechamento mensal exportável para PDF/Excel.
5. **PWA (Progressive Web App):**
   - Suporte a instalação como aplicativo em tablets da oficina com sincronização em segundo plano.
