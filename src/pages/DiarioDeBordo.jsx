// Local de Instalação: src/pages/DiarioDeBordo.jsx
// CÓDIGO FINAL COM SISTEMA DE ANOTAÇÕES

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
    LoaderCircle, 
    CheckCircle, 
    DollarSign, 
    BarChart, 
    ShoppingCart, 
    TrendingUp, 
    Percent, 
    Target,
    Pencil,
    X
} from 'lucide-react';
import GerirProdutosModal from '../components/GerirProdutosModal';

// --- MODAL DE NOTAS ---
const NotesModal = ({ isOpen, onClose, dayData, onSave, day }) => {
    if (!isOpen) return null;
    
    const [note, setNote] = useState(dayData?.notes || '');
    const [timeoutId, setTimeoutId] = useState(null);

    const handleNoteChange = (e) => {
        const newNote = e.target.value;
        setNote(newNote);

        clearTimeout(timeoutId);
        const newTimeoutId = setTimeout(() => {
            onSave(day, { ...dayData, notes: newNote });
        }, 1000); // Salva 1 segundo após parar de digitar
        setTimeoutId(newTimeoutId);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
                <h3 className="text-xl font-bold text-gradient mb-4">Anotações do Dia {String(day).padStart(2, '0')}</h3>
                 <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
                    <X size={24} />
                </button>
                <textarea
                    value={note}
                    onChange={handleNoteChange}
                    placeholder="Cole aqui os dados da sua campanha ou anote o que foi feito no dia..."
                    className="input w-full min-h-[300px] resize-y text-sm"
                />
            </div>
        </div>
    );
};


const DailyEntryRow = ({ day, data, onDataChange, onSave, onOpenNotes }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onDataChange(day, name, value === '' ? null : parseFloat(value));

        clearTimeout(timeoutId);
        const newTimeoutId = setTimeout(() => {
            setIsSaving(true);
            onSave(day, { ...data, [name]: parseFloat(value) || 0 })
                .then(() => {
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 2000);
                })
                .finally(() => setIsSaving(false));
        }, 1500);
        setTimeoutId(newTimeoutId);
    };

    const investment = data.investment || 0;
    const revenue = data.revenue || 0;
    const sales = data.sales || 0;
    const resultado = revenue - investment;
    const roi = investment > 0 ? (revenue / investment).toFixed(2) : '0.00';
    const cpa = sales > 0 ? (investment / sales).toFixed(2) : '0.00';
    const hasNote = data.notes && data.notes.trim() !== '';


    return (
        <div className="bg-zinc-800/30 rounded-xl p-3 md:bg-transparent md:p-0 md:rounded-none">
            {/* --- Mobile Layout --- */}
            <div className="md:hidden">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg text-white">Dia {String(day).padStart(2, '0')}</span>
                    <div className="flex items-center gap-3">
                         <button onClick={() => onOpenNotes(day)} className={`transition-colors ${hasNote ? 'text-legiao-blue' : 'text-zinc-500 hover:text-white'}`}>
                            <Pencil size={18} />
                        </button>
                        {isSaving && <LoaderCircle className="animate-spin text-blue-500" size={20} />}
                        {isSaved && !isSaving && <CheckCircle className="text-green-500" size={20} />}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs text-zinc-400">Invest.</label>
                        <input type="number" name="investment" value={data.investment ?? ''} onChange={handleInputChange} className="input w-full text-center p-2 text-sm" placeholder="-" />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-400">Fatur.</label>
                        <input type="number" name="revenue" value={data.revenue ?? ''} onChange={handleInputChange} className="input w-full text-center p-2 text-sm" placeholder="-" />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-400">Vendas</label>
                        <input type="number" name="sales" value={data.sales ?? ''} onChange={handleInputChange} className="input w-full text-center p-2 text-sm" placeholder="-" />
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-700 grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="text-xs text-zinc-400">Resultado</p>
                        <p className={`font-bold text-sm ${resultado >= 0 ? 'text-green-400' : 'text-red-400'}`}>{resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400">ROI</p>
                        <p className="font-bold text-sm">{roi}</p>
                    </div>
                     <div>
                        <p className="text-xs text-zinc-400">CPA</p>
                        <p className="font-bold text-sm">{parseFloat(cpa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                </div>
            </div>

            {/* --- Desktop Layout --- */}
            <div className="hidden md:grid grid-cols-12 gap-2 md:gap-4 items-center md:px-2 md:py-1 md:hover:bg-zinc-800/50 md:rounded-lg">
                <div className="col-span-1 text-center font-bold text-zinc-400">{String(day).padStart(2, '0')}</div>
                <div className="col-span-2"><input type="number" name="investment" value={data.investment ?? ''} onChange={handleInputChange} className="input w-full text-center bg-zinc-800 border-zinc-700" placeholder="-" /></div>
                <div className="col-span-2"><input type="number" name="revenue" value={data.revenue ?? ''} onChange={handleInputChange} className="input w-full text-center bg-zinc-800 border-zinc-700" placeholder="-" /></div>
                <div className="col-span-1"><input type="number" name="sales" value={data.sales ?? ''} onChange={handleInputChange} className="input w-full text-center bg-zinc-800 border-zinc-700" placeholder="-" /></div>
                <div className={`col-span-2 text-center font-bold ${resultado >= 0 ? 'text-green-400' : 'text-red-400'}`}>{resultado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div className="col-span-2 text-center font-semibold">{roi}</div>
                <div className="col-span-1 text-center font-semibold">{parseFloat(cpa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div className="col-span-1 text-center h-full flex items-center justify-center gap-3">
                    <button onClick={() => onOpenNotes(day)} className={`transition-colors ${hasNote ? 'text-legiao-blue' : 'text-zinc-500 hover:text-white'}`}>
                        <Pencil size={16} />
                    </button>
                    {isSaving && <LoaderCircle className="animate-spin text-blue-500" size={16} />}
                    {isSaved && !isSaving && <CheckCircle className="text-green-500" size={16} />}
                </div>
            </div>
        </div>
    );
};


const MetricCard = ({ icon: Icon, label, value, colorClass = 'text-white' }) => (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-lg hover:bg-zinc-800 transition-colors duration-300">
        <div className="flex items-center text-zinc-400 text-sm gap-2">
            <Icon size={16} />
            <span>{label}</span>
        </div>
        <p className={`text-2xl lg:text-3xl font-bold mt-1 break-words ${colorClass}`}>{value}</p>
    </div>
);


export default function DiarioDeBordo() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState({});
  const [isGerirProdutosModalOpen, setIsGerirProdutosModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedDayForNotes, setSelectedDayForNotes] = useState(null);

  const selectedMonth = currentDate.getMonth() + 1;
  const selectedYear = currentDate.getFullYear();
  
  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').eq('user_id', user.id).order('name');
    
    if (error) {
      toast.error("Erro ao carregar produtos.");
    } else {
      setAllProducts(data || []);
      if (data && data.length > 0 && !data.some(p => p.id === selectedProduct)) {
        setSelectedProduct(data[0].id);
      } else if (data.length === 0) {
        setSelectedProduct('');
      }
    }
    setLoading(false);
  }, [user, selectedProduct]);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedProduct) {
      setMonthlyData({});
      return;
    }
    const fetchMonthlyData = async () => {
      setLoading(true);
      const firstDay = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
      const lastDayOfMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const { data, error } = await supabase.from('daily_metrics').select('*').eq('product_id', selectedProduct).gte('entry_date', firstDay).lte('entry_date', lastDayOfMonth);
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
  }, [selectedProduct, selectedMonth, selectedYear, user]);
  
  const totals = useMemo(() => {
    const filledDays = Object.values(monthlyData).filter(d => d.investment || d.revenue || d.sales);
    if (filledDays.length === 0) return { totalInvestment: 0, totalRevenue: 0, totalSales: 0, totalResult: 0, averageRoi: '0.00', averageCpa: '0.00' };
    const totalInvestment = filledDays.reduce((sum, data) => sum + (data.investment || 0), 0);
    const totalRevenue = filledDays.reduce((sum, data) => sum + (data.revenue || 0), 0);
    const totalSales = filledDays.reduce((sum, data) => sum + (data.sales || 0), 0);
    const totalResult = totalRevenue - totalInvestment;
    const averageRoi = totalInvestment > 0 ? (totalRevenue / totalInvestment).toFixed(2) : '0.00';
    const averageCpa = totalSales > 0 ? (totalInvestment / totalSales).toFixed(2) : '0.00';
    return { totalInvestment, totalRevenue, totalSales, totalResult, averageRoi, averageCpa };
  }, [monthlyData]);

  const handleDataChange = (day, field, value) => {
    setMonthlyData(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [field]: value } }));
  };

  const handleSave = async (day, dataToSave) => {
    const payload = {
        user_id: user.id,
        product_id: selectedProduct,
        entry_date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        investment: dataToSave.investment || 0,
        revenue: dataToSave.revenue || 0,
        sales: dataToSave.sales || null,
        notes: dataToSave.notes,
    };
    const { error } = await supabase.from('daily_metrics').upsert(payload, { onConflict: 'user_id, product_id, entry_date' });
    if (error) toast.error(`Falha ao salvar: ${error.message}`);
  };

  const openNotesModal = (day) => {
    setSelectedDayForNotes(day);
    setIsNotesModalOpen(true);
  }

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const months = Array.from({length: 12}, (e, i) => new Date(null, i + 1, null).toLocaleDateString("pt-BR", {month: "long"}));
  const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

  return (
    <div className="text-white px-4 py-10">
      <PageHeader title="Diário de Bordo" description="Registe o seu desempenho diário com a facilidade de uma planilha e o poder de uma aplicação." />

      <div className="w-full max-w-7xl mx-auto mt-8">
        
        {!loading && allProducts.length > 0 && (
          <div className="mb-10 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="md:col-span-3 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 flex flex-col justify-center text-center shadow-2xl shadow-legiao-blue/10">
                      <span className="text-sm font-semibold text-zinc-400">RESULTADO DO MÊS</span>
                      <p className={`text-5xl md:text-6xl font-black tracking-tighter my-2 ${totals.totalResult >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                          {totals.totalResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <div className="flex justify-center items-center gap-2 text-legiao-blue">
                          <TrendingUp size={18} />
                          <span className="font-bold">Performance</span>
                      </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 gap-6">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                              <span className="text-sm text-zinc-400 flex items-center gap-2"><Percent size={16}/> ROI Médio</span>
                              <p className="text-3xl font-bold text-white mt-1">{totals.averageRoi}</p>
                          </div>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                              <span className="text-sm text-zinc-400 flex items-center gap-2"><Target size={16}/> CPA Médio</span>
                              <p className="text-3xl font-bold text-white mt-1">
                                  {parseFloat(totals.averageCpa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <MetricCard icon={DollarSign} label="Investimento Total" value={totals.totalInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  <MetricCard icon={BarChart} label="Faturamento Total" value={totals.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                  <MetricCard icon={ShoppingCart} label="Total de Vendas" value={totals.totalSales} />
              </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-700">
            <div className="flex flex-col md:flex-row gap-4 w-full">
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="input w-full md:w-auto md:min-w-[200px] flex-1">
                    {allProducts.length === 0 && <option>Nenhum produto</option>}
                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={() => setIsGerirProdutosModalOpen(true)} className="btn-legiao py-2 px-4 whitespace-nowrap">
                  Gerir Produtos
                </button>
                <select value={selectedMonth} onChange={e => setCurrentDate(new Date(selectedYear, e.target.value - 1, 1))} className="input w-full md:w-auto">
                    {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
                 <select value={selectedYear} onChange={e => setCurrentDate(new Date(e.target.value, selectedMonth - 1, 1))} className="input w-full md:w-auto">
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
                <div className="col-span-1">Ações</div>
            </div>

            <div className="space-y-3 md:space-y-1 mt-2">
                {loading ? (
                    <div className="flex items-center justify-center h-64"><LoaderCircle className="animate-spin" /></div>
                ) : allProducts.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">
                        <p>Nenhum produto cadastrado.</p>
                        <button onClick={() => setIsGerirProdutosModalOpen(true)} className="mt-4 text-sm text-cyan-400 hover:underline">Clique aqui para adicionar seu primeiro produto</button>
                    </div>
                ) : (
                    Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <DailyEntryRow key={`${selectedProduct}-${day}`} day={day} data={monthlyData[day] || {}} onDataChange={handleDataChange} onSave={handleSave} onOpenNotes={openNotesModal} />
                    ))
                )}
            </div>
            
            {!loading && allProducts.length > 0 && (
                <div className="p-3 mt-4 border-t-2 border-zinc-600 font-bold text-sm">
                    {/* --- Mobile Totals --- */}
                    <div className="md:hidden space-y-2">
                        <h3 className="text-lg text-center text-legiao-blue font-bold mb-3">Resumo Total do Mês</h3>
                        <div className="flex justify-between items-center text-base"><span>Resultado:</span> <span className={`font-black ${totals.totalResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totals.totalResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pt-2 border-t border-zinc-700">
                            <div className="flex justify-between"><span>Investimento:</span> <span>{totals.totalInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            <div className="flex justify-between"><span>ROI Médio:</span> <span>{totals.averageRoi}</span></div>
                            <div className="flex justify-between"><span>Faturamento:</span> <span>{totals.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            <div className="flex justify-between"><span>CPA Médio:</span> <span>{parseFloat(totals.averageCpa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                            <div className="flex justify-between col-span-2"><span>Vendas:</span> <span>{totals.totalSales}</span></div>
                        </div>
                    </div>

                    {/* --- Desktop Totals --- */}
                    <div className="hidden md:grid grid-cols-12 gap-2 md:gap-4 items-center">
                        <div className="col-span-1 text-center text-zinc-300">Total</div>
                        <div className="col-span-2 text-center text-white">{totals.totalInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div className="col-span-2 text-center text-white">{totals.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div className="col-span-1 text-center text-white">{totals.totalSales}</div>
                        <div className={`col-span-2 text-center ${totals.totalResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>{totals.totalResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div className="col-span-2 text-center text-white">{totals.averageRoi}</div>
                        <div className="col-span-1 text-center text-white">{parseFloat(totals.averageCpa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                        <div className="col-span-1"></div>
                    </div>
                </div>
            )}
        </div>
      </div>
      
      <GerirProdutosModal isOpen={isGerirProdutosModalOpen} onClose={() => setIsGerirProdutosModalOpen(false)} products={allProducts} onProductsUpdate={fetchProducts} />
      <NotesModal 
        isOpen={isNotesModalOpen} 
        onClose={() => setIsNotesModalOpen(false)} 
        day={selectedDayForNotes}
        dayData={monthlyData[selectedDayForNotes]}
        onSave={handleSave}
      />
    </div>
  );
}