// src/components/OptimizationMap.jsx

import React from 'react';

// Componente para renderizar cada card de otimização
function OptimizationCard({ title, causes, actions, status, detailedRecommendation }) {
  // Define a cor do indicador com base no status da métrica
  const statusColor =
    status === 'excellent' ? 'bg-green-400' :
    status === 'good' ? 'bg-yellow-400' :
    'bg-red-500';

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-6">
      <h3 className="flex items-center text-xl font-bold text-cyan-400 mb-4">
        <span className={`w-3 h-3 rounded-full mr-3 ${statusColor}`}></span>
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-white mb-2">POSSÍVEIS CAUSAS:</h4>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            {causes.map((cause, index) => (
              <li key={index}>{cause}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">AÇÕES RECOMENDADAS:</h4>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            {actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      </div>
      {/* Bloco para a recomendação detalhada e contextual */}
      {detailedRecommendation && (
        <div className="mt-6 pt-4 border-t border-zinc-700 bg-zinc-900/50 p-4 rounded-lg">
          <p className="text-sm text-zinc-300">
            <span className="font-bold text-white">{detailedRecommendation.title}:</span> {detailedRecommendation.text}
          </p>
        </div>
      )}
    </div>
  );
}

// Componente principal que decide qual card mostrar
export default function OptimizationMap({ results }) {
  if (!results) return null;

  const { ctr, conn, pconv, cconv } = results;

  // Função para obter o status ('bad', 'good', 'excellent')
  const getStatus = (score) => {
      if (score === 2) return 'excellent';
      if (score === 1) return 'good';
      return 'bad';
  }

  // Lógica para determinar o score (0, 1, 2) de cada métrica
  const scores = {
    ctr: ctr >= 2 ? 2 : ctr >= 1 ? 1 : 0,
    conn: conn >= 90 ? 2 : conn >= 75 ? 1 : 0,
    pconv: pconv >= 10 ? 2 : pconv >= 5 ? 1 : 0,
    cconv: cconv >= 40 ? 2 : cconv >= 20 ? 1 : 0,
  };
  
  const statuses = {
      ctr: getStatus(scores.ctr),
      conn: getStatus(scores.conn),
      pconv: getStatus(scores.pconv),
      cconv: getStatus(scores.cconv),
  }

  // Dados robustos para cada card de otimização, incluindo recomendações detalhadas
  const optimizationData = {
    ctr: {
      title: 'CTR (Taxa de Cliques)',
      causes: [
        'Criativo fortemente conectado com o público',
        'Call to Action (CTA) claro e irresistível',
        'Segmentação de público adequada e otimizada',
      ],
      actions: [
        'Duplicar campanhas vencedoras e aumentar orçamento progressivamente',
        'Criar variações do anúncio vencedor para evitar fadiga de anúncio',
        'Aplicar aprendizados em outras campanhas',
      ],
      detailedRecs: {
          excellent: {
              title: 'Escala Inteligente',
              text: 'Você atingiu um CTR excelente! Agora é hora de escalar gradualmente, aumentando o orçamento em incrementos de 20-30% a cada 3-4 dias. Simultaneamente, prepare 2-3 variações do anúncio vencedor para alternar e evitar a fadiga de anúncio, mantendo o mesmo gancho e estrutura que funcionaram, mas com diferentes visuais.'
          }
      }
    },
    conn: {
      title: 'Connect Rate (Clique • Page View)',
      causes: [
        'Página lenta ou com problemas de carregamento',
        'Links quebrados ou redirecionamentos errados',
        'Problemas de responsividade (experiência ruim no mobile)',
        'Hospedagem de baixa qualidade',
      ],
      actions: [
        'Fazer auditoria técnica da página com ferramentas especializadas',
        'Otimizar imagens, scripts e elementos pesados',
        'Verificar links e redirecionamentos',
        'Implementar CDN ou avaliar troca de hospedagem',
      ],
       detailedRecs: {
          bad: {
              title: 'Auditoria Técnica Imediata',
              text: 'Use ferramentas como GTmetrix e Pagespeed Insights para identificar exatamente o que está causando a lentidão. Geralmente, imagens pesadas e/ou renderização em excesso de javascript são as causas. Considere implementar um CDN (Content Delivery Network) se o tempo de resposta do seu servidor for o problema.'
          }
      }
    },
    pconv: {
      title: 'Conversão da Página (Page View • Checkout)',
      causes: [
        'Página persuasiva com gatilhos claros',
        'Estrutura de copy com storytelling',
        'Elementos de confiança evidentes',
      ],
      actions: [
        'Escalar tráfego para a página',
        'Testar pequenas variações para otimização contínua',
        'Analisar elementos vencedores para replicar',
      ],
       detailedRecs: {
          excellent: {
              title: 'Otimização contínua e segmentada',
              text: 'Sua página está convertendo excepcionalmente bem! Agora é o momento para testes mais refinados e deep dives. Implemente testes A/B segmentados por origem do tráfego, dispositivo e demografia para refinar a persuasão da sua mensagem. Considere implementar personalização dinâmica baseada no comportamento anterior do usuário.'
          }
      }
    },
    cconv: {
      title: 'Conversão do Checkout (Checkout • Compra)',
      causes: [
        'Processo de checkout simplificado e confiável',
        'Processo de compra fluido',
        'Boa taxa de aprovação',
        'Elementos de confiança efetivos',
      ],
      actions: [
        'Escalar campanhas que levam a esse checkout eficiente',
        'Otimizar o público que chega nesta etapa',
        'Implementar upsells e cross-sells estratégicos',
      ],
      detailedRecs: {
          excellent: {
              title: 'Maximização de valor por cliente',
              text: 'Com um checkout tão eficiente, é o momento ideal para implementar upsells e cross-sells inteligentes que aumentem o valor médio do pedido sem complicar o processo. Implemente ofertas "one-click-upsell" pós-compra para maximizar o LTV do cliente com atrito zero.'
          }
      }
    },
  };

  return (
      <div className="bg-zinc-900/80 border border-zinc-700 p-6 rounded-2xl shadow-lg mt-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gradient">Mapa de Otimização</h2>
          {Object.keys(optimizationData).map(metricKey => {
              const metricData = optimizationData[metricKey];
              const status = statuses[metricKey];
              let detailedRecommendation = null;

              // Lógica para mostrar recomendação detalhada com base no status
              if (metricData.detailedRecs) {
                  if (status === 'excellent' && metricData.detailedRecs.excellent) {
                      detailedRecommendation = metricData.detailedRecs.excellent;
                  } else if (status === 'bad' && metricData.detailedRecs.bad) {
                       detailedRecommendation = metricData.detailedRecs.bad;
                  }
              }
              
              return (
                  <OptimizationCard 
                    key={metricKey}
                    title={metricData.title}
                    causes={metricData.causes}
                    actions={metricData.actions}
                    status={status}
                    detailedRecommendation={detailedRecommendation}
                  />
              )
          })}
      </div>
  );
}
