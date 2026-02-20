-- Migration: 0002_create_clientes
-- Criado em: 2026-02-20
-- Descrição: Criação da tabela de clientes do PetShop
-- Depende de: 0001_create_usuarios

CREATE TABLE IF NOT EXISTS clientes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id    TEXT    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome          TEXT    NOT NULL,
  telefone      TEXT,
  email         TEXT,
  endereco      TEXT,
  criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clientes_usuario_id ON clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome       ON clientes(nome);