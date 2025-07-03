// Local: src/components/Layout.jsx

import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const rota = useLocation().pathname;
  // O estado agora controla o menu em todas as resoluções
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  
  const { user, handleLogout } = useAuth();

  const menuItems = [
    { href: "/planejamento", label: "🧠 Planejamento" },
    { href: "/simulador", label: "📊 Simulador" },
    { href: "/sonar", label: "📡 Sonar" },
    { href: "/metricas-agendamento", label: "🗓️ Métricas de Agendamento" },
    { href: "/cpa-maximo", label: "🎯 CPA Máximo" },
    { href: "/analisador-ia", label: "🤖 Gestor de Tráfego Sênior" },
    { href: "/conta", label: "👤 Conta" },
  ];

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">
      {/* --- Overlay (agora funciona em todas as telas) --- */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* --- MENU GAVETA (agora funciona em todas as telas) --- */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0b0b0be6] backdrop-blur-md p-6 shadow-xl flex flex-col
                   border-r border-[#1f1f1f] z-40
                   transition-transform duration-300 ease-in-out
                   ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* LOGO E BOTÃO DE FECHAR (agora visível quando o menu está aberto) */}
        <div className="flex justify-between items-center w-full flex-shrink-0">
          <img
            src="/logo-legiao.png"
            alt="Logo Legião"
            className="w-32 h-auto"
          />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-zinc-400 hover:text-white"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="w-full flex flex-col gap-2 mt-4">
          <h2 className="text-lg text-center font-bold bg-gradient-to-r from-[#008CFF] to-[#ED195C] bg-clip-text text-transparent mb-4">
            Bússola Digital
          </h2>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={`block py-2 px-3 rounded-lg transition text-sm font-medium ${
                rota === item.href
                  ? "bg-gradient-to-r from-[#008CFF] to-[#ED195C] text-white font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RODAPÉ DO MENU */}
        <div className="mt-auto w-full pt-6 border-t border-zinc-800">
            {user && (
                <div className='flex items-center gap-3 mb-4'>
                    <User className="w-8 h-8 p-1.5 rounded-full bg-zinc-700 text-zinc-300 flex-shrink-0"/>
                    <div className="flex-1 truncate">
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>
                </div>
            )}
             <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition text-sm font-medium text-zinc-400 hover:bg-red-900/50 hover:text-red-400`}
            >
              <LogOut size={16} />
              Sair
            </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* CABEÇALHO com Ícone Hamburger (agora visível em todas as telas) */}
        <header className="flex items-center mb-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="text-white p-2"
            aria-label="Abrir menu"
          >
            <Menu size={28} />
          </button>
        </header>

        <Outlet />
      </main>
    </div>
  );
}