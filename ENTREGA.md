# Entrega do Sistema - 1ª Versão (Shibuya Motores)

---

## 1. Link da Aplicação Hospedada no GitHub Pages

🔗 **Link da Aplicação:**
`https://<usuario_github>.github.io/<nome_repositorio>/`
*(A aplicação foi construída e empacotada nas pastas `dist/`, `docs/` e na raiz com caminhos relativos `base: './'`, pronta para ser servida pelo GitHub Pages sem tela branca).*

---

## 2. Dados de Login para Acesso do Professor / Avaliador

O sistema possui controle de acesso hierárquico por perfil (RBAC) com tela de seleção rápida no login:

### 👤 Perfil Administrador (Dono da Oficina)
- **Login:** `admin`
- **Senha:** `admin123`
- **Acesso:** Visão total a dados financeiros, cadastros de clientes (CPF, endereço, telefone), controle de pecas/estoque, alteração de preços, remoção de peças, criação/edição de OS, dashboard e auditoria de verificação de placas.

### 🔧 Perfil Mecânico / Funileiro (Operacional)
- **Login:** `mecanico`
- **Senha:** `mecanico123`
- **Acesso:** Visão do atendimento técnico e preços das Ordens de Serviço atribuídas a ele. Oculta CPF, telefone e endereço dos clientes (RF-003).

---

## 3. Resumo dos Ajustes e Funcionalidades Implementadas

- **Integração Supabase Ativa:** Conexão direta via cliente `@supabase/supabase-js` com chave configurada, sincronização entre abas e cache em memória para navegação ultrarrápida.
- **Controle Rigoroso de Estoque de Peças:** Bloqueio de anexação de quantidade maior que a disponível em estoque, dedução automática ao anexar peça na OS e devolução/restauração automática do estoque ao remover a peça da OS.
- **Gestão de Peças no Catálogo:** Administrador pode editar preços de referência, alterar estoque e remover peças do catálogo.
- **Visibilidade de Preços para Mecânicos Atribuídos:** O mecânico responsável pela OS consegue visualizar os valores dos serviços daquela OS específica.
- **Busca Facilitada por Placa:** Ao digitar "placa" ou qualquer número/caractere de placa no campo de busca, o sistema lista imediatamente todos os veículos e placas correspondentes.
- **Ordens de Serviço (RF-008 a RF-012):** Suporte às 9 etapas de atendimento com feed imutável de atualizações técnicas (RF-013 a RF-015).
- **Verificação de Placas (RF-007):** Registro de auditoria interna para prevenção de receptação.
