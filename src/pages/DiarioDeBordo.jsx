// Local de Instalação: src/pages/DiarioDeBordo.jsx
// CÓDIGO COMPLETO - A VERSÃO "PLANILHA VIVA"

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LoaderCircle, CheckCircle, Save } from 'lucide-react';

// --- Componente para cada LINHA da nossa "planilha" ---
const DailyEntryRow = ({ day, data, onDataChange, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onDataChange(day, name, value === '' ? null : parseFloat(value));

        // Lógica de Auto-Save com debounce
        clearTimeout(timeoutId); // Cancela o save anterior se o utilizador continuar a digitar
        const newTimeoutId = setTimeout(() => {
            setIsSaving(true);
            onSave(day, { ...data, [name]: parseFloat(value) || 0 })
                .then(() => {
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                })
                .finally(() => setIsSaving(false));
        }, 1500); // Salva 1.5 segundos depois de o utilizador parar de digitar
        setTimeoutId(newTimeoutId);
    };

    const investment = data.investment || 0;
    const revenue = data.revenue || 0;
    const sales = data.sales || 0;

    const resultado = revenue - investment;
    const roi = investment > 0 ? (revenue / investment).toFixed(2) : '0.00';
    const cpa = sales > 0 ? (investment / sales).toFixed(2) : '0.00';

    return (
        <div className="grid grid-cols-12 gap-2 md:gap-4 items-center px-2 py-1 rounded-lg hover:bg-zinc-800/50">
            <div className="col-span-1 text-center font-bold text-zinc-400">{String(day).padStart(2, '0')}</div>
            <div className="col-span-2"><input type="number" name="investment" value={data.investment ?? ''} onChange={handleInputChange} className="input w-full text-center bg-zinc-800 border-zinc-700" placeholder="-" /></div>
            <div className="col-span-2"><input type="number" name="revenue" value={data.revenue ?? ''} onChange={handleInputChange} className="input w-full text-center bg-zinc-800 border-zinc-700" placeholder="-" /></div>
            <div className="col-span-1"><input type="number" name="sales" value={data.sales ?? ''} onChange={handleInputChange} className="input w-full text-center bg-zinc-800 border-zinc-700" placeholder="-" /></div>
            <div className={`col-span-2 text-center font-bold ${resultado >= 0 ? 'text-green-400' : 'text-red-400'}`}>{resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="col-span-2 text-center font-semibold">{roi}</div>
            <div className="col-span-1 text-center font-semibold">{parseFloat(cpa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            <div className="col-span-1 text-center h-full flex items-center justify-center">
                {isSaving && <LoaderCircle className="animate-spin text-blue-500" size={16} />}
                {isSaved && !isSaving && <CheckCircle className="text-green-500" size={16} />}
            </div>
        </div>
    );
};

export default function DiarioDeBordo() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState({});

  const selectedMonth = currentDate.getMonth() + 1;
  const selectedYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('products').select('*').eq('user_id', user.id).order('name');
      if (error) {
        toast.error("Erro ao carregar produtos.");
      } else if (data && data.length > 0) {
        setAllProducts(data);
        setSelectedProduct(data[0].id);
      } else {
        setLoading(false); // Não há produtos, então podemos parar de carregar
      }
    };
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedProduct) {
        setLoading(false); // Garante que o loading para se não houver produto
        return;
    }

    const fetchMonthlyData = async () => {
      setLoading(true);
      const firstDay = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const lastDayOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('product_id', selectedProduct)
        .gte('entry_date', firstDay)
        .lte('entry_date', lastDayOfMonth);

      if (error) {
        toast.error("Erro ao carregar dados do mês.");
        setMonthlyData({});
      } else {
        const dataMap = data.reduce((acc, item) => {
          const day = new Date(item.entry_date).getUTCDate();
          acc[day] = item;
          return acc;
        }, {});
        setMonthlyData(dataMap);
      }
      setLoading(false);
    };
    fetchMonthlyData();
  }, [selectedProduct, selectedMonth, selectedYear]);

  const handleDataChange = (day, field, value) => {
    setMonthlyData(prev => {
        const dayData = prev[day] || {};
        return {
            ...prev,
            [day]: { ...dayData, [field]: value }
        };
    });
  };

  const handleSave = async (day, dataToSave) => {
    const payload = {
        user_id: user.id,
        product_id: selectedProduct,
        entry_date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        investment: dataToSave.investment || 0,
        revenue: dataToSave.revenue || 0,
        sales: dataToSave.sales || null,
    };
    const { error } = await supabase.from('daily_metrics').upsert(payload, { onConflict: 'user_id, product_id, entry_date' });
    if (error) toast.error("Falha ao salvar.");
  };

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const months = Array.from({length: 12}, (e, i) => new Date(null, i + 1, null).toLocaleDateString("pt-BR", {month: "long"}));
  const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

  return (
    <div className="text-white px-4 py-10">
      <PageHeader title="Diário de Bordo" description="Registe o seu desempenho diário com a facilidade de uma planilha e o poder de uma aplicação." />

      <div className="w-full max-w-7xl mx-auto mt-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-700">
            <div className="flex flex-col md:flex-row gap-4 w-full">
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input w-full md:w-auto md:min-w-[200px] flex-1">
                    {allProducts.length === 0 && <option>Nenhum produto cadastrado</option>}
                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={selectedMonth} onChange={e => setCurrentDate(new Date(selectedYear, e.target.value - 1))} className="input w-full md:w-auto">
                    {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                 <select value={selectedYear} onChange={e => setCurrentDate(new Date(e.target.value, selectedMonth - 1))} className="input w-full md:w-auto">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-2 md:p-4">
            <div className="hidden md:grid grid-cols-12 gap-4 items-center text-center text-xs text-zinc-400 font-bold uppercase pb-2 border-b border-zinc-700 px-2">
                <div className="col-span-1">Dia</div>
                <div className="col-span-2">Investimento</div>
                <div className="col-span-2">Faturamento</div>
                <div className="col-span-1">Vendas</div>
                <div className="col-span-2">Resultado</div>
                <div className="col-span-2">ROI</div>
                <div className="col-span-1">CPA</div>
                <div className="col-span-1">Status</div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><LoaderCircle className="animate-spin" /></div>
            ) : !selectedProduct ? (
                <div className="text-center py-10 text-zinc-500">
                    <p>Por favor, adicione um produto para começar.</p>
                    {/* Botão para adicionar produto pode ser adicionado aqui */}
                </div>
            ) : (
                <div className="space-y-1 mt-2">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <DailyEntryRow
                            key={`${selectedProduct}-${day}`}
                            day={day}
                            data={monthlyData[day] || {}}
                            onDataChange={handleDataChange}
                            onSave={handleSave}
                        />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}