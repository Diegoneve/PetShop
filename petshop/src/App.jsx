import { useState } from 'react'
import './App.css'

export default function App() {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently, error } = useAuth0();
  const [token, setToken] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Obtém access token e sincroniza usuário no D1 após login
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setSyncing(true);
      try {
        const t = await getAccessTokenSilently();
        setToken(t);
        await api.syncUser({ nome: user.name, email: user.email }, t);
      } catch (e) { console.error("Erro ao sincronizar usuário:", e); }
      setSyncing(false);
    })();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  const handleLogout = () =>
    logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading || syncing) {
    return (
      <FullscreenGradient>
        <div className="text-white text-center space-y-4">
          <div className="text-5xl animate-spin">⏳</div>
          <p className="font-semibold text-lg">{syncing ? "Sincronizando conta..." : "Carregando..."}</p>
        </div>
      </FullscreenGradient>
    );
  }

  if (error) {
    return (
      <FullscreenGradient>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <p className="text-5xl mb-4">❌</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro de autenticação</h2>
          <p className="text-red-600 text-sm mb-6">{error.message}</p>
          <Btn onClick={() => loginWithRedirect()} className="w-full">Tentar novamente</Btn>
        </div>
      </FullscreenGradient>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={() => loginWithRedirect({ authorizationParams: { screen_hint: "login" } })}
        onRegister={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })}
      />
    );
  }

  return <Dashboard token={token} user={user} onLogout={handleLogout} />;
}
Remix de Sistema de Gerenciamento PetShop - Claude