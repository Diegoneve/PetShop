function LoginScreen({ onLogin, onGoRegister, error, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-3xl">🐾</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mt-4">Bem-vindo ao PetShop</h1>
            <p className="text-gray-500 text-sm mt-1">Faça login para continuar</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-start gap-2">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onLogin(email, password)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm pr-12"
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={() => onLogin(email, password)}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <><span className="animate-spin inline-block">⏳</span> Entrando...</> : "Entrar"}
            </button>

            <div className="relative flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={onGoRegister}
              className="w-full py-3 rounded-xl font-bold text-purple-600 border-2 border-purple-200 hover:bg-purple-50 transition"
            >
              Criar nova conta
            </button>
          </div>
        </div>
        <p className="text-center text-white text-xs mt-4 opacity-70">Autenticação segura via Auth0 🔒</p>
      </div>
    </div>
  );
}
