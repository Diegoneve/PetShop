import { useCallback, useState } from "react";

function Dashboard({ token, user, onLogout }) {
  const [tab, setTab] = useState(TABS.CLIENTES);
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [agendamentos, setAgenda] = useState([]);
  const [loadingData, setLoading] = useState(true);
  const [globalErr, setGlobalErr] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setGlobalErr("");
    try {
      const [c, p, a] = await Promise.all([
        api.getClientes(token),
        api.getPets(token),
        api.getAgendamentos(token),
      ]);
      setClientes(c);
      setPets(p);
      setAgenda(a);
    } catch {
      setGlobalErr("Erro ao carregar dados. Verifique a conexão com a API.");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const tabs = [
    {
      id: TABS.CLIENTES,
      label: "Clientes",
      icon: "👤",
      count: clientes.length,
    },
    { id: TABS.PETS, label: "Pets", icon: "🐾", count: pets.length },
    {
      id: TABS.AGENDA,
      label: "Agendamentos",
      icon: "📅",
      count: agendamentos.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow">
              🐾
            </div>
            <div>
              <h1 className="font-bold text-gray-800 leading-none">PetShop</h1>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <Btn variant="danger" size="sm" onClick={onLogout}>
            Sair
          </Btn>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {tabs.map((t) => (
            <div
              key={t.id}
              onClick={() => setTab(t.id)}
              className="bg-white rounded-2xl shadow p-4 text-center cursor-pointer hover:shadow-md transition"
            >
              <p className="text-3xl">{t.icon}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{t.count}</p>
              <p className="text-xs text-gray-500">{t.label}</p>
            </div>
          ))}
        </div>

        {globalErr && (
          <div className="mb-4">
            <Alert>{globalErr}</Alert>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="flex border-b">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 px-2 text-sm font-semibold transition ${
                  tab === t.id
                    ? "border-b-4 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === TABS.CLIENTES && (
              <ClientesTab
                token={token}
                clientes={clientes}
                loading={loadingData}
                reload={fetchAll}
              />
            )}
            {tab === TABS.PETS && (
              <PetsTab
                token={token}
                pets={pets}
                clientes={clientes}
                loading={loadingData}
                reload={fetchAll}
              />
            )}
            {tab === TABS.AGENDA && (
              <AgendamentosTab
                token={token}
                agendamentos={agendamentos}
                pets={pets}
                loading={loadingData}
                reload={fetchAll}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
