// src/components/SonarForm.jsx
import { useState } from 'react'

export default function SonarForm({ onSubmit }) {
  const [form, setForm] = useState({
    impressions: '',
    clicks: '',
    pageviews: '',
    checkouts: '',
    purchases: '',
    adSpend: '',
    averageOrder: '',
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      impressions:   parseFloat(form.impressions)   || 0,
      clicks:        parseFloat(form.clicks)        || 0,
      pageviews:     parseFloat(form.pageviews)     || 0,
      checkouts:     parseFloat(form.checkouts)     || 0,
      purchases:     parseFloat(form.purchases)     || 0,
      adSpend:       parseFloat(form.adSpend)       || 0,
      averageOrder:  parseFloat(form.averageOrder)  || 0,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900 p-6 rounded-2xl shadow-lg"
    >
      {/** cada bloco de input **/}
      <div className="flex flex-col">
        <label className="text-sm mb-1">Impressões</label>
        <input
          name="impressions"
          type="number"
          value={form.impressions}
          onChange={handleChange}
          className="input"
          placeholder="Número total de impressões"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Cliques no Link</label>
        <input
          name="clicks"
          type="number"
          value={form.clicks}
          onChange={handleChange}
          className="input"
          placeholder="Número total de cliques"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Visualizações da Página</label>
        <input
          name="pageviews"
          type="number"
          value={form.pageviews}
          onChange={handleChange}
          className="input"
          placeholder="Número total de page views"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Checkouts Iniciados</label>
        <input
          name="checkouts"
          type="number"
          value={form.checkouts}
          onChange={handleChange}
          className="input"
          placeholder="Número de checkouts iniciados"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Compras Realizadas</label>
        <input
          name="purchases"
          type="number"
          value={form.purchases}
          onChange={handleChange}
          className="input"
          placeholder="Número de compras"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Investimento Total (R$)</label>
        <input
          name="adSpend"
          type="number"
          step="0.01"
          value={form.adSpend}
          onChange={handleChange}
          className="input"
          placeholder="Valor total investido"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm mb-1">Ticket Médio (R$)</label>
        <input
          name="averageOrder"
          type="number"
          step="0.01"
          value={form.averageOrder}
          onChange={handleChange}
          className="input"
          placeholder="Valor médio por compra"
        />
      </div>

      <button
        type="submit"
        className="btn-legiao col-span-full mt-4 flex justify-center"
      >
        🔍 Calcular Métricas
      </button>
    </form>
  )
}
