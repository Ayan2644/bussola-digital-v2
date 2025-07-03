// Local: supabase/functions/gestor-trafego-ia/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Os prompts e a base de conhecimento agora vivem seguros no backend.
const knowledgeBase = `
Sobre o orçamento de campanha Advantage: O Orçamento de Campanha Advantage é mais adequado para campanhas com pelo menos dois conjuntos de anúncios. Ele gerencia automaticamente o orçamento da campanha em conjuntos de anúncios a fim de oferecer os melhores resultados gerais, distribuindo continuamente em tempo real para os conjuntos de anúncios com as melhores oportunidades.
Sobre orçamentos diários: O valor médio que você deseja gastar por dia. A Meta pode gastar até 75% acima do seu orçamento diário em alguns dias, mas não gastará mais do que sete vezes seu orçamento diário em uma semana (domingo a sábado).
Fase de aprendizado: É o período em que o sistema de veiculação ainda precisa aprender como um conjunto de anúncios pode ser veiculado. O desempenho é menos estável e o CPA geralmente é mais alto. Um conjunto de anúncios sai da fase de aprendizado após cerca de 50 eventos de otimização na semana após a última edição significativa.
Edições significativas: Qualquer alteração no direcionamento, criativo, evento de otimização, adicionar um novo anúncio, ou pausar por mais de 7 dias reinicia a fase de aprendizado. Grandes alterações no orçamento ou lance também podem reiniciar a fase.
Aprendizado limitado: Ocorre quando um conjunto de anúncios não está recebendo eventos de otimização suficientes para sair da fase de aprendizado, geralmente devido ao público pequeno, orçamento baixo, ou controle de lance/custo muito restritivo.
Estratégias de lance: Volume mais alto (gastar o orçamento para obter o máximo de resultados), Meta de custo por resultado (manter o CPA em torno de um valor), Meta de ROAS (manter o retorno em torno de um valor), e Limite de lance (controle manual máximo).
`;

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


serve(async (req) => {
  // Tratamento de CORS para permitir requisições do seu app
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    // Pega os dados enviados pelo frontend
    const { campaignData } = await req.json()
    if (!campaignData) {
      throw new Error('Dados da campanha não foram fornecidos.')
    }

    // Pega a chave da API do Gemini, que está armazenada de forma segura
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Chave da API do Gemini não configurada nos secrets do projeto.')
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`

    // Monta o payload para a API do Gemini
    const chatHistory = [
        { role: 'user', parts: [{ text: masterPrompt }] },
        { role: 'model', parts: [{ text: 'Entendido. Estou pronto para atuar.' }] },
        { role: 'user', parts: [{ text: `Use o seguinte documento como sua base de conhecimento: \n\n${knowledgeBase}` }] },
        { role: 'model', parts: [{ text: 'Base de conhecimento integrada. Pode enviar os dados.' }] },
        { role: 'user', parts: [{ text: `Excelente. Aqui estão os dados para análise:\n\n${campaignData}` }] }
    ];

    const payload = {
        contents: chatHistory,
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
    };

    // Faz a chamada para a API do Gemini
    const geminiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        throw new Error(`Erro na API do Gemini: ${geminiResponse.status} ${errorBody}`)
    }

    const result = await geminiResponse.json();
    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível obter uma análise.";

    // Retorna a resposta da IA de volta para o seu app
    return new Response(
      JSON.stringify({ analysis: aiResponse }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})