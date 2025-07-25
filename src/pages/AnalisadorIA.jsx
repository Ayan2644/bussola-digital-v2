// Local de Instalação: src/pages/AnalisadorIA.jsx
// VERSÃO FINAL COM SINCRONIZAÇÃO REALTIME DO HISTÓRICO

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Bot, LineChart, Zap, Save, LoaderCircle, Check, History, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export default function AnalisadorIA() {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [error, setError] = useState('');
  const [campaignData, setCampaignData] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setIsHistoryLoading(false);
      return;
    }
    setIsHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('ia_analyses')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSavedAnalyses(data || []);
      
    } catch (err) {
      if (err.code !== '42P01') { 
          console.error("Erro ao buscar histórico:", err);
          setError("Não foi possível carregar o histórico de análises.");
      }
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ===== INÍCIO DA IMPLEMENTAÇÃO REALTIME =====
  useEffect(() => {
    if (!user) return;

    const handleRealtimeUpdate = (payload) => {
      console.log('[Realtime] Mudança recebida em ia_analyses:', payload);
      if (payload.eventType === 'INSERT') {
        // Adiciona a nova análise no topo da lista
        const newAnalysis = {
            id: payload.new.id,
            title: payload.new.title,
            created_at: payload.new.created_at,
        };
        setSavedAnalyses(prev => [newAnalysis, ...prev]);
      }
      if (payload.eventType === 'DELETE') {
        // Remove a análise da lista pelo ID
        setSavedAnalyses(prev => prev.filter(a => a.id !== payload.old.id));
      }
    };

    const channel = supabase
      .channel(`ia_analyses:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, DELETE
          schema: 'public',
          table: 'ia_analyses',
          filter: `user_id=eq.${user.id}`,
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  // ===== FIM DA IMPLEMENTAÇÃO REALTIME =====

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    if (!campaignData.trim()) {
      setError('Por favor, insira os dados da campanha para análise.');
      toast.error('O campo de dados da campanha não pode estar vazio.');
      return;
    }

    setIsLoading(true);
    setAnalysisResult('');
    setAnalysisTitle(`Análise de ${new Date().toLocaleDateString('pt-BR')}`);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Sessão do usuário não encontrada. Por favor, faça login novamente.");
      }

      const { data, error: funcError } = await supabase.functions.invoke('gestor-trafego-ia', {
        body: { campaignData },
      });

      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      setAnalysisResult(data.analysis);
      toast.success("Análise da IA concluída!");

    } catch (err) {
      console.error("Erro ao chamar a função da IA:", err);
      const errorMessage = err.message.includes("fetch failed") 
        ? "Erro de rede. Verifique sua conexão ou a disponibilidade da função."
        : `Ocorreu um erro ao conectar com o agente: ${err.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!user || !campaignData.trim() || !analysisResult.trim() || !analysisTitle.trim()) {
        setError("Título, dados da campanha e resultado da análise são necessários para salvar.");
        toast.error("Preencha todos os campos para salvar a análise.");
        return;
    }
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      // O evento de INSERT será capturado pelo listener Realtime,
      // então não precisamos mais atualizar o estado aqui.
      const { error } = await supabase
        .from('ia_analyses')
        .insert({
          user_id: user.id,
          title: analysisTitle,
          campaign_data: campaignData,
          analysis_result: analysisResult
        });

      if (error) throw error;
      
      toast.success("Análise salva com sucesso!");
      setSaveStatus('success');

    } catch (err) {
      setSaveStatus('error');
      setError("Erro ao salvar a análise.");
      toast.error("Ocorreu um erro ao salvar a análise.");
      console.error("Erro ao salvar análise:", err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const loadAnalysis = async (id) => {
    const { data, error } = await supabase.from('ia_analyses').select().eq('id', id).single();
    if (error) {
        toast.error("Não foi possível carregar a análise selecionada.");
        return;
    }
    if (data) {
        setCampaignData(data.campaign_data);
        setAnalysisResult(data.analysis_result);
        setAnalysisTitle(data.title);
        toast.success(`Análise "${data.title}" carregada.`);
    }
  };

  const deleteAnalysis = async (id) => {
    try {
        // O evento de DELETE será capturado pelo listener Realtime.
        const { error } = await supabase.from('ia_analyses').delete().eq('id', id);
        if (error) throw error;
        toast.success("Análise excluída.");
    } catch (err) {
        toast.error("Erro ao excluir a análise.");
    }
  };
  
  // O restante do seu componente (o JSX) permanece o mesmo.
  // ... cole o resto do return aqui ...
  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-white p-4">
      <PageHeader title="Gestor de Tráfego Sênior" description="Cole os dados de suas campanhas e receba uma análise profunda e um plano de ação tático do nosso especialista em tráfego." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-1 bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><History/> Histórico de Análises</h2>
            {isHistoryLoading ? <div className="flex justify-center items-center h-40"><LoaderCircle className="animate-spin text-legiao-blue"/></div> : savedAnalyses.length > 0 ? (
                <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {savedAnalyses.map(item => (
                        <li key={item.id} className="group bg-zinc-800 p-3 rounded-lg flex justify-between items-center transition hover:bg-zinc-700">
                            <button onClick={() => loadAnalysis(item.id)} className="text-left flex-1">
                                <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                                <p className="text-xs text-zinc-400">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                            </button>
                            <button onClick={() => deleteAnalysis(item.id)} className="text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition ml-2">
                                <Trash2 size={16}/>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-zinc-400 text-sm">Nenhuma análise salva.</p>}
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 gap-8">
            <div className="bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6 flex flex-col">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><LineChart/> Dados da Campanha</h2>
              <form onSubmit={handleAnalyze} className="flex flex-col flex-grow">
                  <textarea value={campaignData} onChange={(e) => setCampaignData(e.target.value)} placeholder="Ex:&#10;Campanha, Investimento, Vendas, CPA&#10;Campanha Fria 01, R$50, 2, R$25" className="input w-full flex-grow text-sm resize-none" rows={10} disabled={isLoading} />
                  {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><AlertTriangle size={16}/> {error}</p>}
                  <button type="submit" disabled={isLoading} className="btn-legiao w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
                      {isLoading ? (<><LoaderCircle className="animate-spin"/> Analisando...</>) : (<><Zap className="w-5 h-5" /> Analisar com IA</>)}
                  </button>
              </form>
            </div>

            <div className={`bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6 ${analysisResult ? 'animate-fade-in' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Bot /> Análise e Plano de Ação</h2>
                    {analysisResult && user && (
                        <button onClick={handleSaveAnalysis} disabled={isSaving || saveStatus === 'success'} className={`py-2 px-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 text-sm
                            ${isSaving ? 'bg-zinc-500' : ''}
                            ${saveStatus === 'success' ? 'bg-green-600' : 'bg-zinc-700 hover:bg-zinc-600'}`}>
                           {isSaving ? (<LoaderCircle className="animate-spin"/>) : saveStatus === 'success' ? (<Check />) : (<Save />)}
                           {saveStatus === 'success' ? ' Salvo' : ' Salvar'}
                        </button>
                    )}
                </div>
                {analysisResult && <input type="text" value={analysisTitle} onChange={e => setAnalysisTitle(e.target.value)} className="input w-full mb-4" placeholder="Dê um título para esta análise"/>}

                <div className="prose prose-invert prose-sm max-w-none bg-zinc-800 p-4 rounded-lg h-[400px] overflow-y-auto text-zinc-300">
                    {isLoading ? <p className="text-center pt-4">Aguardando o especialista analisar os dados...</p> 
                    : analysisResult ? <pre className="whitespace-pre-wrap font-sans">{analysisResult}</pre> 
                    : <p className="text-zinc-500 text-center pt-4">O resultado da análise aparecerá aqui.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};