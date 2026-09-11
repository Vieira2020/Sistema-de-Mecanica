
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Mecânica (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT Mecânica_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  login character varying NOT NULL UNIQUE,
  senha_hash character varying NOT NULL,
  perfil USER-DEFINED NOT NULL DEFAULT 'MECANICO'::perfil_usuario,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usuario_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cliente (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  telefone character varying NOT NULL,
  cpf character varying,
  endereco character varying,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cliente_pkey PRIMARY KEY (id)
);
CREATE TABLE public.veiculo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  placa USER-DEFINED NOT NULL CHECK (placa::text ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'::text),
  modelo character varying NOT NULL,
  cor character varying NOT NULL,
  ano smallint,
  observacoes text,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT veiculo_pkey PRIMARY KEY (id),
  CONSTRAINT veiculo_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id)
);
CREATE TABLE public.verificacao_placa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  veiculo_id uuid NOT NULL,
  os_id uuid,
  data_hora timestamp with time zone NOT NULL DEFAULT now(),
  responsavel_id uuid NOT NULL,
  observacao text,
  CONSTRAINT verificacao_placa_pkey PRIMARY KEY (id),
  CONSTRAINT verificacao_placa_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.veiculo(id),
  CONSTRAINT verificacao_placa_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.usuario(id),
  CONSTRAINT fk_verificacao_os FOREIGN KEY (os_id) REFERENCES public.ordem_servico(id)
);
CREATE TABLE public.peca (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo_interno character varying NOT NULL UNIQUE,
  nome character varying NOT NULL,
  modelo_compativel character varying,
  preco_min numeric NOT NULL CHECK (preco_min >= 0::numeric),
  preco_max numeric NOT NULL,
  preco_medio numeric NOT NULL,
  ultima_atualizacao timestamp with time zone NOT NULL DEFAULT now(),
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT peca_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ordem_servico (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  cliente_id uuid NOT NULL,
  veiculo_id uuid NOT NULL,
  responsavel_id uuid NOT NULL,
  tipo_servico USER-DEFINED NOT NULL,
  data_entrada timestamp with time zone NOT NULL DEFAULT now(),
  previsao_entrega date,
  mao_de_obra numeric NOT NULL DEFAULT 0 CHECK (mao_de_obra >= 0::numeric),
  valor_total numeric NOT NULL DEFAULT 0,
  status USER-DEFINED NOT NULL DEFAULT 'RECEBIDO'::status_os,
  entregue_em timestamp with time zone,
  criado_por uuid NOT NULL,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ordem_servico_pkey PRIMARY KEY (id),
  CONSTRAINT ordem_servico_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.cliente(id),
  CONSTRAINT ordem_servico_veiculo_id_fkey FOREIGN KEY (veiculo_id) REFERENCES public.veiculo(id),
  CONSTRAINT ordem_servico_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.usuario(id),
  CONSTRAINT ordem_servico_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuario(id)
);
CREATE TABLE public.os_peca (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL,
  peca_id uuid NOT NULL,
  quantidade numeric NOT NULL CHECK (quantidade > 0::numeric),
  preco_unitario numeric NOT NULL CHECK (preco_unitario >= 0::numeric),
  fornecedor character varying,
  criado_por uuid NOT NULL,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT os_peca_pkey PRIMARY KEY (id),
  CONSTRAINT os_peca_peca_id_fkey FOREIGN KEY (peca_id) REFERENCES public.peca(id),
  CONSTRAINT os_peca_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.usuario(id),
  CONSTRAINT os_peca_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordem_servico(id)
);
CREATE TABLE public.movimentacao_estoque (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  peca_id uuid NOT NULL,
  tipo USER-DEFINED NOT NULL,
  quantidade numeric NOT NULL CHECK (quantidade > 0::numeric),
  os_id uuid,
  fornecedor character varying,
  registrado_por uuid NOT NULL,
  criado_em timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT movimentacao_estoque_pkey PRIMARY KEY (id),
  CONSTRAINT movimentacao_estoque_peca_id_fkey FOREIGN KEY (peca_id) REFERENCES public.peca(id),
  CONSTRAINT movimentacao_estoque_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordem_servico(id),
  CONSTRAINT movimentacao_estoque_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.usuario(id)
);
CREATE TABLE public.atualizacao (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL,
  autor_id uuid NOT NULL,
  data_hora timestamp with time zone NOT NULL DEFAULT now(),
  status_anterior USER-DEFINED,
  status_novo USER-DEFINED,
  observacao text,
  CONSTRAINT atualizacao_pkey PRIMARY KEY (id),
  CONSTRAINT atualizacao_os_id_fkey FOREIGN KEY (os_id) REFERENCES public.ordem_servico(id),
  CONSTRAINT atualizacao_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.usuario(id)
);
