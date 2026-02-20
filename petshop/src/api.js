const BASE = "/api";

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export const api = {
  // Usuários
  syncUser: (body, token) => req("POST", "/usuarios", body, token),

  // Clientes
  getClientes: (token) => req("GET", "/clientes", null, token),
  createCliente: (body, token) => req("POST", "/clientes", body, token),
  updateCliente: (body, token) => req("PUT", "/clientes", body, token),
  deleteCliente: (body, token) => req("DELETE", "/clientes", body, token),

  // Pets
  getPets: (token) => req("GET", "/pets", null, token),
  createPet: (body, token) => req("POST", "/pets", body, token),
  updatePet: (body, token) => req("PUT", "/pets", body, token),
  deletePet: (body, token) => req("DELETE", "/pets", body, token),

  // Agendamentos
  getAgendamentos: (token) => req("GET", "/agendamentos", null, token),
  createAgendamento: (body, token) => req("POST", "/agendamentos", body, token),
  updateAgendamento: (body, token) => req("PUT", "/agendamentos", body, token),
  deleteAgendamento: (body, token) =>
    req("DELETE", "/agendamentos", body, token),
};
