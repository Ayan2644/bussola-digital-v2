// Local de Instalação: src/pages/Planejamento.jsx
// CÓDIGO COMPLETO E ATUALIZADO USANDO OS NOVOS COMPONENTES

import React, { useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useToolData } from '../hooks/useToolData';
import InfoCard from '../components/ui/InfoCard';
import { Save, LoaderCircle, Check, Target, DollarSign, Users, TrendingUp, BarChart, ShoppingCart } from 'lucide-react';

// Importando os novos componentes que criamos
import LabeledSlider from '../components/ui/LabeledSlider';
import DropdownInput from '../components/ui/DropdownInput';

// O componente ResultCard permanece, pois é mais específico desta página.
function ResultCard({ title, value, subtext, icon: Icon, className = "" }) {
    return (
      <div className={`bg-[#1D1D1D]/50 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full ${className}`}>
        <div>
          <div className="flex items-center justify-between text-zinc-400">
            <h2 className="text-sm font-medium whitespace-nowrap">{title}</h2>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <p className="font-bold text-white text-3xl md:text-4xl mt-2 break-words">
            {value}
          </p>
        </div>
        {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
      </div>
    );
}

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function PlanejamentoEstrategico() {
    const initialState = {
        metaFaturamento: 454000,
        tipoReceita: 'produto',
        valorReceita: 4680,
        metricaConversao: 'leads',
        eventosPorVenda: 20,
        custoPorEvento: 8,
    };

    const { data, setData, isLoading, isSaving, saveStatus, saveData } = useToolData('planejamento', initialState);

    const handleChange = (field, value) => setData(prevData => ({ ...prevData, [field]: value }));

    const opcoesReceita = [{ value: 'produto', label: 'Produto' }, { value: 'servico', label: 'Serviço' }, { value: 'comissao', label: 'Comissão' }];
    const opcoesMetrica = [{ value: 'leads', label: 'Leads' }, { value: 'cliques', label: 'Cliques' }, { value: 'checkouts', label: 'Checkouts' }, { value: 'conversas', label: 'Conversas' }];

    const custoLabel = useMemo(() => {
        const labels = { leads: 'Preço médio por Lead (CPL)', cliques: 'Custo médio por Clique (CPC)', checkouts: 'Custo por Iniciar Checkout', conversas: 'Custo por Conversa Iniciada' };
        return labels[data.metricaConversao];
    }, [data.metricaConversao]);

    const resultados = useMemo(() => {
        const vendasNecessarias = data.valorReceita > 0 ? data.metaFaturamento / data.valorReceita : 0;
        const eventosTotais = vendasNecessarias * data.eventosPorVenda;
        const investimentoTotal = eventosTotais * data.custoPorEvento;
        const lucroBruto = data.metaFaturamento - investimentoTotal;
        const roas = investimentoTotal > 0 ? data.metaFaturamento / investimentoTotal : 0;
        const taxaConversaoFinal = data.eventosPorVenda > 0 ? (1 / data.eventosPorVenda) * 100 : 0;
        const nomeEvento = opcoesMetrica.find(o => o.value === data.metricaConversao)?.label || data.metricaConversao;
        return { vendasNecessarias, eventosTotais, investimentoTotal, lucroBruto, roas, taxaConversaoFinal, nomeEvento };
    }, [data]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (isLoading) {
        return <div className="text-center p-10">Carregando dados...</div>
    }

    return (
        <div className="bg-[#0f0f0f] text-white px-4 py-10 flex flex-col items-center">
            <PageHeader title="Planejamento Estratégico" description="Simule cenários e descubra o investimento necessário para alcançar suas metas de faturamento com base no seu funil de conversão." />
            <div className="w-full max-w-6xl mt-2 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                     <InfoCard title="Meta de Faturamento">
                        <LabeledSlider label="Quanto quer faturar por mês?" value={data.metaFaturamento} onChange={(v) => handleChange('metaFaturamento', v)} min={1000} max={2000000} step={1000} format={formatCurrency}/>
                    </InfoCard>
                     <InfoCard title="Engrenagem de Conversão">
                         <LabeledSlider label={`Preço do ${opcoesReceita.find(o => o.value === data.tipoReceita)?.label || ''}`} value={data.valorReceita} onChange={(v) => handleChange('valorReceita', v)} min={10} max={10000} step={1} format={formatCurrency}/>
                        <DropdownInput options={opcoesReceita} selected={data.tipoReceita} onChange={(v) => handleChange('tipoReceita', v)}/>
                    </InfoCard>
                     <InfoCard title="Funil de Vendas">
                        <label className="text-sm text-zinc-300">A cada quantos <span className="font-bold text-white">{opcoesMetrica.find(o => o.value === data.metricaConversao)?.label.toLowerCase() || ''}</span> sai uma venda?</label>
                        <DropdownInput options={opcoesMetrica} selected={data.metricaConversao} onChange={(v) => handleChange('metricaConversao', v)}/>
                        <LabeledSlider label="Número de Eventos" value={data.eventosPorVenda} onChange={(v) => handleChange('eventosPorVenda', v)} min={1} max={500} step={1} format={(v) => v}/>
                    </InfoCard>
                    <InfoCard title="Custo de Aquisição">
                        <LabeledSlider label={custoLabel} value={data.custoPorEvento} onChange={(v) => handleChange('custoPorEvento', v)} min={0.1} max={100} step={0.1} format={formatCurrency} color="red"/>
                    </InfoCard>

                    <button onClick={() => saveData(data)} disabled={isSaving || saveStatus === 'success'} className={`w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${isSaving ? 'bg-zinc-500 cursor-not-allowed' : ''} ${saveStatus === 'success' ? 'bg-green-600' : 'bg-gradient-to-r from-zinc-700 to-zinc-600 hover:opacity-90'}`}>
                        {isSaving ? (<><LoaderCircle className="animate-spin"/> Salvando Dados</>) : saveStatus === 'success' ? (<><Check /> Salvo</>) : (<><Save /> Salvar Dados</>)}
                    </button>
                </div>

                {/* --- A NOVA GRELHA DE RESULTADOS OTIMIZADA --- */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-pink-500/20 p-6 rounded-2xl border border-zinc-700 text-center">
                        <h2 className="text-sm text-zinc-300 font-medium">Lucro Bruto Estimado</h2>
                        <p className="font-bold text-white text-4xl md:text-5xl lg:text-6xl my-2 text-shadow-lg shadow-green-500/50">
                            {formatCurrency(resultados.lucroBruto)}
                        </p>
                        <p className="text-xs text-zinc-400">Faturamento - Investimento</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
                        <ResultCard title="Vendas Necessárias" value={Math.ceil(resultados.vendasNecessarias)} icon={ShoppingCart} />
                        <ResultCard title={`${resultados.nomeEvento} Necessários`} value={Math.ceil(resultados.eventosTotais).toLocaleString('pt-BR')} icon={Users} />
                        <ResultCard title="Investimento em Tráfego" value={formatCurrency(resultados.investimentoTotal)} icon={DollarSign} subtext="Custo total para atingir a meta" />
                        <ResultCard title="ROAS" value={resultados.roas.toFixed(2)} icon={TrendingUp} subtext="Retorno Sobre Investimento"/>
                        <ResultCard title="Taxa de Conversão Final" value={`${resultados.taxaConversaoFinal.toFixed(2)}%`} icon={Target} subtext={`De ${resultados.nomeEvento.toLowerCase()} para venda`} />
                        <ResultCard title="Meta de Faturamento" value={formatCurrency(data.metaFaturamento)} icon={BarChart} />
                    </div>
                </div>
            </div>
        </div>
    )
}