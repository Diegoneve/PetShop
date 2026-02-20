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
