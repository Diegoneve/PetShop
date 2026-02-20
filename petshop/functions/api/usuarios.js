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
