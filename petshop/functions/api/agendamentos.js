const H = { "Content-Type": "application/json" };

export async function onRequestGet({ request, env }) {
  const { results } = await env.DB.prepare(
    `
    SELECT a.*, p.nome AS pet_nome
    FROM agendamentos a
    JOIN pets p ON a.pet_id = p.id
    WHERE a.usuario_id = ?
    ORDER BY a.data DESC, a.hora DESC
  `,
  )
    .bind(request.user.sub)
    .all();
  return new Response(JSON.stringify(results), { headers: H });
}

export async function onRequestPost({ request, env }) {
  const { pet_id, servico, data, hora, observacoes } = await request.json();

  // Regra de negócio: máximo 5 pets por horário para banho e tosa
  if (servico === "banho-tosa") {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) AS count FROM agendamentos
       WHERE servico='banho-tosa' AND data=? AND hora=?`,
    )
      .bind(data, hora)
      .first();
    if (row.count >= 5) {
      return new Response(
        JSON.stringify({
          error: "Limite de 5 pets por horário atingido para Banho e Tosa.",
        }),
        { status: 409, headers: H },
      );
    }
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO agendamentos (pet_id, usuario_id, servico, data, hora, observacoes)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(pet_id, request.user.sub, servico, data, hora, observacoes)
    .run();
  return new Response(JSON.stringify({ id: meta.last_row_id }), { headers: H });
}

export async function onRequestPut({ request, env }) {
  const { id, servico, data, hora, status, observacoes } = await request.json();
  await env.DB.prepare(
    `UPDATE agendamentos SET servico=?, data=?, hora=?, status=?, observacoes=?
     WHERE id=? AND usuario_id=?`,
  )
    .bind(servico, data, hora, status, observacoes, id, request.user.sub)
    .run();
  return new Response(JSON.stringify({ ok: true }), { headers: H });
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json();
  await env.DB.prepare(`DELETE FROM agendamentos WHERE id=? AND usuario_id=?`)
    .bind(id, request.user.sub)
    .run();
  return new Response(JSON.stringify({ ok: true }), { headers: H });
}
