// src/pages/Simulador.jsx (Com persistência de dados e feedback)

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext'; // Importar hook de autenticação
import { supabase } from '../supabase'; // Importar cliente Supabase
import { Save, LoaderCircle, Check } from 'lucide-react'; // Ícones para feedback

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Simulador() {
  // --- ESTADOS DE CONTROLE ---
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  // --- ESTADOS DA FERRAMENTA ---
  const [form, setForm] = useState({
    valorProduto: '', orcamento: '', gasto: '',
    vendas: '', ctr: '', cpc: '', cpm: '', frequencia: '',
  });
  const [resultado, setResultado] = useState(null);

  // --- CARREGAR DADOS DO USUÁRIO ---
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
          .eq('tool_name', 'simulador')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setForm(data.data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do simulador:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  // --- SALVAR DADOS DO USUÁRIO ---
  const handleSaveData = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const { error } = await supabase.from('user_tool_data').upsert({
        user_id: user.id,
        tool_name: 'simulador',
        data: form,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, tool_name' });

      if (error) throw error;
      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
      console.error("Erro ao salvar dados do simulador:", error);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function calcularMetrica(e) {
    e.preventDefault();
    // ... (lógica de cálculo permanece a mesma)
    const { valorProduto, gasto, vendas, ctr, cpc, frequencia } = form;
    const numVendas = Number(vendas);
    const valorTotal = Number(valorProduto) * numVendas;
    const lucro = valorTotal - Number(gasto);
    const cpa = Number(gasto) / (numVendas || 1);
    const roas = valorTotal / Number(gasto);
    const cpaMax = Number(valorProduto);
    const cpaIdeal = (Number(valorProduto) / 1.5).toFixed(2);
    const cpaMeta = (Number(valorProduto) / 2).toFixed(2);
    let status = {};
    if (roas >= 2 && cpa <= cpaMeta) status = { cor: 'green', titulo: '🚀 ESCALAR VERTICAL', texto: 'Sua campanha está performando excepcionalmente bem. ROAS acima de 2.0 e CPA dentro do limite ideal.' };
    else if (roas >= 1.5 && roas < 2) status = { cor: 'yellow', titulo: '📈 ESCALAR HORIZONTAL', texto: 'Resultados promissores. ROAS entre 1.5 e 2.0. Testes controlados recomendados.' };
    else if (roas >= 1.0 && roas < 1.5) status = { cor: 'blue', titulo: '⏳ MANTER E OTIMIZAR', texto: 'Faça pequenos ajustes antes de escalar.' };
    else status = { cor: 'red', titulo: '⛔ PAUSAR OU AJUSTAR', texto: 'Indicadores críticos. ROAS abaixo do break-even ou CPA muito elevado.' };
    const recs = [];
    if (Number(ctr) < 1) recs.push({ cor: 'red', titulo: '⚠️ CTR Crítico', texto: 'CTR abaixo de 1%. Reveja headline, criativo e gancho.' });
    else if (Number(ctr) >= 1 && Number(ctr) < 2) recs.push({ cor: 'yellow', titulo: '🔍 CTR Mediano', texto: 'CTR entre 1% e 2%. Pode melhorar com testes.' });
    else recs.push({ cor: 'green', titulo: '✅ CTR Saudável', texto: 'Mantenha estrutura criativa atual e escale.' });
    if (Number(cpc) > 2.5) recs.push({ cor: 'red', titulo: '⚠️ CPC Elevado', texto: 'CPC acima de R$2,50. Público pode estar saturado.' });
    else if (Number(cpc) > 1.5 && Number(cpc) <= 2.5) recs.push({ cor: 'yellow', titulo: '🔍 CPC Mediano', texto: 'CPC entre R$1,50 e R$2,50. Otimize criativo ou público.' });
    else recs.push({ cor: 'green', titulo: '✅ CPC Ideal', texto: 'CPC dentro do ideal. Excelente sinal de atratividade.' });
    if (Number(frequencia) > 2.5) recs.push({ cor: 'red', titulo: '⚠️ Frequência Alta', texto: 'Frequência acima de 2.5. Pode estar saturando.' });
    else if (Number(frequencia) > 2 && Number(frequencia) <= 2.5) recs.push({ cor: 'yellow', titulo: '🔍 Frequência Mediana', texto: 'Atenção. Frequência se aproximando do limite.' });
    else recs.push({ cor: 'green', titulo: '✅ Frequência Saudável', texto: 'Frequência saudável. Continuidade recomendada.' });
    if (roas >= 2) recs.push({ cor: 'green', titulo: '✅ ROAS Excelente!', texto: 'ROAS acima de 2.0! Escala liberada.' });
    else if (roas >= 1 && roas < 2) recs.push({ cor: 'yellow', titulo: '🔍 ROAS Mediano', texto: 'ROAS entre 1.0 e 2.0. Otimize antes de escalar.' });
    else recs.push({ cor: 'red', titulo: '⛔ ROAS Insuficiente', texto: 'Está perdendo dinheiro. Testar nova estrutura.' });
    setResultado({ cpa, roas, lucro, valorTotal, status, recs, cpaMax, cpaIdeal, cpaMeta, gasto });
  }

  const chartData = {
    labels: ['Investimento', 'Faturamento', 'Lucro'],
    datasets: [{ label: 'R$', data: [Number(resultado?.gasto), resultado?.valorTotal, resultado?.lucro], backgroundColor: '#00ffc3' }],
  };

  if (isLoading) return <div className="text-center p-10">Carregando...</div>;

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
              <label className="text-sm text-zinc-400">{label}</label>
              <input type="number" step="any" name={name} value={form[name]} onChange={handleChange} className="w-full bg-zinc-800 p-3 rounded-xl mt-1 border border-zinc-700" required />
            </div>
          ))}
          <button type="submit" className="btn-legiao w-full mt-4">🔍 Analisar Campanha</button>
          
          {/* --- BOTÃO DE SALVAR COM FEEDBACK VISUAL --- */}
          {user && (
            <button
                type="button"
                onClick={handleSaveData}
                disabled={isSaving || saveStatus === 'success'}
                className={`w-full py-2.5 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 mt-2
                    ${isSaving ? 'bg-zinc-500 cursor-not-allowed' : ''}
                    ${saveStatus === 'success' ? 'bg-green-600' : 'bg-zinc-700 hover:bg-zinc-600'}
                `}
            >
                {isSaving ? ( <><LoaderCircle className="animate-spin"/> Salvando</>
                ) : saveStatus === 'success' ? ( <><Check /> Salvo</>
                ) : ( <><Save /> Salvar Dados</>
                )}
            </button>
          )}
        </form>

        {/* ... (Bloco de Resultados permanece o mesmo) ... */}
        {resultado && (
          <div className="md:w-1/2 w-full space-y-6">
            <div className={`p-6 rounded-xl border ${resultado.status.cor === 'green' ? 'border-green-500 bg-green-900/10' : resultado.status.cor === 'red' ? 'border-red-500 bg-red-900/10' : resultado.status.cor === 'yellow' ? 'border-yellow-400 bg-yellow-900/10' : 'border-blue-400 bg-blue-900/10'}`}>
              <h2 className="text-xl font-bold mb-2">{resultado.status.titulo}</h2>
              <p>{resultado.status.texto}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-4 rounded-xl">💰 CPA: R$ {resultado.cpa.toFixed(2)}</div>
              <div className="bg-zinc-900 p-4 rounded-xl">📈 ROAS: {resultado.roas.toFixed(2)}</div>
              <div className="bg-zinc-900 p-4 rounded-xl">💵 Faturamento: R$ {resultado.valorTotal.toFixed(2)}</div>
              <div className="bg-zinc-900 p-4 rounded-xl">📦 Lucro: R$ {resultado.lucro.toFixed(2)}</div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Desempenho Financeiro</h3>
              <Bar data={chartData} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-red-500 p-4 rounded-xl text-center"><strong>CPA Máximo</strong><br />R$ {resultado.cpaMax}<br />ROI 1.0</div>
              <div className="border border-yellow-400 p-4 rounded-xl text-center"><strong>CPA Ideal</strong><br />R$ {resultado.cpaIdeal}<br />ROI 1.5</div>
              <div className="border border-green-500 p-4 rounded-xl text-center"><strong>CPA Meta</strong><br />R$ {resultado.cpaMeta}<br />ROI 2.0</div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">Recomendações Técnicas:</h3>
              {resultado.recs.map((r, i) => (
                <div key={i} className={`border-l-4 p-4 rounded-xl ${r.cor === 'green' ? 'border-green-500' : r.cor === 'red' ? 'border-red-500' : 'border-yellow-400'}`}>
                  <strong>{r.titulo}</strong><br />{r.texto}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}