# 🐾 PetShop — Cloudflare Pages + D1 + Auth0

## Estrutura do projeto

```
petshop/
├── functions/               # Cloudflare Pages Functions (API)
│   └── api/
│       ├── _middleware.js   # Valida JWT do Auth0 em todas as rotas
│       ├── usuarios.js
│       ├── clientes.js
│       ├── pets.js
│       └── agendamentos.js
├── src/                     # Frontend React
│   ├── main.jsx
│   ├── App.jsx
│   ├── api.js               # Cliente HTTP para as Functions
│   └── components/
│       ├── Login.jsx
│       ├── Register.jsx
│       └── Dashboard.jsx
├── schema.sql               # Schema do banco D1
├── wrangler.toml            # Configuração Cloudflare
└── package.json
```

---

## 1. Pré-requisitos

```bash
npm install -g wrangler
wrangler login
```

---

## 2. wrangler.toml

```toml
name = "petshop"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "petshop-db"
database_id = "COLE_AQUI_O_DATABASE_ID"
```

---

## 3. Criar banco D1

```bash
# Criar o banco
wrangler d1 create petshop-db

# Copie o database_id gerado e cole no wrangler.toml

# Aplicar o schema
wrangler d1 execute petshop-db --file=schema.sql
```

---

## 4. schema.sql

```sql
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
```

---

## 5. functions/api/\_middleware.js

```js
// Valida o JWT do Auth0 em todas as rotas /api/*
export async function onRequest({ request, env, next }) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");

  if (!token) {
    return new Response(JSON.stringify({ error: "Token ausente" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Busca as chaves públicas do Auth0
    const jwksRes = await fetch(
      `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    );
    const { keys } = await jwksRes.json();

    // Decodifica o header do JWT para pegar o kid
    const [headerB64] = token.split(".");
    const header = JSON.parse(atob(headerB64));
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) throw new Error("Chave não encontrada");

    // Importa a chave pública e verifica o token
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const [, payloadB64, sigB64] = token.split(".");
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sig = Uint8Array.from(
      atob(sigB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );

    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      sig,
      data,
    );
    if (!valid) throw new Error("Token inválido");

    // Adiciona payload decodificado ao contexto
    const payload = JSON.parse(atob(payloadB64));
    request.user = payload;

    return next();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Token inválido", detail: e.message }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
```

---

## 6. functions/api/usuarios.js

```js
export async function onRequestPost({ request, env }) {
  const user = request.user;
  const { nome, email } = await request.json();

  await env.DB.prepare(
    `INSERT INTO usuarios (id, email, nome)
     VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nome=excluded.nome`,
  )
    .bind(user.sub, email, nome)
    .run();

  return Response.json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const user = request.user;
  const row = await env.DB.prepare(`SELECT * FROM usuarios WHERE id = ?`)
    .bind(user.sub)
    .first();
  return Response.json(row);
}
```

---

## 7. functions/api/clientes.js

```js
const headers = { "Content-Type": "application/json" };

export async function onRequestGet({ request, env }) {
  const user = request.user;
  const { results } = await env.DB.prepare(
    `SELECT * FROM clientes WHERE usuario_id = ? ORDER BY criado_em DESC`,
  )
    .bind(user.sub)
    .all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  const user = request.user;
  const { nome, telefone, email, endereco } = await request.json();
  const { meta } = await env.DB.prepare(
    `INSERT INTO clientes (usuario_id, nome, telefone, email, endereco)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(user.sub, nome, telefone, email, endereco)
    .run();
  return Response.json({ id: meta.last_row_id });
}

export async function onRequestPut({ request, env }) {
  const user = request.user;
  const { id, nome, telefone, email, endereco } = await request.json();
  await env.DB.prepare(
    `UPDATE clientes SET nome=?, telefone=?, email=?, endereco=?
     WHERE id=? AND usuario_id=?`,
  )
    .bind(nome, telefone, email, endereco, id, user.sub)
    .run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const user = request.user;
  const { id } = await request.json();
  await env.DB.prepare(`DELETE FROM clientes WHERE id=? AND usuario_id=?`)
    .bind(id, user.sub)
    .run();
  return Response.json({ ok: true });
}
```

---

## 8. functions/api/pets.js

```js
export async function onRequestGet({ request, env }) {
  const user = request.user;
  const { results } = await env.DB.prepare(
    `SELECT p.*, c.nome as cliente_nome
     FROM pets p JOIN clientes c ON p.cliente_id = c.id
     WHERE p.usuario_id = ? ORDER BY p.criado_em DESC`,
  )
    .bind(user.sub)
    .all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  const user = request.user;
  const { cliente_id, nome, especie, raca, idade } = await request.json();
  const { meta } = await env.DB.prepare(
    `INSERT INTO pets (cliente_id, usuario_id, nome, especie, raca, idade)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(cliente_id, user.sub, nome, especie, raca, idade)
    .run();
  return Response.json({ id: meta.last_row_id });
}

export async function onRequestPut({ request, env }) {
  const user = request.user;
  const { id, cliente_id, nome, especie, raca, idade } = await request.json();
  await env.DB.prepare(
    `UPDATE pets SET cliente_id=?, nome=?, especie=?, raca=?, idade=?
     WHERE id=? AND usuario_id=?`,
  )
    .bind(cliente_id, nome, especie, raca, idade, id, user.sub)
    .run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const user = request.user;
  const { id } = await request.json();
  await env.DB.prepare(`DELETE FROM pets WHERE id=? AND usuario_id=?`)
    .bind(id, user.sub)
    .run();
  return Response.json({ ok: true });
}
```

---

## 9. functions/api/agendamentos.js

```js
export async function onRequestGet({ request, env }) {
  const user = request.user;
  const { results } = await env.DB.prepare(
    `SELECT a.*, p.nome as pet_nome
     FROM agendamentos a JOIN pets p ON a.pet_id = p.id
     WHERE a.usuario_id = ? ORDER BY a.data DESC, a.hora DESC`,
  )
    .bind(user.sub)
    .all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  const user = request.user;
  const { pet_id, servico, data, hora, observacoes } = await request.json();

  // Regra: máximo 5 pets por horário no serviço de banho e tosa
  if (servico === "banho-tosa") {
    const { count } = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM agendamentos
       WHERE servico='banho-tosa' AND data=? AND hora=?`,
    )
      .bind(data, hora)
      .first();
    if (count >= 5) {
      return Response.json(
        { error: "Limite de 5 pets por horário atingido para Banho e Tosa." },
        { status: 409 },
      );
    }
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO agendamentos (pet_id, usuario_id, servico, data, hora, observacoes)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(pet_id, user.sub, servico, data, hora, observacoes)
    .run();
  return Response.json({ id: meta.last_row_id });
}

export async function onRequestPut({ request, env }) {
  const user = request.user;
  const { id, servico, data, hora, status, observacoes } = await request.json();
  await env.DB.prepare(
    `UPDATE agendamentos SET servico=?, data=?, hora=?, status=?, observacoes=?
     WHERE id=? AND usuario_id=?`,
  )
    .bind(servico, data, hora, status, observacoes, id, user.sub)
    .run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const user = request.user;
  const { id } = await request.json();
  await env.DB.prepare(`DELETE FROM agendamentos WHERE id=? AND usuario_id=?`)
    .bind(id, user.sub)
    .run();
  return Response.json({ ok: true });
}
```

---

## 10. src/api.js (cliente HTTP)

```js
const BASE = "/api";

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export const api = {
  // Usuários
  syncUser: (body, token) => req("POST", "/usuarios", body, token),
  getUser: (token) => req("GET", "/usuarios", null, token),

  // Clientes
  getClientes: (token) => req("GET", "/clientes", null, token),
  createCliente: (body, token) => req("POST", "/clientes", body, token),
  updateCliente: (body, token) => req("PUT", "/clientes", body, token),
  deleteCliente: (body, token) => req("DELETE", "/clientes", body, token),

  // Pets
  getPets: (token) => req("GET", "/pets", null, token),
  createPet: (body, token) => req("POST", "/pets", body, token),
  updatePet: (body, token) => req("PUT", "/pets", body, token),
  deletePet: (body, token) => req("DELETE", "/pets", body, token),

  // Agendamentos
  getAgendamentos: (token) => req("GET", "/agendamentos", null, token),
  createAgendamento: (body, token) => req("POST", "/agendamentos", body, token),
  updateAgendamento: (body, token) => req("PUT", "/agendamentos", body, token),
  deleteAgendamento: (body, token) =>
    req("DELETE", "/agendamentos", body, token),
};
```

---

## 11. Variáveis de ambiente no Cloudflare Pages

No painel **Cloudflare Pages → Settings → Environment Variables**, adicione:

| Variável          | Valor                              |
| ----------------- | ---------------------------------- |
| `AUTH0_DOMAIN`    | `diegoneve.us.auth0.com`           |
| `AUTH0_CLIENT_ID` | `Rbs6oSmgy5jIYw5ds57Gg2p38vaR2Cpk` |

---

## 12. Deploy

```bash
# Instalar dependências
npm install

# Build do React
npm run build

# Deploy para Cloudflare Pages
wrangler pages deploy dist
```

---

## 13. Auth0 — URLs permitidas

No painel Auth0 → Applications → sua app → Settings, adicione a URL do Pages:

| Campo                 | Valor                       |
| --------------------- | --------------------------- |
| Allowed Callback URLs | `https://petshop.pages.dev` |
| Allowed Logout URLs   | `https://petshop.pages.dev` |
| Allowed Web Origins   | `https://petshop.pages.dev` |

---

## Fluxo completo

```
Usuário faz login (Auth0)
    → recebe access_token JWT
    → frontend chama /api/usuarios (POST) para sincronizar com D1
    → todas as chamadas seguintes enviam Bearer token
    → middleware valida JWT usando chaves públicas do Auth0
    → Functions leem/gravam no D1 filtrando por usuario_id (sub do Auth0)
```
