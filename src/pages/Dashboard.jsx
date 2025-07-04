// Local de Instalação: src/pages/Dashboard.jsx
// CÓDIGO DE TESTE SIMPLIFICADO PARA ISOLAR O ERRO

import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Calendar as CalendarIcon, ShoppingCart, ChevronDown } from 'lucide-react';

// Componente de card simplificado, sem lógica complexa
const KPICard = ({ title, metric, delta }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <p className="text-zinc-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{metric}</p>
        <p className="mt-1 flex items-center space-x-1 text-sm text-zinc-400">
            <span>{delta}</span>
        </p>
    </div>
);

// Componente principal do Dashboard, sem busca de dados ou estados
export default function Dashboard() {
    return (
        <div className="text-white px-4 py-10">
            <PageHeader title="Resumo de Performance" description="Sua central de inteligência para análise de dados e tomada de decisão estratégica." />

            <div className="w-full max-w-7xl mx-auto mt-8 space-y-8">
                {/* --- SEÇÃO DE FILTROS --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <button className="input flex-1 w-full text-left flex items-center justify-between">
                        <div className="flex items-center gap-2"><CalendarIcon size={16} /><span>Filtrar Período</span></div>
                        <ChevronDown size={16}/>
                    </button>
                    <button className="input flex-1 w-full text-left flex items-center justify-between">
                        <div className="flex items-center gap-2"><ShoppingCart size={16}/><span>Todos os Produtos</span></div>
                        <ChevronDown size={16}/>
                    </button>
                </div>
                
                {/* --- SEÇÃO DE KPIs COM DADOS ESTÁTICOS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <KPICard title="Faturamento Total" metric="R$ 0,00" delta="Carregando dados..." />
                    <KPICard title="Lucro Total" metric="R$ 0,00" delta="Carregando dados..." />
                    <KPICard title="ROAS Total" metric="0.00" delta="Carregando dados..." />
                </div>
                
                {/* --- SEÇÃO DE GRÁFICOS COM PLACEHOLDERS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white">Performance ao Longo do Tempo</h3>
                        <div className="h-80 flex items-center justify-center text-zinc-500">O gráfico aparecerá aqui.</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Faturamento por Produto</h3>
                         <div className="h-64 flex items-center justify-center text-zinc-500">O gráfico aparecerá aqui.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}