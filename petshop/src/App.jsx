import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "./api";

// ─── Constantes ───────────────────────────────────────────────────────────────
const TABS = { CLIENTES: "clientes", PETS: "pets", AGENDA: "agendamentos" };
const SERVICOS = [
  { id: "veterinario", label: "Veterinário", icon: "🩺" },
  { id: "banho-tosa", label: "Banho e Tosa", icon: "✂️" },
  { id: "spa", label: "SPA", icon: "💧" },
  { id: "hotel", label: "Hotel", icon: "🏨" },
];
const servicoLabel = (id) => SERVICOS.find((s) => s.id === id)?.label ?? id;
const servicoIcon = (id) => SERVICOS.find((s) => s.id === id)?.icon ?? "📋";

// ─── UI base ──────────────────────────────────────────────────────────────────
function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
}) {
  const base =
    "rounded-xl font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const sz = size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm";
  const v = {
    primary:
      "text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow",
    secondary: "text-purple-600 border-2 border-purple-200 hover:bg-purple-50",
    danger: "text-red-500 border-2 border-red-200 hover:bg-red-50",
    ghost: "text-gray-400 hover:bg-gray-100",
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sz} ${v} ${className}`}
    >
      {children}
    </button>
  );
}

function Inp({ label, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
      />
    </div>
  );
}

function Sel({ label, children, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm bg-white"
      >
        {children}
      </select>
    </div>
  );
}

function Alert({ type = "error", children }) {
  const s = {
    error: "bg-red-50   border-red-200   text-red-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50  border-blue-200  text-blue-700",
  }[type];
  return (
    <div className={`border rounded-xl px-3 py-2.5 text-xs flex gap-2 ${s}`}>
      <span>{type === "error" ? "⚠️" : type === "success" ? "✅" : "ℹ️"}</span>
      <span>{children}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-10 text-3xl animate-spin">⏳</div>
  );
}
function Empty({ icon, msg }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-xs">{msg}</p>
    </div>
  );
}

function FullscreenGradient({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {children}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onRegister, loading, error }) {
  return (
    <FullscreenGradient>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-7">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg text-3xl">
              🐾
            </div>
            <h1 className="text-xl font-bold text-gray-800 mt-3">
              Bem-vindo ao PetShop
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Acesse sua conta para continuar
            </p>
          </div>
          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}
          <div className="space-y-3">
            <Btn onClick={onLogin} disabled={loading} className="w-full py-3">
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Redirecionando...
                </>
              ) : (
                "🔐 Entrar com Auth0"
              )}
            </Btn>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Btn
              variant="secondary"
              onClick={onRegister}
              disabled={loading}
              className="w-full py-3"
            >
              ✨ Criar nova conta
            </Btn>
          </div>
          <p className="text-center text-gray-400 text-xs mt-5">
            Você será redirecionado para a página segura do Auth0
          </p>
        </div>
        <p className="text-center text-white text-xs mt-3 opacity-60">
          Protegido por Auth0 🔒
        </p>
      </div>
    </FullscreenGradient>
  );
}

// ─── CRUD Clientes ────────────────────────────────────────────────────────────
function ClientesTab({ token, clientes, loading, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSav] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const open = (mode, data = {}) => {
    setForm(data);
    setErr("");
    setModal(mode);
  };
  const close = () => setModal(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.nome) return setErr("Nome é obrigatório.");
    setSav(true);
    setErr("");
    try {
      modal === "new"
        ? await api.createCliente(form, token)
        : await api.updateCliente(form, token);
      reload();
      close();
    } catch (e) {
      setErr(e.error || "Erro ao salvar.");
    }
    setSav(false);
  };

  const remove = async (id) => {
    if (!confirm("Remover cliente e seus pets?")) return;
    try {
      await api.deleteCliente({ id }, token);
      reload();
    } catch {
      alert("Erro ao remover.");
    }
  };

  const list = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(q.toLowerCase()) ||
      (c.telefone || "").includes(q),
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="🔍 Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
        />
        <Btn onClick={() => open("new")}>+ Adicionar</Btn>
      </div>
      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty icon="👤" msg="Nenhum cliente cadastrado." />
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <div
              key={c.id}
              className="border-2 border-gray-100 rounded-xl p-3 hover:shadow transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-800">{c.nome}</p>
                  {c.telefone && (
                    <p className="text-xs text-gray-500">📞 {c.telefone}</p>
                  )}
                  {c.email && (
                    <p className="text-xs text-gray-500">✉️ {c.email}</p>
                  )}
                  {c.endereco && (
                    <p className="text-xs text-gray-500">📍 {c.endereco}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => open("edit", c)}
                  >
                    ✏️
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => remove(c.id)}>
                    🗑️
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal
          title={modal === "new" ? "Novo Cliente" : "Editar Cliente"}
          onClose={close}
        >
          <div className="space-y-3">
            {err && <Alert>{err}</Alert>}
            <Inp
              label="Nome *"
              placeholder="João Silva"
              value={form.nome || ""}
              onChange={set("nome")}
            />
            <Inp
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={form.telefone || ""}
              onChange={set("telefone")}
            />
            <Inp
              label="E-mail"
              type="email"
              placeholder="joao@email.com"
              value={form.email || ""}
              onChange={set("email")}
            />
            <Inp
              label="Endereço"
              placeholder="Rua das Flores, 123"
              value={form.endereco || ""}
              onChange={set("endereco")}
            />
            <Btn onClick={save} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CRUD Pets ────────────────────────────────────────────────────────────────
function PetsTab({ token, pets, clientes, loading, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSav] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const open = (mode, data = {}) => {
    setForm(data);
    setErr("");
    setModal(mode);
  };
  const close = () => setModal(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.nome || !form.cliente_id)
      return setErr("Nome e cliente são obrigatórios.");
    setSav(true);
    setErr("");
    try {
      modal === "new"
        ? await api.createPet(form, token)
        : await api.updatePet(form, token);
      reload();
      close();
    } catch (e) {
      setErr(e.error || "Erro ao salvar.");
    }
    setSav(false);
  };

  const remove = async (id) => {
    if (!confirm("Remover pet?")) return;
    try {
      await api.deletePet({ id }, token);
      reload();
    } catch {
      alert("Erro ao remover.");
    }
  };

  const list = pets.filter(
    (p) =>
      p.nome.toLowerCase().includes(q.toLowerCase()) ||
      (p.cliente_nome || "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="🔍 Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
        />
        <Btn onClick={() => open("new")} disabled={clientes.length === 0}>
          + Adicionar
        </Btn>
      </div>
      {clientes.length === 0 && (
        <div className="mb-3">
          <Alert type="info">
            Cadastre um cliente antes de adicionar pets.
          </Alert>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty icon="🐾" msg="Nenhum pet cadastrado." />
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <div
              key={p.id}
              className="border-2 border-gray-100 rounded-xl p-3 hover:shadow transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-800">{p.nome}</p>
                  {(p.especie || p.raca) && (
                    <p className="text-xs text-gray-500">
                      🐾 {[p.especie, p.raca].filter(Boolean).join(" — ")}
                    </p>
                  )}
                  {p.idade && (
                    <p className="text-xs text-gray-500">
                      🎂 {p.idade} ano{p.idade != 1 ? "s" : ""}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">👤 {p.cliente_nome}</p>
                </div>
                <div className="flex gap-1">
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => open("edit", p)}
                  >
                    ✏️
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => remove(p.id)}>
                    🗑️
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal
          title={modal === "new" ? "Novo Pet" : "Editar Pet"}
          onClose={close}
        >
          <div className="space-y-3">
            {err && <Alert>{err}</Alert>}
            <Sel
              label="Cliente *"
              value={form.cliente_id || ""}
              onChange={set("cliente_id")}
            >
              <option value="">Selecione o dono</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Sel>
            <Inp
              label="Nome *"
              placeholder="Rex"
              value={form.nome || ""}
              onChange={set("nome")}
            />
            <Inp
              label="Espécie"
              placeholder="Cachorro..."
              value={form.especie || ""}
              onChange={set("especie")}
            />
            <Inp
              label="Raça"
              placeholder="Labrador..."
              value={form.raca || ""}
              onChange={set("raca")}
            />
            <Inp
              label="Idade (anos)"
              type="number"
              min="0"
              value={form.idade || ""}
              onChange={set("idade")}
            />
            <Btn onClick={save} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CRUD Agendamentos ────────────────────────────────────────────────────────
function AgendaTab({ token, agendamentos, pets, loading, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSav] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const open = (mode, data = {}) => {
    setForm(data);
    setErr("");
    setModal(mode);
  };
  const close = () => setModal(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.pet_id || !form.servico || !form.data || !form.hora)
      return setErr("Pet, serviço, data e hora são obrigatórios.");
    setSav(true);
    setErr("");
    try {
      modal === "new"
        ? await api.createAgendamento(form, token)
        : await api.updateAgendamento(form, token);
      reload();
      close();
    } catch (e) {
      setErr(e.error || "Erro ao salvar.");
    }
    setSav(false);
  };

  const remove = async (id) => {
    if (!confirm("Cancelar agendamento?")) return;
    try {
      await api.deleteAgendamento({ id }, token);
      reload();
    } catch {
      alert("Erro ao remover.");
    }
  };

  const statusCls = (s) =>
    ({
      agendado: "bg-blue-100 text-blue-700",
      concluido: "bg-green-100 text-green-700",
      cancelado: "bg-red-100 text-red-700",
    })[s] ?? "bg-gray-100 text-gray-600";

  const list = agendamentos.filter(
    (a) =>
      (a.pet_nome || "").toLowerCase().includes(q.toLowerCase()) ||
      servicoLabel(a.servico).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="🔍 Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none"
        />
        <Btn onClick={() => open("new")} disabled={pets.length === 0}>
          + Agendar
        </Btn>
      </div>
      {pets.length === 0 && (
        <div className="mb-3">
          <Alert type="info">
            Cadastre um pet antes de criar agendamentos.
          </Alert>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <Empty icon="📅" msg="Nenhum agendamento encontrado." />
      ) : (
        <div className="space-y-2">
          {list.map((a) => (
            <div
              key={a.id}
              className="border-2 border-gray-100 rounded-xl p-3 hover:shadow transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    {servicoIcon(a.servico)} {servicoLabel(a.servico)}
                  </p>
                  <p className="text-xs text-gray-500">🐾 {a.pet_nome}</p>
                  <p className="text-xs text-gray-500">
                    📅 {a.data} às {a.hora}
                  </p>
                  {a.observacoes && (
                    <p className="text-xs text-gray-500">📝 {a.observacoes}</p>
                  )}
                  <span
                    className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls(a.status)}`}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => open("edit", a)}
                  >
                    ✏️
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => remove(a.id)}>
                    🗑️
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <Modal
          title={modal === "new" ? "Novo Agendamento" : "Editar Agendamento"}
          onClose={close}
        >
          <div className="space-y-3">
            {err && <Alert>{err}</Alert>}
            <Sel
              label="Pet *"
              value={form.pet_id || ""}
              onChange={set("pet_id")}
            >
              <option value="">Selecione o pet</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.cliente_nome})
                </option>
              ))}
            </Sel>
            <Sel
              label="Serviço *"
              value={form.servico || ""}
              onChange={set("servico")}
            >
              <option value="">Selecione o serviço</option>
              {SERVICOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.label}
                </option>
              ))}
            </Sel>
            <div className="grid grid-cols-2 gap-2">
              <Inp
                label="Data *"
                type="date"
                value={form.data || ""}
                onChange={set("data")}
              />
              <Inp
                label="Hora *"
                type="time"
                value={form.hora || ""}
                onChange={set("hora")}
              />
            </div>
            {modal === "edit" && (
              <Sel
                label="Status"
                value={form.status || "agendado"}
                onChange={set("status")}
              >
                <option value="agendado">Agendado</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </Sel>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Observações
              </label>
              <textarea
                rows={2}
                placeholder="Informações adicionais..."
                value={form.observacoes || ""}
                onChange={set("observacoes")}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm resize-none"
              />
            </div>
            <Btn onClick={save} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ token, user, onLogout }) {
  const [tab, setTab] = useState(TABS.CLIENTES);
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalErr, setGlobalErr] = useState("");

  const reload = useCallback(async () => {
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
      setGlobalErr("Erro ao carregar dados. Verifique a conexão.");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

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
      count: agenda.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow">
              🐾
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800 leading-none">
                PetShop
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <Btn variant="danger" size="sm" onClick={onLogout}>
            Sair
          </Btn>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {tabs.map((t) => (
            <div
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`bg-white rounded-2xl shadow p-3 text-center cursor-pointer hover:shadow-md transition border-2 ${tab === t.id ? "border-blue-400" : "border-transparent"}`}
            >
              <p className="text-2xl">{t.icon}</p>
              <p className="text-xl font-bold text-gray-800">{t.count}</p>
              <p className="text-xs text-gray-400">{t.label}</p>
            </div>
          ))}
        </div>

        {globalErr && (
          <div className="mb-4">
            <Alert>{globalErr}</Alert>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="flex border-b">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-xs font-semibold transition ${tab === t.id ? "border-b-4 border-blue-500 text-blue-600" : "text-gray-400 hover:bg-gray-50"}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="p-4">
            {tab === TABS.CLIENTES && (
              <ClientesTab
                token={token}
                clientes={clientes}
                loading={loading}
                reload={reload}
              />
            )}
            {tab === TABS.PETS && (
              <PetsTab
                token={token}
                pets={pets}
                clientes={clientes}
                loading={loading}
                reload={reload}
              />
            )}
            {tab === TABS.AGENDA && (
              <AgendaTab
                token={token}
                agendamentos={agenda}
                pets={pets}
                loading={loading}
                reload={reload}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const {
    isLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error,
  } = useAuth0();
  const [token, setToken] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setSyncing(true);
      try {
        const t = await getAccessTokenSilently();
        setToken(t);
        await api.syncUser({ nome: user.name, email: user.email }, t);
      } catch (e) {
        console.error("Erro ao sincronizar usuário:", e);
      }
      setSyncing(false);
    })();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  const handleLogout = () =>
    logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading || syncing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <div className="text-5xl animate-spin">⏳</div>
          <p className="font-semibold">
            {syncing ? "Sincronizando conta..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
          <p className="text-5xl mb-4">❌</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Erro de autenticação
          </h2>
          <p className="text-red-600 text-sm mb-6">{error.message}</p>
          <Btn onClick={() => loginWithRedirect()} className="w-full">
            Tentar novamente
          </Btn>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={() =>
          loginWithRedirect({ authorizationParams: { screen_hint: "login" } })
        }
        onRegister={() =>
          loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })
        }
      />
    );
  }

  return <Dashboard token={token} user={user} onLogout={handleLogout} />;
}
