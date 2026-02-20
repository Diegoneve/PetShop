export async function onRequest({ request, env, next }) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "").trim();

  if (!token) {
    return new Response(JSON.stringify({ error: "Token ausente" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const [headerB64, payloadB64, sigB64] = token.split(".");

    const header = JSON.parse(atob(headerB64));
    const payload = JSON.parse(atob(payloadB64));

    // Verifica expiração
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error("Token expirado");
    }

    // Busca chaves públicas do Auth0
    const jwksRes = await fetch(
      `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    );
    const { keys } = await jwksRes.json();
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) throw new Error("Chave pública não encontrada");

    // Importa chave e verifica assinatura
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );

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
    if (!valid) throw new Error("Assinatura inválida");

    // Injeta payload no request para uso nas functions
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
