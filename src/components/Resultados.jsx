// src/components/Resultados.jsx

import Card from './ui/Card'

export default function Resultados({ dados }) {
  const { cpa, roas, faturamento, lucro } = dados

  return (
    <Card className="p-6 mt-10">
      <div className="text-green-400 text-xl font-bold mb-4">
        🚀 ESCALAR VERTICAL
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-black rounded-xl p-4 text-center">
          <div className="text-sm text-zinc-400">CPA</div>
          <div className="text-xl font-bold text-white">R$ {cpa.toFixed(2)}</div>
        </div>
        <div className="bg-black rounded-xl p-4 text-center">
          <div className="text-sm text-zinc-400">ROAS</div>
          <div className="text-xl font-bold text-white">{roas.toFixed(2)}</div>
        </div>
        <div className="bg-black rounded-xl p-4 text-center">
          <div className="text-sm text-zinc-400">Faturamento</div>
          <div className="text-xl font-bold text-white">R$ {faturamento.toFixed(2)}</div>
        </div>
        <div className="bg-black rounded-xl p-4 text-center">
          <div className="text-sm text-zinc-400">Lucro</div>
          <div className="text-xl font-bold text-white">R$ {lucro.toFixed(2)}</div>
        </div>
      </div>
    </Card>
  )
}
