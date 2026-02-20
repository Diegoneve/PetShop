// const headers = { "Content-Type": "application/json" };

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
