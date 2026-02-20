-- Migration: 0005_triggers_atualizado_em
-- Criado em: 2026-02-20
-- Descrição: Triggers para atualizar automaticamente o campo atualizado_em

CREATE TRIGGER IF NOT EXISTS trg_usuarios_atualizado_em
AFTER UPDATE ON usuarios
BEGIN
  UPDATE usuarios SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_clientes_atualizado_em
AFTER UPDATE ON clientes
BEGIN
  UPDATE clientes SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_pets_atualizado_em
AFTER UPDATE ON pets
BEGIN
  UPDATE pets SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_agendamentos_atualizado_em
AFTER UPDATE ON agendamentos
BEGIN
  UPDATE agendamentos SET atualizado_em = datetime('now') WHERE id = NEW.id;
END;