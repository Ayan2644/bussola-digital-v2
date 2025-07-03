// Local de Instalação: src/components/Layout.jsx
// CÓDIGO COMPLETO E DEFINITIVO

import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const rota = useLocation().pathname;
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktopMenuCollapsed, setDesktopMenuCollapsed] = useState(
    // Inicia o menu recolhido se o utilizador já o tinha definido assim
    () => localStorage.getItem('desktopMenuCollapsed') === 'true'
  );

  const { user, handleLogout } = useAuth();

  // Salva a preferência do utilizador no localStorage
  useEffect(() => {
    localStorage.setItem('desktopMenuCollapsed', isDesktopMenuCollapsed);
  }, [isDesktopMenuCollapsed]);

  const menuItems = [
    { href: "/planejamento", label: "Planejamento", icon: "🧠" },
    { href: "/simulador", label: "Simulador", icon: "📊" },
    { href: "/sonar", label: "Sonar", icon: "📡" },
    { href: "/metricas-agendamento", label: "Agendamento", icon: "🗓️" },
    { href: "/cpa-maximo", label: "CPA Máximo", icon: "🎯" },
    { href: "/analisador-ia", label: "Gestor Sênior", icon: "🤖" },
    { href: "/conta", label: "Conta", icon: "👤" },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">
      {/* --- Overlay para o Menu Móvel --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* --- MENU LATERAL (Comportamento duplo e altura corrigida) --- */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#0b0b0be6] backdrop-blur-md p-4 shadow-xl flex flex-col border-r border-[#1f1f1f] z-40
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isDesktopMenuCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* ... (conteúdo do menu como na versão anterior, com ajustes) ... */}
        <div className={`flex items-center justify-between w-full flex-shrink-0 mb-4 ${isDesktopMenuCollapsed ? 'lg:justify-center' : 'lg:justify-between'}`}>
            {/* Logo visível apenas quando expandido no desktop */}
            {!isDesktopMenuCollapsed && (
                <img
                    src="/logo-legiao.png"
                    alt="Logo Legião"
                    className="w-32 h-auto transition-opacity duration-200 hidden lg:block"
                />
            )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-zinc-400 hover:text-white lg:hidden"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={`group relative flex items-center py-2 px-3 rounded-lg transition-colors text-sm font-medium ${rota === item.href ? "bg-gradient-to-r from-[#008CFF] to-[#ED195C] text-white font-semibold" : "text-zinc-300 hover:bg-zinc-800"}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`overflow-hidden transition-all duration-200 ${isDesktopMenuCollapsed ? "lg:w-0 lg:opacity-0 ml-0" : "lg:w-full ml-3"}`}>
                {item.label}
              </span>

              {isDesktopMenuCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="w-full pt-4 border-t border-zinc-800">
            {user && !isDesktopMenuCollapsed && (
                <div className='flex items-center gap-3 mb-4'>
                    <User className="w-8 h-8 p-1.5 rounded-full bg-zinc-700 text-zinc-300 flex-shrink-0"/>
                    <div className="flex-1 truncate">
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>
                </div>
            )}
             <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg transition text-sm font-medium text-zinc-400 hover:bg-red-900/50 hover:text-red-400 ${isDesktopMenuCollapsed ? 'lg:justify-center' : 'justify-start'}`}
            >
              <LogOut size={16} />
              <span className={`overflow-hidden transition-all ${isDesktopMenuCollapsed ? 'lg:w-0' : 'lg:w-auto ml-2'}`}>Sair</span>
            </button>
            <button 
              onClick={() => setDesktopMenuCollapsed(!isDesktopMenuCollapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-2 mt-2 py-2 px-3 rounded-lg transition text-sm font-medium text-zinc-400 hover:bg-zinc-800"
            >
              {isDesktopMenuCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL (com margem dinâmica para o menu desktop) --- */}
      <div className={`flex-1 flex flex-col w-full transition-all duration-300 ease-in-out ${isDesktopMenuCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        {/* CABEÇALHO MÓVEL (AGORA STICKY NOVAMENTE) */}
        <header className="sticky top-0 z-20 flex items-center p-4 bg-[#0f0f0f]/80 backdrop-blur-lg lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-white p-2"
            aria-label="Abrir menu"
          >
            <Menu size={28} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}