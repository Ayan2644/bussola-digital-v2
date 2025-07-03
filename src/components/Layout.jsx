import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const rota = useLocation().pathname;

  const menuItems = [
    { href: "/planejamento", label: "🧠 Planejamento" },
    { href: "/simulador", label: "📊 Simulador" },
    { href: "/sonar", label: "📡 Sonar" },
    { href: "/metricas-agendamento", label: "🗓️ Métricas de Agendamento" },
    { href: "/cpa-maximo", label: "🎯 CPA Máximo" },
    { href: "/analisador-ia", label: "🤖 Gestor de Tráfego Sênior" },
    { href: "/conta", label: "👤 Conta" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0f0f0f] text-white">
      {/* MENU LATERAL */}
      <aside className="w-64 bg-[#0b0b0be6] backdrop-blur-md p-6 space-y-6 shadow-xl hidden md:flex flex-col items-center border-r border-[#1f1f1f]">

        {/* LOGO */}
        <img
          src="/logo-legiao.png"
          alt="Logo Legião"
          className="w-32 h-auto mb-4"
        />

        <h2 className="text-lg text-center font-bold bg-gradient-to-r from-[#008CFF] to-[#ED195C] bg-clip-text text-transparent">
          Bússola Digital
        </h2>

        {/* NAVEGAÇÃO */}
        <nav className="w-full flex flex-col gap-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
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
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
