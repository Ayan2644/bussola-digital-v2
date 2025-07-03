// src/pages/Sonar.jsx

import { useState } from 'react';
import RadarSVG from '../components/RadarSVG';
import Termometro from '../components/Termometro';
import OptimizationMap from '../components/OptimizationMap';
import PageHeader from '../components/ui/PageHeader';

export default function Sonar() {
  // Estados dos inputs
  const [impressions, setImpressions] = useState('');
  const [clicks, setClicks] = useState('');
  const [cpm, setCpm] = useState('');
  const [cpc, setCpc] = useState('');
  const [pageviews, setPageviews] = useState('');
  const [checkouts, setCheckouts] = useState('');
  const [purchases, setPurchases] = useState('');
  const [adSpend, setAdSpend] = useState('');
  // NOVO CAMPO ADICIONADO: Estado para o Ticket Médio (valor do produto)
  const [avgOrder, setAvgOrder] = useState('');

  // Resultado e performance normalizada
  const [results, setResults] = useState(null);
  const [performance, setPerformance] = useState(0);

  function handleSubmit(e) {
    e.preventDefault();
    // Converte inputs para números
    const I = Number(impressions);
    const C = Number(clicks);
    const PV = Number(pageviews);
    const CO = Number(checkouts);
    const P = Number(purchases);
    const SP = Number(adSpend);
    // CORREÇÃO: Usando o valor do estado `avgOrder`
    const AO = Number(avgOrder);

    // Cálculo das métricas principais
    const ctr = I > 0 ? (C / I) * 100 : 0;
    const conn = C > 0 ? (PV / C) * 100 : 0;
    const pconv = PV > 0 ? (CO / PV) * 100 : 0;
    const cconv = CO > 0 ? (P / CO) * 100 : 0;
    const totalConversion = I > 0 ? (P / I) * 1000 : 0;
    const cac = P > 0 ? SP / P : 0;
    // CORREÇÃO: O cálculo agora usa o Ticket Médio (AO) inserido pelo usuário
    const roas = SP > 0 ? (P * AO) / SP : 0;
    const revenue = P * AO;
    const profit = revenue - SP;

    // Thresholds (limites) da Bussola para pontuação
    const T = {
      ctr: [1, 2],
      conn: [75, 90],
      pconv: [5, 10],
      cconv: [20, 40],
      roas: [1.5, 2.5],
    };

    // Soma pontuações de 0 a 2 para cada métrica
    let sum = 0;
    sum += ctr >= T.ctr[1] ? 2 : ctr >= T.ctr[0] ? 1 : 0;
    sum += conn >= T.conn[1] ? 2 : conn >= T.conn[0] ? 1 : 0;
    sum += pconv >= T.pconv[1] ? 2 : pconv >= T.pconv[0] ? 1 : 0;
    sum += cconv >= T.cconv[1] ? 2 : cconv >= T.cconv[0] ? 1 : 0;
    sum += roas >= T.roas[1] ? 2 : roas >= T.roas[0] ? 1 : 0;

    // Normaliza performance (0 a 2)
    setPerformance(sum / 5);

    // Salva todos os resultados no estado
    setResults({
      ctr,
      conn,
      pconv,
      cconv,
      totalConversion,
      cac,
      roas,
      purchases: P,
      revenue,
      profit,
      cpm: Number(cpm),
      cpc: Number(cpc),
    });
  }

  // Define a mensagem e cor do status com base na performance
  let statusMsg, statusClass;
  if (performance < 1) {
    statusMsg = 'MOMENTO DE OTIMIZAÇÃO! É necessário melhorar significativamente suas métricas antes de escalar.';
    statusClass = 'border-[var(--rosa-legiao)] text-[var(--rosa-legiao)]';
  } else if (performance < 2) {
    statusMsg = 'QUASE LÁ! Estamos nos aproximando do momento ideal para escalar. Otimize os pontos indicados abaixo.';
    statusClass = 'border-[var(--rosa-legiao)] text-[var(--rosa-legiao)]';
  } else {
    statusMsg = 'MOMENTO IDEAL PARA ESCALA! Suas métricas estão excelentes, hora de investir mais!';
    statusClass = 'border-[var(--azul-legiao)] text-[var(--azul-legiao)]';
  }

  // Lista de campos do formulário para facilitar a renderização
  const formFields = [
      { name: 'impressions', label: 'Impressões', placeholder: 'Número total de impressões', section: 'anuncios' },
      { name: 'clicks', label: 'Cliques no Link', placeholder: 'Número total de cliques', section: 'anuncios' },
      { name: 'cpm', label: 'CPM (R$)', placeholder: 'Custo por 1000 impressões', section: 'anuncios' },
      { name: 'cpc', label: 'CPC (R$)', placeholder: 'Custo por clique', section: 'anuncios' },
      { name: 'pageviews', label: 'Visualizações da Página de Destino', placeholder: 'Número total de visualizações', section: 'site' },
      { name: 'checkouts', label: 'Checkouts Iniciados', placeholder: 'Número de checkouts iniciados', section: 'site' },
      { name: 'purchases', label: 'Compras', placeholder: 'Número de compras realizadas', section: 'site' },
      { name: 'adSpend', label: 'Investimento Total (R$)', placeholder: 'Valor total investido', section: 'site' },
      // NOVO CAMPO ADICIONADO: Definição do campo de Ticket Médio
      { name: 'avgOrder', label: 'Ticket Médio (R$)', placeholder: 'Valor do seu produto', section: 'site' },
  ];

  const stateSetters = {
      impressions: setImpressions, clicks: setClicks, cpm: setCpm, cpc: setCpc,
      pageviews: setPageviews, checkouts: setCheckouts, purchases: setPurchases,
      adSpend: setAdSpend,
      // NOVO CAMPO ADICIONADO: Conectando o novo campo ao seu estado
      avgOrder: setAvgOrder,
  };

  return (
    <div className="space-y-8 px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Sonar do Tráfego Avançado"
        description="Preencha as métricas diretamente do seu gerenciador de anúncios para obter uma análise completa do seu funil e recomendações específicas para otimização e escala."
      />

      {/* Grid principal com 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Coluna da Esquerda: Formulário */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg space-y-6 self-start">
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Métricas do Gerenciador</h2>
                <div className="space-y-4">
                    <h3 className="text-md font-bold text-zinc-300 border-b border-zinc-600 pb-2">Métricas de Anúncios</h3>
                    {formFields.filter(f => f.section === 'anuncios').map(({name, label, placeholder}) => (
                        <div key={name}>
                            <label className="text-sm text-zinc-400 mb-1 block">{label}</label>
                            <input name={name} type="number" step="any" onChange={e => stateSetters[name](e.target.value)} className="input w-full" placeholder={placeholder} required />
                        </div>
                    ))}
                    <h3 className="text-md font-bold text-zinc-300 border-b border-zinc-600 pb-2 pt-4">Métricas do Site</h3>
                    {formFields.filter(f => f.section === 'site').map(({name, label, placeholder}) => (
                         <div key={name}>
                            <label className="text-sm text-zinc-400 mb-1 block">{label}</label>
                            <input name={name} type="number" step="any" onChange={e => stateSetters[name](e.target.value)} className="input w-full" placeholder={placeholder} required />
                        </div>
                    ))}
                </div>
            </div>
            <button type="submit" className="btn-legiao w-full !mt-8">
                Calcular Métricas
            </button>
        </form>

        {/* Coluna da Direita: Resultados (Radar e Métricas Calculadas) */}
        <div className="space-y-8">
          {/* Radar */}
          <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg">
            <p className="text-center text-zinc-400 mb-4">Preencha os campos das métricas e clique em "Calcular" para visualizar o resultado</p>
            <RadarSVG performance={performance} />
             {results && (
                <div className={`border-l-4 bg-zinc-800 p-4 rounded mt-4 ${statusClass}`}>
                  <p className="font-semibold text-sm leading-snug">{statusMsg}</p>
                </div>
            )}
          </div>

          {/* Métricas Calculadas */}
          {results && (
             <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg space-y-3">
               <h3 className="text-center text-[var(--azul-legiao)] text-lg font-semibold mb-4">Métricas Calculadas</h3>
                {[
                    ['CTR (Taxa de Cliques)', `${results.ctr.toFixed(2)}%`],
                    ['Connect Rate (Clique • Page View)', `${results.conn.toFixed(2)}%`],
                    ['Conversão da Página', `${results.pconv.toFixed(2)}%`],
                    ['Conversão do Checkout', `${results.cconv.toFixed(2)}%`],
                    ['Taxa de Conversão Total (a cada 1k imp.)', `${results.totalConversion.toFixed(2)}`],
                    ['CAC (Custo por Aquisição)', `R$ ${results.cac.toFixed(2)}`],
                    ['ROAS (Retorno sobre Investimento)', results.roas.toFixed(2)],
                    ['Lucro', `R$ ${results.profit.toFixed(2)}`],
                ].map(([name, value]) => (
                  <div key={name} className="flex justify-between items-center text-sm px-3 py-2 border border-zinc-700 rounded-md bg-zinc-800">
                    <span className="text-zinc-300">{name}:</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Baixo: Termômetro e Mapa (aparece após o cálculo) */}
      {results && (
        <div className="mt-12">
            {/* Termômetro de Métricas */}
            <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gradient text-center mb-6">Termômetro de Métricas</h2>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <Termometro label="CTR" value={results.ctr} thresholds={{ bad: 1, good: 2 }} unit="%" />
                  <Termometro label="Connect Rate" value={results.conn} thresholds={{ bad: 75, good: 90 }} unit="%" />
                  <Termometro label="Conversão Página" value={results.pconv} thresholds={{ bad: 5, good: 10 }} unit="%" />
                  <Termometro label="Conversão Checkout" value={results.cconv} thresholds={{ bad: 20, good: 40 }} unit="%" />
                </div>
            </div>

            {/* Mapa de Otimização */}
            <div className="mt-8">
                 <OptimizationMap results={results} />
            </div>
        </div>
      )}
    </div>
  );
}