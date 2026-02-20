-- Migration: 0001_create_usuarios
-- Criado em: 2026-02-20
-- Descrição: Criação da tabela de usuários (sincronizada com Auth0)

CREATE TABLE IF NOT EXISTS usuarios (
  id        TEXT PRIMARY KEY,          -- sub do Auth0 (ex: auth0|abc123)
  email     TEXT NOT NULL UNIQUE,
  nome      TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);