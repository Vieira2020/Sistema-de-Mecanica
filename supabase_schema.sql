-- Script SQL para inicialização do Banco de Dados Supabase (Shibuya Motores)
-- Executar este script no SQL Editor do seu projeto no Supabase

-- Enums
CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'MECANICO');
CREATE TYPE tipo_os AS ENUM ('MECANICA', 'FUNILARIA', 'AMBOS');
CREATE TYPE status_os AS ENUM (
  'RECEBIDO',
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'AGUARDANDO_PECAS',
  'EM_FUNILARIA',
  'EM_MECANICA',
  'TESTE_QUALIDADE',
  'PRONTO_PARA_ENTREGA',
  'ENTREGUE'
);
CREATE TYPE tipo_movimentacao AS ENUM ('ENTRADA', 'SAIDA');

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS public.usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL,
  login varchar NOT NULL UNIQUE,
  senha_hash varchar NOT NULL,
  perfil perfil_usuario NOT NULL DEFAULT 'MECANICO',
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.cliente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar NOT NULL,
  telefone varchar NOT NULL,
  cpf varchar,
  endereco varchar,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS public.veiculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.cliente(id) ON DELETE CASCADE,
  placa varchar NOT NULL UNIQUE,
  modelo varchar NOT NULL,
  cor varchar NOT NULL,
  ano smallint,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de Peças (Catálogo)
CREATE TABLE IF NOT EXISTS public.peca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_interno varchar NOT NULL UNIQUE,
  nome varchar NOT NULL,
  modelo_compativel varchar,
  preco_min numeric NOT NULL CHECK (preco_min >= 0),
  preco_max numeric NOT NULL CHECK (preco_max >= 0),
  preco_medio numeric NOT NULL CHECK (preco_medio >= 0),
  estoque_atual numeric NOT NULL DEFAULT 0,
  ultima_atualizacao timestamptz NOT NULL DEFAULT now(),
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de Ordens de Serviço (OS)
CREATE TABLE IF NOT EXISTS public.ordem_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  cliente_id uuid NOT NULL REFERENCES public.cliente(id),
  veiculo_id uuid NOT NULL REFERENCES public.veiculo(id),
  responsavel_id uuid NOT NULL REFERENCES public.usuario(id),
  tipo_servico tipo_os NOT NULL DEFAULT 'MECANICA',
  data_entrada timestamptz NOT NULL DEFAULT now(),
  previsao_entrega date,
  mao_de_obra numeric NOT NULL DEFAULT 0 CHECK (mao_de_obra >= 0),
  valor_total numeric NOT NULL DEFAULT 0 CHECK (valor_total >= 0),
  status status_os NOT NULL DEFAULT 'RECEBIDO',
  entregue_em timestamptz,
  criado_por uuid NOT NULL REFERENCES public.usuario(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de Peças na OS
CREATE TABLE IF NOT EXISTS public.os_peca (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL REFERENCES public.ordem_servico(id) ON DELETE CASCADE,
  peca_id uuid NOT NULL REFERENCES public.peca(id),
  quantidade numeric NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric NOT NULL CHECK (preco_unitario >= 0),
  fornecedor varchar,
  criado_por uuid NOT NULL REFERENCES public.usuario(id),
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- Tabela de Verificação de Placa (Auditoria legal - Visível apenas para ADMIN)
CREATE TABLE IF NOT EXISTS public.verificacao_placa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id uuid NOT NULL REFERENCES public.veiculo(id) ON DELETE CASCADE,
  os_id uuid REFERENCES public.ordem_servico(id),
  data_hora timestamptz NOT NULL DEFAULT now(),
  responsavel_id uuid NOT NULL REFERENCES public.usuario(id),
  status_consulta varchar NOT NULL DEFAULT 'SEM_RESTRICAO',
  observacao text
);

-- Tabela de Histórico de Atualizações da OS (Imutável)
CREATE TABLE IF NOT EXISTS public.atualizacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL REFERENCES public.ordem_servico(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL REFERENCES public.usuario(id),
  data_hora timestamptz NOT NULL DEFAULT now(),
  status_anterior status_os,
  status_novo status_os,
  observacao text
);

-- SEED DE DADOS INICIAIS DE TESTE
INSERT INTO public.usuario (id, nome, login, senha_hash, perfil) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dono Shibuya (Admin)', 'admin', 'admin123', 'ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'Mecânico Carlos', 'mecanico', 'mecanico123', 'MECANICO')
ON CONFLICT (login) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificacao_placa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atualizacao ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Acesso total publico anonimo" ON public.usuario FOR ALL USING (true);
CREATE POLICY "Acesso total cliente" ON public.cliente FOR ALL USING (true);
CREATE POLICY "Acesso total veiculo" ON public.veiculo FOR ALL USING (true);
CREATE POLICY "Acesso total peca" ON public.peca FOR ALL USING (true);
CREATE POLICY "Acesso total ordem_servico" ON public.ordem_servico FOR ALL USING (true);
CREATE POLICY "Acesso total verificacao_placa" ON public.verificacao_placa FOR ALL USING (true);
CREATE POLICY "Acesso total atualizacao" ON public.atualizacao FOR ALL USING (true);
