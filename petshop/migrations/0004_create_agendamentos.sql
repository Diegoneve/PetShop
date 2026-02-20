-- Migration: 0004_create_agendamentos
-- Criado em: 2026-02-20
-- Descrição: Criação da tabela de agendamentos
-- Depende de: 0001_create_usuarios, 0003_create_pets

CREATE TABLE IF NOT EXISTS agendamentos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id        INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  usuario_id    TEXT    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  servico       TEXT    NOT NULL CHECK (servico IN ('veterinario', 'banho-tosa', 'spa', 'hotel')),
  data          TEXT    NOT NULL,  -- formato: YYYY-MM-DD
  hora          TEXT    NOT NULL,  -- formato: HH:MM
  status        TEXT    NOT NULL DEFAULT 'agendado'
                        CHECK (status IN ('agendado', 'concluido', 'cancelado')),
  observacoes   TEXT,
  criado_em     TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_usuario_id       ON agendamentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_pet_id           ON agendamentos(pet_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora        ON agendamentos(data, hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico_data_hora ON agendamentos(servico, data, hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status           ON agendamentos(status);