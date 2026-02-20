-- Migration: 0003_create_pets
-- Criado em: 2026-02-20
-- Descrição: Criação da tabela de pets
-- Depende de: 0001_create_usuarios, 0002_create_clientes

CREATE TABLE IF NOT EXISTS pets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id    INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  usuario_id    TEXT    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome          TEXT    NOT NULL,
  especie       TEXT,
  raca          TEXT,
  idade         INTEGER CHECK (idade >= 0),
  criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pets_cliente_id  ON pets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pets_usuario_id  ON pets(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pets_nome        ON pets(nome);