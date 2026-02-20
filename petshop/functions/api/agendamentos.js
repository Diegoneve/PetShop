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
