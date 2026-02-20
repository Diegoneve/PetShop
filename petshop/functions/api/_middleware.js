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
