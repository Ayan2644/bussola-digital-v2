// Local de Instalação: src/pages/Sonar.jsx
// CÓDIGO COMPLETO E ATUALIZADO

import { useState, useMemo } from 'react';
import RadarSVG from '../components/RadarSVG';
import Termometro from '../components/Termometro';
import OptimizationMap from '../components/OptimizationMap';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToolData } from '../hooks/useToolData'; // <- Importando o hook
import { Save, LoaderCircle, Check } from 'lucide-react';

export default function Sonar() {
  const { user } = useAuth();

  // --- ESTADO INICIAL DA FERRAMENTA ---
  const initialState = {
      impressions: '', clicks: '', cpm: '', cpc: '',
      pageviews: '', checkouts: '', purchases: '', adSpend: '', avgOrder: ''
  };

  // --- CENTRALIZANDO A LÓGICA DE DADOS ---
  const {
    data: formState, // Renomeando 'data' para 'formState'
    setData: setFormState,
    isLoading,
    isSaving,
    saveStatus,
    saveData
  } = useToolData('sonar', initialState);

  const [results, setResults] = useState(null);
  const [performance, setPerformance] = useState(0);

  const handleFormChange = (name, value) => {
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    const I = Number(formState.impressions); const C = Number(formState.clicks);
    const PV = Number(formState.pageviews); const CO = Number(formState.checkouts);
    const P = Number(formState.purchases); const SP = Number(formState.adSpend);
    const AO = Number(formState.avgOrder);
    const ctr = I > 0 ? (C / I) * 100 : 0; const conn = C > 0 ? (PV / C) * 100 : 0;
    const pconv = PV > 0 ? (CO / PV) * 100 : 0; const cconv = CO > 0 ? (P / CO) * 100 : 0;
    const totalConversion = I > 0 ? (P / I) * 1000 : 0; const cac = P > 0 ? SP / P : 0;
    const roas = SP > 0 ? (P * AO) / SP : 0; const revenue = P * AO; const profit = revenue - SP;
    const T = { ctr: [1, 2], conn: [75, 90], pconv: [5, 10], cconv: [20, 40], roas: [1.5, 2.5] };
    let sum = 0;
    sum += ctr >= T.ctr[1] ? 2 : ctr >= T.ctr[0] ? 1 : 0;
    sum += conn >= T.conn[1] ? 2 : conn >= T.conn[0] ? 1 : 0;
    sum += pconv >= T.pconv[1] ? 2 : pconv >= T.pconv[0] ? 1 : 0;
    sum += cconv >= T.cconv[1] ? 2 : cconv >= T.cconv[0] ? 1 : 0;
    sum += roas >= T.roas[1] ? 2 : roas >= T.roas[0] ? 1 : 0;
    setPerformance(sum / 5);
    setResults({ ctr, conn, pconv, cconv, totalConversion, cac, roas, purchases: P, revenue, profit, cpm: Number(formState.cpm), cpc: Number(formState.cpc) });
  }

  const { statusMsg, statusClass } = useMemo(() => {
    let msg, cssClass;
    if (performance < 1) { 
        msg = 'MOMENTO DE OTIMIZAÇÃO! É necessário melhorar significativamente suas métricas antes de escalar.'; 
        cssClass = 'border-[var(--rosa-legiao)] text-[var(--rosa-legiao)]';
    } else if (performance < 2) { 
        msg = 'QUASE LÁ! Estamos nos aproximando do momento ideal para escalar. Otimize os pontos indicados abaixo.'; 
        cssClass = 'border-[var(--rosa-legiao)] text-[var(--rosa-legiao)]';
    } else { 
        msg = 'MOMENTO IDEAL PARA ESCALA! Suas métricas estão excelentes, hora de investir mais!'; 
        cssClass = 'border-[var(--azul-legiao)] text-[var(--azul-legiao)]'; 
    }
    return { statusMsg: msg, statusClass: cssClass };
  }, [performance]);

  const formFields = [
      { name: 'impressions', label: 'Impressões', placeholder: 'Número total de impressões', section: 'anuncios' }, { name: 'clicks', label: 'Cliques no Link', placeholder: 'Número total de cliques', section: 'anuncios' },
      { name: 'cpm', label: 'CPM (R$)', placeholder: 'Custo por 1000 impressões', section: 'anuncios' }, { name: 'cpc', label: 'CPC (R$)', placeholder: 'Custo por clique', section: 'anuncios' },
      { name: 'pageviews', label: 'Visualizações da Página de Destino', placeholder: 'Número total de visualizações', section: 'site' }, { name: 'checkouts', label: 'Checkouts Iniciados', placeholder: 'Número de checkouts iniciados', section: 'site' },
      { name: 'purchases', label: 'Compras', placeholder: 'Número de compras realizadas', section: 'site' }, { name: 'adSpend', label: 'Investimento Total (R$)', placeholder: 'Valor total investido', section: 'site' },
      { name: 'avgOrder', label: 'Ticket Médio (R$)', placeholder: 'Valor do seu produto', section: 'site' },
  ];

  if (isLoading) return <div className="text-center p-10">Carregando dados...</div>;

  return (
    <div className="space-y-8 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader title="Sonar do Tráfego Avançado" description="Preencha as métricas diretamente do seu gerenciador de anúncios para obter uma análise completa do seu funil e recomendações específicas para otimização e escala." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg space-y-6 self-start">
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Métricas do Gerenciador</h2>
                <div className="space-y-4">
                    <h3 className="text-md font-bold text-zinc-300 border-b border-zinc-600 pb-2">Métricas de Anúncios</h3>
                    {formFields.filter(f => f.section === 'anuncios').map(({name, label, placeholder}) => (
                        <div key={name}>
                            <label className="text-sm text-zinc-400 mb-1 block">{label}</label>
                            <input name={name} type="number" step="any" value={formState[name]} onChange={e => handleFormChange(name, e.target.value)} className="input w-full" placeholder={placeholder} required />
                        </div>
                    ))}
                    <h3 className="text-md font-bold text-zinc-300 border-b border-zinc-600 pb-2 pt-4">Métricas do Site</h3>
                    {formFields.filter(f => f.section === 'site').map(({name, label, placeholder}) => (
                         <div key={name}>
                            <label className="text-sm text-zinc-400 mb-1 block">{label}</label>
                            <input name={name} type="number" step="any" value={formState[name]} onChange={e => handleFormChange(name, e.target.value)} className="input w-full" placeholder={placeholder} required />
                        </div>
                    ))}
                </div>
            </div>
            <button type="submit" className="btn-legiao w-full !mt-8">Calcular Métricas</button>
            {user && (
                <button type="button" onClick={() => saveData(formState)} disabled={isSaving || saveStatus === 'success'} className={`w-full py-2.5 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2
                    ${isSaving ? 'bg-zinc-500 cursor-not-allowed' : ''}
                    ${saveStatus === 'success' ? 'bg-green-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}>
                    {isSaving ? ( <><LoaderCircle className="animate-spin"/> Salvando</>
                    ) : saveStatus === 'success' ? ( <><Check /> Salvo</>
                    ) : ( <><Save /> Salvar Dados</> )}
                </button>
            )}
        </form>
        <div className="space-y-8">
          <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg">
            <p className="text-center text-zinc-400 mb-4">Preencha os campos e clique em "Calcular" para visualizar o resultado</p>
            <RadarSVG performance={performance} />
             {results && (
                <div className={`border-l-4 bg-zinc-800 p-4 rounded mt-4 ${statusClass}`}>
                  <p className="font-semibold text-sm leading-snug">{statusMsg}</p>
                </div>
            )}
          </div>
          {results && (
             <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg space-y-3">
               <h3 className="text-center text-[var(--azul-legiao)] text-lg font-semibold mb-4">Métricas Calculadas</h3>
                {[['CTR (Taxa de Cliques)', `${results.ctr.toFixed(2)}%`], ['Connect Rate (Clique • Page View)', `${results.conn.toFixed(2)}%`], ['Conversão da Página', `${results.pconv.toFixed(2)}%`], ['Conversão do Checkout', `${results.cconv.toFixed(2)}%`], ['Taxa de Conversão Total (a cada 1k imp.)', `${results.totalConversion.toFixed(2)}`], ['CAC (Custo por Aquisição)', `R$ ${results.cac.toFixed(2)}`], ['ROAS (Retorno sobre Investimento)', results.roas.toFixed(2)], ['Lucro', `R$ ${results.profit.toFixed(2)}`]].map(([name, value]) => (
                  <div key={name} className="flex justify-between items-center text-sm px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800">
                    <span className="text-zinc-300">{name}:</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
      {results && (
        <div className="mt-12">
            <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gradient text-center mb-6">Termômetro de Métricas</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <Termometro label="CTR" value={results.ctr} thresholds={{ bad: 1, good: 2 }} unit="%" />
                  <Termometro label="Connect Rate" value={results.conn} thresholds={{ bad: 75, good: 90 }} unit="%" />
                  <Termometro label="Conversão Página" value={results.pconv} thresholds={{ bad: 5, good: 10 }} unit="%" />
                  <Termometro label="Conversão Checkout" value={results.cconv} thresholds={{ bad: 20, good: 40 }} unit="%" />
                </div>
            </div>
            <div className="mt-8">
                 <OptimizationMap results={results} />
            </div>
        </div>
      )}
    </div>
  );
}