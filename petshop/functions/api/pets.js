const H = { "Content-Type": "application/json" };

export async function onRequestGet({ request, env }) {
  const { results } = await env.DB.prepare(
    `
    SELECT p.*, c.nome AS cliente_nome
    FROM pets p
    JOIN clientes c ON p.cliente_id = c.id
    WHERE p.usuario_id = ?
    ORDER BY p.criado_em DESC
  `,
  )
    .bind(request.user.sub)
    .all();
  return new Response(JSON.stringify(results), { headers: H });
}

export async function onRequestPost({ request, env }) {
  const { cliente_id, nome, especie, raca, idade } = await request.json();
  const { meta } = await env.DB.prepare(
    `INSERT INTO pets (cliente_id, usuario_id, nome, especie, raca, idade)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(cliente_id, request.user.sub, nome, especie, raca, idade)
    .run();
  return new Response(JSON.stringify({ id: meta.last_row_id }), { headers: H });
}

export async function onRequestPut({ request, env }) {
  const { id, cliente_id, nome, especie, raca, idade } = await request.json();
  await env.DB.prepare(
    `UPDATE pets SET cliente_id=?, nome=?, especie=?, raca=?, idade=?
     WHERE id=? AND usuario_id=?`,
  )
    .bind(cliente_id, nome, especie, raca, idade, id, request.user.sub)
    .run();
  return new Response(JSON.stringify({ ok: true }), { headers: H });
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json();
  await env.DB.prepare(`DELETE FROM pets WHERE id=? AND usuario_id=?`)
    .bind(id, request.user.sub)
    .run();
  return new Response(JSON.stringify({ ok: true }), { headers: H });
}
