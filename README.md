# Shibuya Motores — Sistema de Gestão de Oficina & Funilaria

Sistema web desenvolvido para a oficina **Shibuya Motores** (Bragança Paulista, SP), cobrindo gestão de Ordens de Serviço (OS), verificação de placas para prevenção legal, catálogo de peças, linha do tempo imutável de atendimento e controle por perfil de acesso.

---

## 📌 Documentação de Entrega

Consulte o arquivo [ENTREGA.md](./ENTREGA.md) para:
- Dados de acesso e login (`admin` / `mecanico`)
- Resumo das funcionalidades entregues na 1ª Versão
- Lista de funcionalidades pendentes para versões futuras
- Instruções de hospedagem no GitHub Pages

---

## 🚀 Como Executar o Projeto Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Executar a suíte de testes
npm test

# 4. Gerar build de produção para GitHub Pages
npm run build
```

---

## 🗄️ Conexão com o Supabase

O projeto vem preparado com o script SQL completo em `supabase_schema.sql`.

1. No painel do seu projeto no **Supabase**, acesse o **SQL Editor**.
2. Execute o conteúdo de `supabase_schema.sql` para criar as tabelas, enums e dados de teste.
3. No sistema web, clique no ícone de engrenagem no cabeçalho para inserir sua **URL do Supabase** e **Anon Key**.

---

## 🎨 Paleta de Cores e Estilização (`desing.md`)

- **Primária Escura:** `#032326`
- **Títulos e Cabeçalhos:** `#06402F`
- **Cards Secundários:** `#125938`
- **Cards Terciários:** `#308C50`
- **Acentos e Destaques:** `#8C4580`
- **Fundo da Página:** `#F7F7E6`
