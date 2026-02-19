CREATE TABLE IF NOT EXISTS usuarios (
  id          TEXT PRIMARY KEY,          -- sub do Auth0 (auth0|xxxxx)
  email       TEXT NOT NULL UNIQUE,
  nome        TEXT,
  criado_em   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clientes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
  nome        TEXT NOT NULL,
  telefone    TEXT,
  email       TEXT,
  endereco    TEXT,
  criado_em   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id  INTEGER NOT NULL REFERENCES clientes(id),
  usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
  nome        TEXT NOT NULL,
  especie     TEXT,
  raca        TEXT,
  idade       INTEGER,
  criado_em   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  pet_id      INTEGER NOT NULL REFERENCES pets(id),
  usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
  servico     TEXT NOT NULL,
  data        TEXT NOT NULL,
  hora        TEXT NOT NULL,
  status      TEXT DEFAULT 'agendado',
  observacoes TEXT,
  criado_em   TEXT DEFAULT (datetime('now'))
);