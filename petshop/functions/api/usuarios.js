const JSON_HEADER = { "Content-Type": "application/json" };

export async function onRequestPost({ request, env }) {
  const user = request.user;
  const { nome, email } = await request.json();

  await env.DB.prepare(
    `
    INSERT INTO usuarios (id, email, nome)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, email = excluded.email
  `,
  )
    .bind(user.sub, email, nome)
    .run();

  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADER });
}

export async function onRequestGet({ request, env }) {
  const user = request.user;
  const row = await env.DB.prepare(`SELECT * FROM usuarios WHERE id = ?`)
    .bind(user.sub)
    .first();
  return new Response(JSON.stringify(row), { headers: JSON_HEADER });
}
