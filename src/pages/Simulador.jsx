// Local de Instalação: src/pages/Simulador.jsx
// CÓDIGO COMPLETO E FINAL

import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

import PageHeader from '../components/ui/PageHeader';
import { useToolData } from '../hooks/useToolData';
import { useAuth } from '../context/AuthContext';
import { Save, LoaderCircle, Check, ChevronDown, CheckCircle, AlertTriangle, Search } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const RecommendationItem = ({ rec, isOpen, onClick }) => {
    const icons = {
        green: <CheckCircle className="text-green-500 flex-shrink-0" />,
        yellow: <Search className="text-yellow-400 flex-shrink-0" />,
        red: <AlertTriangle className="text-red-500 flex-shrink-0" />,
    };

    return (
        <div className={`border-l-4 rounded-r-lg overflow-hidden transition-all duration-300 ${rec.cor === 'green' ? 'border-green-500' : rec.cor === 'red' ? 'border-red-500' : 'border-yellow-400'}`}>
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-4 text-left bg-zinc-900/50 hover:bg-zinc-800"
            >
                <div className="flex items-center gap-3">
                    {icons[rec.cor]}
                    <strong className="font-semibold text-white">{rec.titulo}</strong>
                </div>
                <ChevronDown className={`transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="px-4 pb-4 pt-2 text-zinc-300 text-sm">
                        {rec.texto}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function Simulador() {
  const { user } = useAuth();
  const initialState = {
    valorProduto: '197', orcamento: '100', gasto: '500',
    vendas: '5', ctr: '2.5', cpc: '1.2', cpm: '15', frequencia: '1.8',
  };

  const { data: form, setData: setForm, isLoading, isSaving, saveStatus, saveData } = useToolData('simulador', initialState);
  const [resultado, setResultado] = useState(null);
  const [openRecommendation, setOpenRecommendation] = useState(0); 

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function calcularMetrica(e) {
    e.preventDefault();
    const { valorProduto, gasto, vendas, ctr, cpc, frequencia } = form;
    const numVendas = Number(vendas);
    const valorTotal = Number(valorProduto) * numVendas;
    const lucro = valorTotal - Number(gasto);
    const cpa = numVendas > 0 ? Number(gasto) / numVendas : 0;
    const roas = Number(gasto) > 0 ? valorTotal / Number(gasto) : 0;
    const cpaMax = Number(valorProduto);
    const cpaIdeal = (Number(valorProduto) / 1.5).toFixed(2);
    const cpaMeta = (Number(valorProduto) / 2).toFixed(2);
    let status = {};
    if (roas >= 2 && cpa <= cpaMeta) status = { cor: 'green', titulo: '🚀 ESCALAR VERTICAL', texto: 'Sua campanha está performando excepcionalmente bem. ROAS acima de 2.0 e CPA dentro do limite ideal.' };
    else if (roas >= 1.5 && roas < 2) status = { cor: 'yellow', titulo: '📈 ESCALAR HORIZONTAL', texto: 'Resultados promissores. ROAS entre 1.5 e 2.0. Testes controlados recomendados.' };
    else if (roas >= 1.0 && roas < 1.5) status = { cor: 'blue', titulo: '⏳ MANTER E OTIMIZAR', texto: 'Faça pequenos ajustes antes de escalar.' };
    else status = { cor: 'red', titulo: '⛔ PAUSAR OU AJUSTAR', texto: 'Indicadores críticos. ROAS abaixo do break-even ou CPA muito elevado.' };
    const recs = [];
    if (Number(ctr) < 1) recs.push({ cor: 'red', titulo: 'CTR Crítico', texto: 'Seu CTR está abaixo de 1%. Isto indica que seu anúncio não está a chamar a atenção do público. Reveja a headline, o texto e, principalmente, a imagem ou vídeo do seu criativo.' });
    else if (Number(ctr) >= 1 && Number(ctr) < 2) recs.push({ cor: 'yellow', titulo: 'CTR Mediano', texto: 'Seu CTR está entre 1% e 2%. É um resultado aceitável, mas há espaço para melhorias. Teste novas abordagens no seu criativo para aumentar o interesse.' });
    else recs.push({ cor: 'green', titulo: 'CTR Saudável', texto: 'Excelente CTR! O seu anúncio está a comunicar eficazmente com o seu público. Mantenha a estrutura criativa atual e foque em escalar.' });
    if (Number(cpc) > 2.5) recs.push({ cor: 'red', titulo: 'CPC Elevado', texto: 'Um CPC acima de R$2,50 é um sinal de alerta. O seu público pode estar muito competitivo, saturado ou o seu anúncio pode não ser relevante para ele. Considere testar novos públicos ou melhorar a qualidade do anúncio.' });
    else if (Number(cpc) > 1.5 && Number(cpc) <= 2.5) recs.push({ cor: 'yellow', titulo: 'CPC Mediano', texto: 'Seu CPC está numa faixa de atenção. Monitore de perto e tente otimizar o criativo ou a segmentação do público para reduzir este custo.' });
    else recs.push({ cor: 'green', titulo: 'CPC Ideal', texto: 'Ótimo CPC! Isto indica uma excelente atratividade do seu anúncio para o público selecionado. É um forte sinal positivo para escalar.' });
    if (Number(frequencia) > 2.5) recs.push({ cor: 'red', titulo: 'Frequência Alta', texto: 'Sua frequência está acima de 2.5, o que pode indicar saturação do público. As mesmas pessoas estão a ver o seu anúncio repetidamente, o que pode levar à "cegueira de banner". Rotação de criativos ou expansão de público são recomendados.' });
    else if (Number(frequencia) > 2 && Number(frequencia) <= 2.5) recs.push({ cor: 'yellow', titulo: 'Frequência Mediana', texto: 'Atenção, a sua frequência está a aproximar-se do limite de 2.5. Comece a preparar novos criativos para evitar a saturação do seu público.' });
    else recs.push({ cor: 'green', titulo: 'Frequência Saudável', texto: 'Sua frequência está em níveis ideais. O seu público está a ser impactado na medida certa. Continuidade recomendada.' });
    if (roas >= 2) recs.push({ cor: 'green', titulo: 'ROAS Excelente!', texto: 'Um ROAS acima de 2.0 indica alta lucratividade. Sua campanha é uma "vaca leiteira". Aumente o orçamento gradualmente (escala vertical) e considere expandir para públicos semelhantes (escala horizontal).' });
    else if (roas >= 1 && roas < 2) recs.push({ cor: 'yellow', titulo: 'ROAS Mediano', texto: 'O seu ROAS está entre 1.0 e 2.0. A campanha paga-se a si mesma, mas a margem de lucro é apertada. Foque em otimizar o CPA e a taxa de conversão antes de pensar em escalar.' });
    else recs.push({ cor: 'red', titulo: 'ROAS Insuficiente', texto: 'Alerta vermelho! Você está a perder dinheiro com esta campanha. Pause imediatamente ou faça ajustes drásticos. Teste uma nova oferta, página ou estrutura de campanha.' });

    setResultado({ cpa, roas, lucro, valorTotal, status, recs, cpaMax, cpaIdeal, cpaMeta, gasto });
  }

  const chartData = useMemo(() => ({
     labels: ['Investimento', 'Faturamento', 'Lucro'],
    datasets: [{
      label: 'Valor em R$',
      data: [Number(resultado?.gasto) || 0, resultado?.valorTotal || 0, resultado?.lucro || 0],
      backgroundColor: ['rgba(237, 25, 92, 0.7)','rgba(0, 140, 255, 0.7)','rgba(22, 163, 74, 0.7)'],
      borderColor: ['#ED195C','#008CFF','#16A34A'],
      borderWidth: 2,
      hoverBackgroundColor: ['#ED195C','#008CFF','#16A34A']
    }],
  }), [resultado]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false },
      tooltip: {
        backgroundColor: '#1f1f23', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 12 },
        padding: 12, cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.y !== null) { label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y); }
            return label;
          }
        }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#a1a1aa' }},
      x: { grid: { display: false }, ticks: { color: '#d4d4d8' }}
    }
  };

  if (isLoading) return <div className="text-center p-10">Carregando dados...</div>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-10">
      <PageHeader
        title="Simulador Inteligente de Escala"
        description="Analise o estado atual da sua campanha e receba recomendações táticas para escalar seus resultados com segurança e previsibilidade."
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <form onSubmit={calcularMetrica} className="md:w-1/2 w-full space-y-4 bg-zinc-900 p-6 rounded-2xl border border-zinc-700 self-start">
          {[{ name: 'valorProduto', label: 'Valor do Produto (R$)' }, { name: 'orcamento', label: 'Orçamento Diário (R$)' }, { name: 'gasto', label: 'Valor Gasto (R$)' }, { name: 'vendas', label: 'Vendas Realizadas' }, { name: 'ctr', label: 'CTR (%)' }, { name: 'cpc', label: 'CPC (R$)' }, { name: 'cpm', label: 'CPM (R$)' }, { name: 'frequencia', label: 'Frequência' }].map(({ name, label }) => (
            <div key={name}>
              <label htmlFor={name} className="text-sm text-zinc-400">{label}</label>
              <input id={name} type="number" step="any" name={name} value={form[name]} onChange={handleChange} className="w-full bg-zinc-800 p-3 rounded-xl mt-1 border border-zinc-700" required />
            </div>
          ))}
          <button type="submit" className="btn-legiao w-full mt-4">🔍 Analisar Campanha</button>

          {user && (
            <button
                type="button"
                onClick={() => saveData(form)}
                disabled={isSaving || saveStatus === 'success'}
                className={`w-full py-2.5 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 mt-2 ${isSaving ? 'bg-zinc-500 cursor-not-allowed' : ''} ${saveStatus === 'success' ? 'bg-green-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}
            >
                {isSaving ? ( <><LoaderCircle className="animate-spin"/> Salvando</>
                ) : saveStatus === 'success' ? ( <><Check /> Salvo</>
                ) : ( <><Save /> Salvar Dados</>
                )}
            </button>
          )}
        </form>

        {resultado && (
          <div className="md:w-1/2 w-full space-y-6 animate-fade-in">
            <div className={`p-6 rounded-xl border ${resultado.status.cor === 'green' ? 'border-green-500 bg-green-900/10' : resultado.status.cor === 'red' ? 'border-red-500 bg-red-900/10' : resultado.status.cor === 'yellow' ? 'border-yellow-400 bg-yellow-900/10' : 'border-blue-400 bg-blue-900/10'}`}>
              <h2 className="text-xl font-bold mb-2">{resultado.status.titulo}</h2>
              <p className="text-sm text-zinc-300">{resultado.status.texto}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-4 rounded-xl">💰 CPA: R$ {resultado.cpa.toFixed(2)}</div>
              <div className="bg-zinc-900 p-4 rounded-xl">📈 ROAS: {resultado.roas.toFixed(2)}</div>
              <div className="bg-zinc-900 p-4 rounded-xl">💵 Faturamento: R$ {resultado.valorTotal.toFixed(2)}</div>
              <div className="bg-zinc-900 p-4 rounded-xl">📦 Lucro: R$ {resultado.lucro.toFixed(2)}</div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-xl h-[300px]">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Desempenho Financeiro</h3>
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* --- SEÇÃO DE CPAs OTIMIZADA PARA DESKTOP E MOBILE --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-red-500 p-4 rounded-xl text-center"><strong>CPA Máximo</strong><br />R$ {resultado.cpaMax.toFixed(2)}<br /><span className="text-xs text-zinc-400">ROI 1.0</span></div>
              <div className="border border-yellow-400 p-4 rounded-xl text-center"><strong>CPA Ideal</strong><br />R$ {resultado.cpaIdeal}<br /><span className="text-xs text-zinc-400">ROI 1.5</span></div>
              <div className="border border-green-500 p-4 rounded-xl text-center"><strong>CPA Meta</strong><br />R$ {resultado.cpaMeta}<br /><span className="text-xs text-zinc-400">ROI 2.0</span></div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">Recomendações Técnicas:</h3>
              {resultado.recs.map((rec, index) => (
                <RecommendationItem
                  key={index}
                  rec={rec}
                  isOpen={openRecommendation === index}
                  onClick={() => setOpenRecommendation(openRecommendation === index ? null : index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}