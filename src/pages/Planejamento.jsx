// src/pages/Planejamento.jsx (Código completo com persistência de dados)

import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext'; // Importar o hook de autenticação
import { supabase } from '../supabase'; // Importar o cliente Supabase
import { Save, LoaderCircle, Check } from 'lucide-react'; // Ícones para o botão

// --- COMPONENTES DE UI (InputCard, LabeledSlider, etc. permanecem os mesmos) ---
function InputCard({ title, children }) {
    return (
      <div className="bg-[#161616] p-6 rounded-2xl border border-zinc-800 shadow-lg transition duration-300 space-y-4 flex flex-col">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {children}
      </div>
    );
}

function LabeledSlider({ label, value, onChange, min, max, step, format, color = 'blue' }) {
    const accentColor = color === 'blue' ? 'accent-[#008CFF]' : 'accent-[#ED195C]';
    const textColor = color === 'blue' ? 'text-[#008CFF]' : 'text-[#ED195C]';
    return (
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <label htmlFor={label} className="text-sm text-zinc-300">{label}</label>
          <span className={`font-bold text-lg ${textColor}`}>{format(value)}</span>
        </div>
        <input id={label} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer ${accentColor}`} />
      </div>
    );
}

function DropdownInput({ options, selected, onChange }) {
    return (
         <select value={selected} onChange={(e) => onChange(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-[#008CFF] outline-none">
            {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
    )
}

function ResultCard({ title, value, subtext, isMain = false }) {
    return (
      <div className={`bg-[#1D1D1D]/50 p-5 rounded-2xl border border-zinc-800 text-center flex flex-col justify-center h-full`}>
        <h2 className="text-xs md:text-sm text-zinc-400 font-medium whitespace-nowrap">{title}</h2>
        <p className={`font-bold text-white bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent break-words ${isMain ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
          {value}
        </p>
        {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
      </div>
    );
}


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function PlanejamentoEstrategico() {
    // --- AUTENTICAÇÃO E ESTADOS DE PERSISTÊNCIA ---
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    // --- ESTADOS DA FERRAMENTA ---
    const [metaFaturamento, setMetaFaturamento] = useState(50000);
    const [tipoReceita, setTipoReceita] = useState('produto');
    const [valorReceita, setValorReceita] = useState(197);
    const [metricaConversao, setMetricaConversao] = useState('leads');
    const [eventosPorVenda, setEventosPorVenda] = useState(20);
    const [custoPorEvento, setCustoPorEvento] = useState(8);
    
    // --- LÓGICA DE CARREGAMENTO DOS DADOS (FETCH) ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            };

            try {
                const { data, error } = await supabase
                    .from('user_tool_data')
                    .select('data')
                    .eq('user_id', user.id)
                    .eq('tool_name', 'planejamento')
                    .single();

                if (error && error.code !== 'PGRST116') throw error; // Ignora erro "nenhuma linha encontrada"

                if (data) {
                    setMetaFaturamento(data.data.metaFaturamento);
                    setTipoReceita(data.data.tipoReceita);
                    setValorReceita(data.data.valorReceita);
                    setMetricaConversao(data.data.metricaConversao);
                    setEventosPorVenda(data.data.eventosPorVenda);
                    setCustoPorEvento(data.data.custoPorEvento);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do planejamento:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    // --- LÓGICA DE SALVAMENTO DOS DADOS (SAVE) ---
    const handleSaveData = async () => {
        if (!user) return; // Não faz nada se o usuário não estiver logado

        setIsSaving(true);
        setSaveStatus('idle');

        const toolData = {
            metaFaturamento,
            tipoReceita,
            valorReceita,
            metricaConversao,
            eventosPorVenda,
            custoPorEvento
        };

        try {
            const { error } = await supabase
                .from('user_tool_data')
                .upsert({
                    user_id: user.id,
                    tool_name: 'planejamento',
                    data: toolData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, tool_name' });
            
            if (error) throw error;

            setSaveStatus('success');

        } catch (error) {
            setSaveStatus('error');
            console.error("Erro ao salvar dados:", error);
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    // ... (opções, labels e cálculos permanecem os mesmos) ...
    const opcoesReceita = [{ value: 'produto', label: 'Produto' }, { value: 'servico', label: 'Serviço' }, { value: 'comissao', label: 'Comissão' }];
    const opcoesMetrica = [{ value: 'leads', label: 'Leads' }, { value: 'cliques', label: 'Cliques' }, { value: 'checkouts', label: 'Checkouts' }, { value: 'conversas', label: 'Conversas' }];
    const custoLabel = useMemo(() => {
        const labels = { leads: 'Preço médio por Lead (CPL)', cliques: 'Custo médio por Clique (CPC)', checkouts: 'Custo por Iniciar Checkout', conversas: 'Custo por Conversa Iniciada' };
        return labels[metricaConversao];
    }, [metricaConversao]);
    const resultados = useMemo(() => {
        const vendasNecessarias = valorReceita > 0 ? metaFaturamento / valorReceita : 0;
        const eventosTotais = vendasNecessarias * eventosPorVenda;
        const investimentoTotal = eventosTotais * custoPorEvento;
        const lucroBruto = metaFaturamento - investimentoTotal;
        const roas = investimentoTotal > 0 ? metaFaturamento / investimentoTotal : 0;
        const taxaConversaoFinal = eventosPorVenda > 0 ? (1 / eventosPorVenda) * 100 : 0;
        const nomeEvento = opcoesMetrica.find(o => o.value === metricaConversao)?.label || metricaConversao;
        return { vendasNecessarias, eventosTotais, investimentoTotal, lucroBruto, roas, taxaConversaoFinal, nomeEvento };
    }, [metaFaturamento, valorReceita, metricaConversao, eventosPorVenda, custoPorEvento]);
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (isLoading) {
        return <div className="text-center p-10">Carregando dados...</div>
    }

    return (
        <div className="bg-[#0f0f0f] text-white px-4 py-10 flex flex-col items-center">
            <PageHeader title="Planejamento Estratégico" description="Simule cenários e descubra o investimento necessário para alcançar suas metas de faturamento com base no seu funil de conversão." />
            <div className="w-full max-w-6xl mt-2 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* ... (Cards de Input) ... */}
                     <InputCard title="Meta de Faturamento">
                        <LabeledSlider label="Quanto quer faturar por mês?" value={metaFaturamento} onChange={setMetaFaturamento} min={1000} max={2000000} step={1000} format={formatCurrency}/>
                    </InputCard>
                     <InputCard title="Engrenagem de Conversão">
                         <LabeledSlider label={`Preço do ${opcoesReceita.find(o => o.value === tipoReceita)?.label || ''}`} value={valorReceita} onChange={setValorReceita} min={10} max={10000} step={1} format={formatCurrency}/>
                        <DropdownInput options={opcoesReceita} selected={tipoReceita} onChange={setTipoReceita}/>
                    </InputCard>
                     <InputCard title="Funil de Vendas">
                        <label className="text-sm text-zinc-300">A cada quantos <span className="font-bold text-white">{opcoesMetrica.find(o => o.value === metricaConversao)?.label.toLowerCase() || ''}</span> sai uma venda?</label>
                        <DropdownInput options={opcoesMetrica} selected={metricaConversao} onChange={setMetricaConversao}/>
                        <LabeledSlider label="Número de Eventos" value={eventosPorVenda} onChange={setEventosPorVenda} min={1} max={500} step={1} format={(v) => v}/>
                    </InputCard>
                    <InputCard title="Custo de Aquisição">
                        <LabeledSlider label={custoLabel} value={custoPorEvento} onChange={setCustoPorEvento} min={0.1} max={100} step={0.1} format={formatCurrency} color="red"/>
                    </InputCard>
                    
                    {/* --- BOTÃO DE SALVAR --- */}
                    {user && (
                        <button
                            onClick={handleSaveData}
                            disabled={isSaving || saveStatus === 'success'}
                            className={`w-full py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2
                                ${isSaving ? 'bg-zinc-500 cursor-not-allowed' : ''}
                                ${saveStatus === 'success' ? 'bg-green-600' : 'bg-gradient-to-r from-zinc-700 to-zinc-600 hover:opacity-90'}
                            `}
                        >
                            {isSaving ? (
                                <><LoaderCircle className="animate-spin"/> Salvando Dados</>
                            ) : saveStatus === 'success' ? (
                                <><Check /> Salvo</>
                            ) : (
                                <><Save /> Salvar Dados</>
                            )}
                        </button>
                    )}
                </div>

                <div className="lg:col-span-3 bg-zinc-900/80 p-6 md:p-8 rounded-3xl border border-zinc-700 flex flex-col gap-6">
                    {/* ... (Cards de Resultado) ... */}
                    <ResultCard title="Lucro Bruto Estimado" value={formatCurrency(resultados.lucroBruto)} subtext="Faturamento - Investimento" isMain={true}/>
                    <div className="grid grid-cols-2 gap-6">
                        <ResultCard title="Vendas Necessárias" value={Math.ceil(resultados.vendasNecessarias)} />
                        <ResultCard title={`${resultados.nomeEvento} Necessários`} value={Math.ceil(resultados.eventosTotais).toLocaleString('pt-BR')} />
                    </div>
                    <div className="grid grid-cols-1">
                        <ResultCard title="Investimento em Tráfego" value={formatCurrency(resultados.investimentoTotal)} subtext="Custo total para atingir a meta"/>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <ResultCard title="ROAS" value={resultados.roas.toFixed(2)} subtext="Retorno Sobre Investimento"/>
                       <ResultCard title="Taxa de Conversão Final" value={`${resultados.taxaConversaoFinal.toFixed(2)}%`} subtext={`De ${resultados.nomeEvento.toLowerCase()} para venda`}/>
                    </div>
                </div>
            </div>
        </div>
    )
}