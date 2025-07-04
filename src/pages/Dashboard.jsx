// Local de Instalação: src/pages/Dashboard.jsx
// CÓDIGO FINAL E ATUALIZADO COM GRÁFICO DE VENDAS POR PRODUTO (TOP 5) COM DESIGN MELHORADO

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Calendar as CalendarIcon, ShoppingCart, ChevronDown, DollarSign, BarChart, TrendingUp, Percent, Target } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Importações do Chart.js
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Registro dos componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

// Componente reutilizável para exibir uma métrica chave
const MetricCard = ({ icon: Icon, label, value, colorClass = 'text-white' }) => (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-lg hover:bg-zinc-800 transition-colors duration-300">
        <div className="flex items-center text-zinc-400 text-sm gap-2">
            <Icon size={16} />
            <span>{label}</span>
        </div>
        <p className={`text-2xl lg:text-3xl font-bold mt-1 break-words ${colorClass}`}>{value}</p>
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [periodOption, setPeriodOption] = useState('this_month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dailyMetrics, setDailyMetrics] = useState([]);

    const formatDate = (date) => date.toISOString().split('T')[0];

    useEffect(() => {
        const today = new Date();
        let newStartDate = '';
        let newEndDate = formatDate(today);

        switch (periodOption) {
            case 'today':
                newStartDate = formatDate(today);
                break;
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                newStartDate = formatDate(yesterday);
                newEndDate = formatDate(yesterday);
                break;
            case 'last_7_days':
                const last7Days = new Date(today);
                last7Days.setDate(today.getDate() - 6);
                newStartDate = formatDate(last7Days);
                break;
            case 'this_month':
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                newStartDate = formatDate(firstDayOfMonth);
                break;
            case 'last_month':
                const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                newStartDate = formatDate(firstDayOfLastMonth);
                newEndDate = formatDate(lastDayOfLastMonth);
                break;
            case 'custom':
                if (!startDate && !endDate) {
                    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    newStartDate = formatDate(defaultStartDate);
                    newEndDate = formatDate(today);
                } else {
                    newStartDate = startDate;
                    newEndDate = endDate;
                }
                break;
            case 'all_time':
                newStartDate = '2000-01-01';
                break;
            default:
                newStartDate = '2000-01-01';
                break;
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
    }, [periodOption]);

    const fetchProducts = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase.from('products').select('*').eq('user_id', user.id).order('name');
        if (error) {
            toast.error("Erro ao carregar produtos.");
        } else {
            setAllProducts(data || []);
            if (data.length > 0 && (!selectedProduct || !data.some(p => p.id === selectedProduct))) {
                setSelectedProduct(data[0].id);
            } else if (data.length === 0) {
                setSelectedProduct('');
            }
        }
    }, [user, selectedProduct]);

    const fetchDailyMetrics = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let query = supabase.from('daily_metrics').select('*').eq('user_id', user.id);

            if (selectedProduct && selectedProduct !== 'all') {
                query = query.eq('product_id', selectedProduct);
            }

            if (startDate) {
                query = query.gte('entry_date', startDate);
            }
            if (endDate) {
                query = query.lte('entry_date', endDate);
            }
            
            const { data, error } = await query.order('entry_date', { ascending: true });

            if (error) throw error;
            setDailyMetrics(data || []);
        } catch (err) {
            console.error("Erro ao buscar métricas diárias:", err);
            toast.error("Erro ao carregar métricas do diário.");
            setDailyMetrics([]);
        } finally {
            setLoading(false);
        }
    }, [user, selectedProduct, startDate, endDate]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchDailyMetrics();
    }, [fetchDailyMetrics]);

    const totals = useMemo(() => {
        const totalInvestment = dailyMetrics.reduce((sum, data) => sum + (data.investment || 0), 0);
        const totalRevenue = dailyMetrics.reduce((sum, data) => sum + (data.revenue || 0), 0);
        const totalSales = dailyMetrics.reduce((sum, data) => sum + (data.sales || 0), 0);
        const totalResult = totalRevenue - totalInvestment;
        const averageRoi = totalInvestment > 0 ? (totalRevenue / totalInvestment).toFixed(2) : '0.00';
        const averageCpa = totalSales > 0 ? (totalInvestment / totalSales).toFixed(2) : '0.00';
        const profitPercentage = totalRevenue > 0 ? ((totalResult / totalRevenue) * 100).toFixed(2) : '0.00';

        return {
            totalInvestment,
            totalRevenue,
            totalSales,
            totalResult,
            averageRoi,
            averageCpa,
            profitPercentage,
        };
    }, [dailyMetrics]);

    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Dados e opções para o gráfico de Performance ao Longo do Tempo
    const performanceChartData = useMemo(() => {
        const dates = dailyMetrics.map(metric => new Date(metric.entry_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        const investments = dailyMetrics.map(metric => metric.investment || 0);
        const revenues = dailyMetrics.map(metric => metric.revenue || 0);

        return {
            labels: dates,
            datasets: [
                {
                    label: 'Faturamento',
                    data: revenues,
                    borderColor: '#008CFF', // Azul Legião
                    backgroundColor: 'rgba(0, 140, 255, 0.2)',
                    fill: false,
                    tension: 0.3,
                },
                {
                    label: 'Gastos',
                    data: investments,
                    borderColor: '#ED195C', // Rosa Legião
                    backgroundColor: 'rgba(237, 25, 92, 0.2)',
                    fill: false,
                    tension: 0.3,
                },
            ],
        };
    }, [dailyMetrics]);

    const performanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#a1a1aa',
                },
            },
            tooltip: {
                backgroundColor: '#1f1f23',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) { label += formatCurrency(context.parsed.y); }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Data',
                    color: '#d4d4d8',
                },
                ticks: {
                    color: '#a1a1aa',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Valor (R$)',
                    color: '#d4d4d8',
                },
                ticks: {
                    color: '#a1a1aa',
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    // Dados e opções para o gráfico de Vendas por Dia da Semana
    const salesByDayOfWeekChartData = useMemo(() => {
        const salesByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0: Dom, 1: Seg, ..., 6: Sáb
        dailyMetrics.forEach(metric => {
            const date = new Date(metric.entry_date);
            const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
            salesByDay[dayOfWeek] += (metric.sales || 0);
        });

        const labels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const data = labels.map((_, index) => salesByDay[index]);

        return {
            labels: labels,
            datasets: [{
                label: 'Total de Vendas',
                data: data,
                backgroundColor: '#008CFF', // Azul Legião
                borderColor: '#008CFF',
                borderWidth: 1,
            }],
        };
    }, [dailyMetrics]);

    const salesByDayOfWeekChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1f1f23',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) { label += context.parsed.y; }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Dia da Semana',
                    color: '#d4d4d8',
                },
                ticks: {
                    color: '#a1a1aa',
                },
                grid: {
                    display: false,
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Vendas',
                    color: '#d4d4d8',
                },
                ticks: {
                    color: '#a1a1aa',
                    precision: 0,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
    };

    // Dados e opções para o gráfico de Vendas por Produto (Top 5)
    const salesByProductChartData = useMemo(() => {
        const productSalesMap = new Map();
        dailyMetrics.forEach(metric => {
            const productId = metric.product_id;
            const sales = metric.sales || 0;
            const currentSales = productSalesMap.get(productId) || 0;
            productSalesMap.set(productId, currentSales + sales);
        });

        const sortedProducts = Array.from(productSalesMap.entries())
            .sort(([, salesA], [, salesB]) => salesB - salesA)
            .slice(0, 5);

        const labels = sortedProducts.map(([productId]) => {
            const product = allProducts.find(p => p.id === productId);
            return product ? product.name : 'Produto Desconhecido';
        });
        const data = sortedProducts.map(([, sales]) => sales);

        return {
            labels: labels,
            datasets: [{
                label: 'Total de Vendas',
                data: data,
                backgroundColor: [
                    '#ED195C', // Rosa Legião
                    '#008CFF', // Azul Legião
                    '#16A34A', // Verde
                    '#FFD700', // Amarelo/Dourado
                    '#8A2BE2'  // Azul Violeta
                ],
                borderColor: [
                    '#ED195C',
                    '#008CFF',
                    '#16A34A',
                    '#FFD700',
                    '#8A2BE2'
                ],
                borderWidth: 1,
            }],
        };
    }, [dailyMetrics, allProducts]);

    const salesByProductChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1f1f23',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) { label += `Vendas: ${context.parsed.y}`; }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Produto',
                    color: '#d4d4d8',
                },
                ticks: {
                    color: '#a1a1aa',
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 0,
                },
                grid: {
                    display: false, // Remover linhas de grade verticais
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Vendas',
                    color: '#d4d4d8',
                },
                ticks: {
                    color: '#a1a1aa',
                    precision: 0,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', // Manter linhas de grade horizontais sutis
                },
            },
        },
        // Ajustes para a largura da barra
        barPercentage: 0.7, // Controla a largura das barras em relação ao espaço da categoria (0.9 é padrão)
        categoryPercentage: 0.8, // Controla a largura da categoria em relação ao espaço disponível (0.8 é padrão)
        
        // Cantos arredondados
        borderRadius: 8, // Valor em pixels para arredondar os cantos das barras
    };

    return (
        <div className="text-white px-4 py-10">
            <PageHeader title="Resumo de Performance" description="Sua central de inteligência para análise de dados e tomada de decisão estratégica." />

            <div className="w-full max-w-7xl mx-auto mt-8 space-y-8">
                {/* --- SEÇÃO DE FILTROS --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Dropdown de Período de Visualização */}
                    <select
                        value={periodOption}
                        onChange={(e) => setPeriodOption(e.target.value)}
                        className="input flex-1 w-full md:w-auto text-left flex items-center justify-between"
                    >
                        <option value="today">Hoje</option>
                        <option value="yesterday">Ontem</option>
                        <option value="last_7_days">Últimos 7 dias</option>
                        <option value="this_month">Esse mês</option>
                        <option value="last_month">Mês passado</option>
                        <option value="all_time">Máximo</option>
                        <option value="custom">Personalizado</option>
                    </select>

                    {/* Inputs de data visíveis apenas se 'Personalizado' for selecionado */}
                    {periodOption === 'custom' && (
                        <div className="flex flex-1 w-full gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input flex-1 bg-transparent text-white outline-none cursor-pointer"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input flex-1 bg-transparent text-white outline-none cursor-pointer"
                            />
                        </div>
                    )}
                    
                    {/* Dropdown de Produtos */}
                    <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        className="input flex-1 w-full md:w-auto text-left flex items-center justify-between"
                    >
                        <option value="all">Todos os Produtos</option>
                        {allProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                
                {/* --- SEÇÃO DE KPIs --- */}
                {loading ? (
                    <div className="text-center py-10 text-zinc-500">Carregando dados...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        <MetricCard 
                            icon={BarChart} 
                            label="Faturamento Total" 
                            value={formatCurrency(totals.totalRevenue)} 
                        />
                        <MetricCard 
                            icon={DollarSign} 
                            label="Gastos com Anúncios" 
                            value={formatCurrency(totals.totalInvestment)} 
                        />
                        <MetricCard 
                            icon={TrendingUp} 
                            label="Lucro Total" 
                            value={formatCurrency(totals.totalResult)} 
                            colorClass={totals.totalResult >= 0 ? 'text-green-400' : 'text-red-400'}
                        />
                        <MetricCard 
                            icon={Percent} 
                            label="ROAS Total" 
                            value={totals.averageRoi} 
                            colorClass={parseFloat(totals.averageRoi) >= 1 ? 'text-green-400' : 'text-red-400'}
                        />
                        <MetricCard 
                            icon={Target} 
                            label="CPA Médio" 
                            value={formatCurrency(parseFloat(totals.averageCpa))} 
                        />
                        <MetricCard 
                            icon={ShoppingCart} 
                            label="Total de Vendas" 
                            value={totals.totalSales} 
                        />
                    </div>
                )}
                
                {/* --- SEÇÃO DE GRÁFICOS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Performance ao Longo do Tempo */}
                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Performance ao Longo do Tempo</h3>
                        <div className="h-80 flex items-center justify-center text-zinc-500 bg-zinc-800 rounded-lg">
                            {loading ? (
                                "Carregando gráfico..."
                            ) : (
                                <Line data={performanceChartData} options={performanceChartOptions} />
                            )}
                        </div>
                    </div>

                    {/* Gráfico de Vendas por Produto (Top 5) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Vendas por Produto (Top 5)</h3>
                         <div className="h-64 flex items-center justify-center text-zinc-500 bg-zinc-800 rounded-lg">
                            {loading ? (
                                "Carregando gráfico..."
                            ) : (
                                <Bar data={salesByProductChartData} options={salesByProductChartOptions} />
                            )}
                         </div>
                    </div>
                </div>

                {/* Gráficos Removidos: Funil de Conversão (Removido) e Vendas por Dia da Semana */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Placeholder para Funil de Conversão (Resumo) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Funil de Conversão (Resumo)</h3>
                        <div className="h-64 flex items-center justify-center text-zinc-500 bg-zinc-800 rounded-lg">
                             {loading ? "Carregando funil..." : "O funil de conversão não está disponível nesta versão simplificada."}
                        </div>
                    </div>
                    {/* Gráfico de Vendas por Dia da Semana */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Vendas por Dia da Semana</h3>
                        <div className="h-64 flex items-center justify-center text-zinc-500 bg-zinc-800 rounded-lg">
                             {loading ? (
                                "Carregando vendas por dia..."
                            ) : (
                                <Bar data={salesByDayOfWeekChartData} options={salesByDayOfWeekChartOptions} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}