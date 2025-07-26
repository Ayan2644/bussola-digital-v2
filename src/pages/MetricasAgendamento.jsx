// Local de Instalação: src/pages/MetricasAgendamento.jsx
// CÓDIGO COMPLETO E ATUALIZADO com feedback visual

import React, { useMemo, useState, useCallback } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToolData } from '../hooks/useToolData';
import { Save, LoaderCircle, Check } from 'lucide-react';

// O componente SliderInput original foi movido para seu próprio arquivo
// e agora o importamos aqui.
import SliderInput from '../components/ui/SliderInput';

// --- COMPONENTES DE UI ---
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
    const { user } = useAuth();

    const initialState = {
        investimento: 1000,
        precoLead: 5,
        taxaAgendamento: 10,
        taxaComparecimento: 50,
        taxaConversao: 10,
        ticketMedio: 1000,
    };

    const [flashedField, setFlashedField] = useState(null);

    const handleRealtimeUpdate = useCallback((oldData, newData) => {
        for (const key in newData) {
            if (newData[key] !== oldData[key]) {
                setFlashedField(key);
                setTimeout(() => setFlashedField(null), 2000);
                break;
            }
        }
    }, []);

    const { 
        data, 
        setData, 
        isLoading, 
        isSaving, 
        saveStatus, 
        saveData 
    } = useToolData('metricas_agendamento', initialState, handleRealtimeUpdate);

    const resultados = useMemo(() => {
        const { investimento, precoLead, taxaAgendamento, taxaComparecimento, taxaConversao, ticketMedio } = data;
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
    }, [data]);

    if (isLoading) return <div className="text-center p-10">Carregando dados...</div>;

    const handleChange = (field, value) => {
        setData(prevData => ({ ...prevData, [field]: value }));
    };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-10 flex flex-col items-center">
        <PageHeader title="Métricas de Agendamento" description="Descubra o potencial de faturamento mensal e a estrutura de equipa necessária aplicando o seu modelo de agendamento."/>
        <div className="w-full max-w-6xl mt-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <SliderInput label="Investimento por Mês" value={data.investimento} onChange={(v) => handleChange('investimento', v)} min={100} max={100000} step={100} unit="R$" flash={flashedField === 'investimento'} />
                <SliderInput label="Preço por Lead" value={data.precoLead} onChange={(v) => handleChange('precoLead', v)} min={1} max={50} step={1} unit="R$" flash={flashedField === 'precoLead'} />
                <SliderInput label="Taxa de Agendamento" value={data.taxaAgendamento} onChange={(v) => handleChange('taxaAgendamento', v)} min={1} max={100} step={1} unit="%" flash={flashedField === 'taxaAgendamento'} />
                <SliderInput label="Taxa de Comparecimento" value={data.taxaComparecimento} onChange={(v) => handleChange('taxaComparecimento', v)} min={1} max={100} step={1} unit="%" flash={flashedField === 'taxaComparecimento'} />
                <SliderInput label="Taxa de Conversão (pós-call)" value={data.taxaConversao} onChange={(v) => handleChange('taxaConversao', v)} min={1} max={100} step={1} unit="%" flash={flashedField === 'taxaConversao'} />
                <SliderInput label="Ticket Médio" value={data.ticketMedio} onChange={(v) => handleChange('ticketMedio', v)} min={50} max={10000} step={50} unit="R$" flash={flashedField === 'ticketMedio'} />

                {user && (
                    <button
                        onClick={() => saveData(data)}
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