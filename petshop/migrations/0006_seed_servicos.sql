-- Migration: 0006_seed_servicos
-- Criado em: 2026-02-20
-- Descrição: Seed opcional — insere dados iniciais para referência/testes
-- Obs: Esta migration é opcional. Remova se não quiser dados de exemplo.

-- Usuário de demonstração (apenas para testes locais)
INSERT OR IGNORE INTO usuarios (id, email, nome)
VALUES ('auth0|demo000', 'demo@petshop.com', 'Usuário Demo');

-- Cliente de exemplo
INSERT OR IGNORE INTO clientes (id, usuario_id, nome, telefone, email, endereco)
VALUES (1, 'auth0|demo000', 'Maria Souza', '(21) 98888-1234', 'maria@email.com', 'Rua das Flores, 42 - Niterói/RJ');

-- Pet de exemplo
INSERT OR IGNORE INTO pets (id, cliente_id, usuario_id, nome, especie, raca, idade)
VALUES (1, 1, 'auth0|demo000', 'Bolinha', 'Cachorro', 'Shih Tzu', 3);

-- Agendamento de exemplo
INSERT OR IGNORE INTO agendamentos (id, pet_id, usuario_id, servico, data, hora, status, observacoes)
VALUES (1, 1, 'auth0|demo000', 'banho-tosa', '2026-03-01', '09:00', 'agendado', 'Pet com pele sensível');