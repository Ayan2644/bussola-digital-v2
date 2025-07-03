import { useState } from 'react'

export default function MetricsForm({ onSubmit }) {
  const [form, setForm] = useState({
    produto: '',
    orcamento: '',
    gasto: '',
    vendas: '',
    ctr: '',
    cpc: '',
    cpm: '',
    freq: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const parsed = {
      produto: parseFloat(form.produto) || 0,
      orcamento: parseFloat(form.orcamento) || 0,
      gasto: parseFloat(form.gasto) || 0,
      vendas: parseInt(form.vendas) || 0,
      ctr: parseFloat(form.ctr) || 0,
      cpc: parseFloat(form.cpc) || 0,
      cpm: parseFloat(form.cpm) || 0,
      freq: parseFloat(form.freq) || 0,
    }
    onSubmit(parsed)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 bg-zinc-900 p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col">
        <label className="text-sm mb-1">Valor do Produto (R$)</label>
        <input type="number" name="produto" onChange={handleChange} className="input" placeholder="Ex: 197" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Orçamento Diário (R$)</label>
        <input type="number" name="orcamento" onChange={handleChange} className="input" placeholder="Ex: 200" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Valor Gasto Até Agora (R$)</label>
        <input type="number" name="gasto" onChange={handleChange} className="input" placeholder="Ex: 500" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Vendas Realizadas</label>
        <input type="number" name="vendas" onChange={handleChange} className="input" placeholder="Ex: 8" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">CTR (%)</label>
        <input type="number" name="ctr" onChange={handleChange} className="input" placeholder="Ex: 2.5" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">CPC (R$)</label>
        <input type="number" name="cpc" onChange={handleChange} className="input" placeholder="Ex: 1.5" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">CPM (R$)</label>
        <input type="number" name="cpm" onChange={handleChange} className="input" placeholder="Ex: 15" />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Frequência</label>
        <input type="number" name="freq" onChange={handleChange} className="input" placeholder="Ex: 1.8" />
      </div>

      <button type="submit" className="col-span-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#ff00f0] text-white font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
        🔍 Analisar Campanha
      </button>
    </form>
  )
}
