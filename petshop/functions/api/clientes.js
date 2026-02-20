const H = { "Content-Type": "application/json" };

export async function onRequestGet({ request, env }) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM clientes WHERE usuario_id = ? ORDER BY criado_em DESC`,
  )
    .bind(request.user.sub)
    .all();
  return new Response(JSON.stringify(results), { headers: H });
}

export async function onRequestPost({ request, env }) {
  const { nome, telefone, email, endereco } = await request.json();
  const { meta } = await env.DB.prepare(
    `INSERT INTO clientes (usuario_id, nome, telefone, email, endereco)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(request.user.sub, nome, telefone, email, endereco)
    .run();
  return new Response(JSON.stringify({ id: meta.last_row_id }), { headers: H });
}

export async function onRequestPut({ request, env }) {
  const { id, nome, telefone, email, endereco } = await request.json();
  await env.DB.prepare(
    `UPDATE clientes SET nome=?, telefone=?, email=?, endereco=?
     WHERE id=? AND usuario_id=?`,
  )
    .bind(nome, telefone, email, endereco, id, request.user.sub)
    .run();
  return new Response(JSON.stringify({ ok: true }), { headers: H });
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json();
  await env.DB.prepare(`DELETE FROM clientes WHERE id=? AND usuario_id=?`)
    .bind(id, request.user.sub)
    .run();
  return new Response(JSON.stringify({ ok: true }), { headers: H });
}
