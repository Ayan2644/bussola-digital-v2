// src/pages/AnalisadorIA.jsx (Código completo e atualizado)

import React, { useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Bot, LineChart, Zap } from 'lucide-react';

// Conteúdo do seu documento de otimização
const knowledgeBase = `
Sobre o orçamento de campanha Advantage: O Orçamento de Campanha Advantage é mais adequado para campanhas com pelo menos dois conjuntos de anúncios. Ele gerencia automaticamente o orçamento da campanha em conjuntos de anúncios a fim de oferecer os melhores resultados gerais, distribuindo continuamente em tempo real para os conjuntos de anúncios com as melhores oportunidades.
Sobre orçamentos diários: O valor médio que você deseja gastar por dia. A Meta pode gastar até 75% acima do seu orçamento diário em alguns dias, mas não gastará mais do que sete vezes seu orçamento diário em uma semana (domingo a sábado).
Fase de aprendizado: É o período em que o sistema de veiculação ainda precisa aprender como um conjunto de anúncios pode ser veiculado. O desempenho é menos estável e o CPA geralmente é mais alto. Um conjunto de anúncios sai da fase de aprendizado após cerca de 50 eventos de otimização na semana após a última edição significativa.
Edições significativas: Qualquer alteração no direcionamento, criativo, evento de otimização, adicionar um novo anúncio, ou pausar por mais de 7 dias reinicia a fase de aprendizado. Grandes alterações no orçamento ou lance também podem reiniciar a fase.
Aprendizado limitado: Ocorre quando um conjunto de anúncios não está recebendo eventos de otimização suficientes para sair da fase de aprendizado, geralmente devido ao público pequeno, orçamento baixo, ou controle de lance/custo muito restritivo.
Estratégias de lance: Volume mais alto (gastar o orçamento para obter o máximo de resultados), Meta de custo por resultado (manter o CPA em torno de um valor), Meta de ROAS (manter o retorno em torno de um valor), e Limite de lance (controle manual máximo).
`;

// O prompt mestre atualizado, agora com o nome e a base de conhecimento
const masterPrompt = `
Você é o "Gestor de Tráfego Sênior", um especialista supremo em Facebook Ads.

🧠 Contexto:
Seu QI é 180. Você é brutalmente honesto, direto e orientado a performance.
Você já gerenciou e escalou múltiplas contas com milhões investidos e construiu empresas bilionárias a partir de campanhas de aquisição.
Você domina o ecossistema da Meta, pensando em sistemas, ciclos e alavancas.
Você é um grande analisador de canibalização de tráfego e entende os momentos ideais para escala vertical e horizontal.
Sua principal fonte de conhecimento técnico sobre a plataforma Meta Ads é a base de conhecimento fornecida. Use-a para embasar suas análises.

🎯 Sua missão é:
Analisar os dados da campanha que fornecerei.
Diagnosticar os erros e gargalos mais críticos com base nos dados e na sua base de conhecimento.
Propor um plano de otimização com foco em alavancagem máxima.
Reestruturar campanhas, conjuntos e anúncios se necessário.
Analisar padrões históricos de campanha e otimizar com base em CPA, CPC e CTR.

Você sempre entrega a sua análise na seguinte estrutura:
1.  **ANÁLISE GERAL:** Um diagnóstico honesto da situação atual.
2.  **CLASSIFICAÇÃO DE CAMPANHAS:** Classifique cada campanha/criativo como ✅ Verde (Escalar), 🟡 Amarelo (Testar/Otimizar) ou ❌ Vermelho (Descartar), explicando o porquê com base nos dados.
3.  **PLANO DE AÇÃO DETALHADO:** Um passo a passo claro do que eu devo executar nas próximas 24h. Inclua sugestões de estrutura (ex: 1-2-1), público, criativos e orçamento.
4.  **DIRETRIZ FINAL:** Uma recomendação final e uma pergunta estratégica para me forçar a pensar no próximo nível, como um amigo e parceiro de negócios.

Agora, aguarde os dados da campanha do usuário para analisá-los.
`;

const AnalisadorIA = () => {
  const [campaignData, setCampaignData] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lê a chave de API da Google a partir das variáveis de ambiente
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!campaignData.trim()) {
        setError('Por favor, insira os dados da campanha para análise.');
        return;
    }
    if (!apiKey) {
        setError('A chave de API do Gemini não foi encontrada. Verifique o seu arquivo .env.');
        return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult('');

    // Estrutura a conversa com a IA em turnos para melhor contexto
    const chatHistory = [
        { role: 'user', parts: [{ text: masterPrompt }] },
        { role: 'model', parts: [{ text: 'Entendido. Estou pronto para atuar como o Gestor de Tráfego Sênior. Por favor, forneça os dados da campanha para que eu possa começar a análise.' }] },
        { role: 'user', parts: [{ text: `Use o seguinte documento como sua base de conhecimento principal para a análise: \n\n${knowledgeBase}` }] },
        { role: 'model', parts: [{ text: 'Base de conhecimento integrada. Agora estou ainda mais preparado. Pode enviar os dados da campanha.' }] },
        { role: 'user', parts: [{ text: `Excelente. Aqui estão os dados para análise:\n\n${campaignData}` }] }
    ];

    try {
        const payload = {
            contents: chatHistory,
            // Adicionamos configurações de segurança para evitar bloqueios
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('API Error Response:', result);
            throw new Error(result.error?.message || 'A API retornou um erro.');
        }

        let aiResponse = 'Desculpe, não consegui processar a resposta.';
        if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
            aiResponse = result.candidates[0].content.parts[0].text;
        } else {
             // Se não houver texto, pode ser que o conteúdo foi bloqueado
            aiResponse = `A resposta foi bloqueada. Motivo: ${result.candidates[0]?.finishReason || 'Não especificado'}. Tente reformular os dados da campanha.`;
        }

        setAnalysisResult(aiResponse);

    } catch (err) {
        console.error("Erro ao buscar análise da IA:", err);
        setError(`Ocorreu um erro ao conectar com o agente: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] text-white p-4">
      <PageHeader
        title="Gestor de Tráfego Sênior"
        description="Cole os dados de suas campanhas e receba uma análise profunda e um plano de ação tático do nosso especialista em tráfego, treinado com a documentação oficial da Meta."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Coluna de Entrada de Dados */}
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><LineChart/> Dados da Campanha</h2>
            <p className="text-sm text-zinc-400 mb-4">Copie as colunas da sua planilha ou do Gerenciador de Anúncios e cole no campo abaixo. Inclua nomes, investimento, CPA, ROAS, CTR, etc.</p>
            <form onSubmit={handleAnalyze} className="flex flex-col flex-grow">
                <textarea
                    value={campaignData}
                    onChange={(e) => setCampaignData(e.target.value)}
                    placeholder="Exemplo:&#10;Campanha, Investimento, Vendas, CPA&#10;Campanha Fria 01, R$50, 2, R$25&#10;Remarketing 02, R$30, 3, R$10"
                    className="input w-full flex-grow text-sm resize-none"
                    rows={15}
                    disabled={isLoading}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-legiao w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></div>
                            Analisando...
                        </>
                    ) : (
                       <> <Zap className="w-5 h-5" /> Analisar com IA </>
                    )}
                </button>
            </form>
        </div>

        {/* Coluna de Resultados da Análise */}
        <div className="bg-zinc-900/80 border border-zinc-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Bot /> Análise e Plano de Ação</h2>
            <div className="prose prose-invert prose-sm max-w-none bg-zinc-800 p-4 rounded-lg h-[500px] overflow-y-auto text-zinc-300">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p>Aguardando o especialista analisar os dados...</p>
                    </div>
                ) : analysisResult ? (
                    <pre className="whitespace-pre-wrap font-sans">{analysisResult}</pre>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-zinc-500">O resultado da análise aparecerá aqui.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalisadorIA;