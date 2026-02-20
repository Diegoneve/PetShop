import { useState } from "react";

function RegisterScreen({ onRegister, onGoLogin, error, loading }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = () => {
    setLocalError("");
    if (password.length < 8)
      return setLocalError("A senha deve ter no mínimo 8 caracteres.");
    if (password !== confirm) return setLocalError("As senhas não coincidem.");
    onRegister(email, password, nome);
  };

  const passScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  const scoreColors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-500",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <button
            onClick={onGoLogin}
            className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
          >
            ← Voltar ao login
          </button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">
              Crie sua conta
            </h1>
            <p className="text-gray-500 text-sm mt-1">Rápido e gratuito</p>
          </div>

          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-start gap-2">
              <span>⚠️</span>
              <span>{localError || error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                placeholder="João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mín. 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm pr-12"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i < passScore ? scoreColors[passScore - 1] : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {["", "Fraca", "Razoável", "Boa", "Forte"][passScore]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirmar senha
              </label>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none text-sm ${confirm && confirm !== password ? "border-red-400" : "border-gray-200 focus:border-blue-500"}`}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password || !nome}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block">⏳</span>{" "}
                  Cadastrando...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </div>
        </div>
        <p className="text-center text-white text-xs mt-4 opacity-70">
          Autenticação segura via Auth0 🔒
        </p>
      </div>
    </div>
  );
}
