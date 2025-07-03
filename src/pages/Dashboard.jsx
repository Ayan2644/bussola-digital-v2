import { useState } from "react";
import { supabase } from "../supabase";
import Simulador from "./Simulador";
import Conta from "./Conta";

export default function Dashboard({ session }) {
  const [aba, setAba] = useState("simulador");

  const menus = [
    { id: "simulador", nome: "Simulador de Escala" },
    { id: "conta", nome: "Minha Conta" },
  ];

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Menu Lateral */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <h1 className="text-2xl font-bold mb-8 text-center">🧭 Bússola Digital</h1>
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setAba(menu.id)}
            className={`text-left mb-3 px-4 py-2 rounded ${
              aba === menu.id
                ? "bg-gradient-to-r from-pink-500 to-purple-600"
                : "hover:bg-gray-700"
            }`}
          >
            {menu.nome}
          </button>
        ))}
        <div className="mt-auto">
          <button
            onClick={logout}
            className="text-sm text-red-400 hover:text-red-200 mt-6"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 overflow-auto">
        {aba === "simulador" && <Simulador />}
        {aba === "conta" && <Conta user={session.user} />}
      </main>
    </div>
  );
}
