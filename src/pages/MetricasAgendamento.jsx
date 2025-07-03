// src/pages/MetricasAgendamento.jsx (Com persistência de dados e feedback)

import React, { useState, useMemo, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { Save, LoaderCircle, Check } from 'lucide-react';

// --- COMPONENTES DE UI ---
function SliderInput({ label, value, onChange, min, max, step, unit }) {
    const formattedValue = unit === "R$" ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : `${value.toLocaleString('pt-BR')}${unit}`;
    return (
      <div className="bg-[#161616] p-5 rounded-xl border border-zinc-800 shadow-lg hover:shadow-[#ED195C]/30 transition duration-300">
        <label className="text-sm text-zinc-300 font-medium">{label}</label>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#ED195C] mt-2" />
        <div className="text-right text-[#ED195C] font-bold text-lg mt-1">{formattedValue}</div>
      </div>
    );
}
  
function ResultCard({ title, value, subtext }) {
    return (
      <div className="bg-[#151515] p-4 rounded-xl border border-zinc-800 hover:shadow-lg transition">
        <h2 className="text-sm text-[#008CFF] mb-1 font-medium">{title}</h2>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
      </div>
    );
}

// --- COMPONENTE PRINCIPAL ---
export default function MetricasAgendamento() {
    // --- ESTADOS DE CONTROLE ---
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    // --- ESTADOS DA FERRAMENTA ---
    const [investimento, setInvestimento] = useState(1000);
    const [precoLead, setPrecoLead] = useState(5);
    const [taxaAgendamento, setTaxaAgendamento] = useState(10);
    const [taxaComparecimento, setTaxaComparecimento] = useState(50);
    const [taxaConversao, setTaxaConversao] = useState(10);
    const [ticketMedio, setTicketMedio] = useState(1000);

    // --- CARREGAR DADOS ---
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('user_tool_data')
                    .select('data')
                    .eq('user_id', user.id)
                    .eq('tool_name', 'metricas_agendamento')
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) {
                    const saved = data.data;
                    setInvestimento(saved.investimento);
                    setPrecoLead(saved.precoLead);
                    setTaxaAgendamento(saved.taxaAgendamento);
                    setTaxaComparecimento(saved.taxaComparecimento);
                    setTaxaConversao(saved.taxaConversao);
                    setTicketMedio(saved.ticketMedio);
                }
            } catch (error) {
                console.error("Erro ao buscar dados de agendamento:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    // --- SALVAR DADOS ---
    const handleSaveData = async () => {
        if (!user) return;
        setIsSaving(true);
        setSaveStatus('idle');
        const toolData = { investimento, precoLead, taxaAgendamento, taxaComparecimento, taxaConversao, ticketMedio };
        
        try {
            const { error } = await supabase.from('user_tool_data').upsert({
                user_id: user.id,
                tool_name: 'metricas_agendamento',
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
    
    // ... (Lógica de cálculo dos resultados permanece a mesma)
    const resultados = useMemo(() => {
        const numLeads = precoLead > 0 ? investimento / precoLead : 0;
        const numAgendamentos = numLeads * (taxaAgendamento / 100);
        const numCallsRealizadas = numAgendamentos * (taxaComparecimento / 100);
        const numVendas = numCallsRealizadas * (taxaConversao / 100);
        const faturamento = numVendas * ticketMedio;
        const custoPorCall = numCallsRealizadas > 0 ? investimento / numCallsRealizadas : 0;
        const cac = numVendas > 0 ? investimento / numVendas : 0;
        const roas = investimento > 0 ? faturamento / investimento : 0;
        const numSDRs = numLeads > 0 ? Math.ceil(numLeads / 200) : 0;
        const numClosers = numCallsRealizadas > 0 ? Math.ceil(numCallsRealizadas / 50) : 0;
        return { faturamento, numVendas, custoPorCall, cac, roas, numSDRs, numClosers };
    }, [investimento, precoLead, taxaAgendamento, taxaComparecimento, taxaConversao, ticketMedio]);

    if (isLoading) return <div className="text-center p-10">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-10 flex flex-col items-center">
        <PageHeader title="Métricas de Agendamento" description="Descubra o potencial de faturamento mensal e a estrutura de equipa necessária aplicando o seu modelo de agendamento."/>
        <div className="w-full max-w-6xl mt-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <SliderInput label="Investimento por Mês" value={investimento} onChange={setInvestimento} min={100} max={100000} step={100} unit="R$" />
                <SliderInput label="Preço por Lead" value={precoLead} onChange={setPrecoLead} min={1} max={50} step={1} unit="R$" />
                <SliderInput label="Taxa de Agendamento" value={taxaAgendamento} onChange={setTaxaAgendamento} min={1} max={100} step={1} unit="%" />
                <SliderInput label="Taxa de Comparecimento" value={taxaComparecimento} onChange={setTaxaComparecimento} min={1} max={100} step={1} unit="%" />
                <SliderInput label="Taxa de Conversão (pós-call)" value={taxaConversao} onChange={setTaxaConversao} min={1} max={100} step={1} unit="%" />
                <SliderInput label="Ticket Médio" value={ticketMedio} onChange={setTicketMedio} min={50} max={10000} step={50} unit="R$" />

                {/* --- BOTÃO DE SALVAR --- */}
                {user && (
                    <button
                        onClick={handleSaveData}
                        disabled={isSaving || saveStatus === 'success'}
                        className={`w-full py-2.5 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 mt-2
                            ${isSaving ? 'bg-zinc-500 cursor-not-allowed' : ''}
                            ${saveStatus === 'success' ? 'bg-green-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                    >
                        {isSaving ? (<><LoaderCircle className="animate-spin"/> Salvando</>) 
                        : saveStatus === 'success' ? (<><Check /> Salvo</>) 
                        : (<><Save /> Salvar Dados</>)}
                    </button>
                )}
            </div>
            
            <div className="space-y-4">
                 <ResultCard title="Faturamento (Mensal)" value={resultados.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                 <ResultCard title="Número de Vendas" value={Math.floor(resultados.numVendas)} />
                 <ResultCard title="Custo por Call Realizada" value={resultados.custoPorCall.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                 <ResultCard title="CAC (Custo por Aquisição de Cliente)" value={resultados.cac.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                 <ResultCard title="ROAS (Retorno sobre Investimento)" value={resultados.roas.toFixed(2)} />
                 <ResultCard title="Número de SDRs Necessários" value={resultados.numSDRs} subtext="*Baseado em 200 leads/SDR" />
                 <ResultCard title="Número de Closers Necessários" value={resultados.numClosers} subtext="*Baseado em 50 calls/Closer" />
            </div>
        </div>
    </div>
  )
}