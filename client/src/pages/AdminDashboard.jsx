import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Package, DollarSign, TrendingUp, AlertTriangle, BarChart3, LineChart } from 'lucide-react';
import SalesChart from '../components/analytics/SalesChart';
import TopProductsWidget from '../components/analytics/TopProductsWidget';
import CategoryAnalysis from '../components/analytics/CategoryAnalysis';
import ComparisonCards from '../components/analytics/ComparisonCards';
import ExportButton from '../components/analytics/ExportButton';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Analytics data
    const [salesChartData, setSalesChartData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [comparisons, setComparisons] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    // UI state
    const [chartPeriod, setChartPeriod] = useState(7);
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        fetchStats();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        fetchSalesChart();
    }, [chartPeriod]);

    const fetchStats = async () => {
        try {
            const data = await api('/stats/admin');
            setStats(data);
        } catch (error) {
            console.error("Erreur stats admin", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesChart = async () => {
        try {
            const data = await api(`/admin/stats/sales-chart?period=${chartPeriod}`);
            setSalesChartData(data);
        } catch (error) {
            console.error("Erreur graphique ventes", error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const [products, categories, comp] = await Promise.all([
                api('/admin/stats/top-products?limit=5'),
                api('/admin/stats/by-category'),
                api('/admin/stats/comparisons')
            ]);
            setTopProducts(products);
            setCategoryData(categories);
            setComparisons(comp);
        } catch (error) {
            console.error("Erreur analytics", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-white">Chargement des statistiques...</div>;
    if (!stats) return <div className="p-10 text-red-400">Impossible de charger les statistiques.</div>;

    const cards = [
        {
            title: "Chiffre d'Affaires",
            value: `${parseFloat(stats.totalRevenue).toFixed(0)} FCFA`,
            icon: <DollarSign size={28} className="text-green-400" />,
            bg: "bg-green-500/10", border: "border-green-500/20"
        },
        {
            title: "Ventes du Jour",
            value: `${stats.salesToday.count}`,
            subtitle: `${parseFloat(stats.salesToday.total).toFixed(0)} FCFA`,
            icon: <TrendingUp size={28} className="text-blue-400" />,
            bg: "bg-blue-500/10", border: "border-blue-500/20"
        },
        {
            title: "Produits en Stock",
            value: stats.totalProducts,
            icon: <Package size={28} className="text-purple-400" />,
            bg: "bg-purple-500/10", border: "border-purple-500/20"
        },
        {
            title: "Rupture de Stock",
            value: stats.lowStockCount,
            icon: <AlertTriangle size={28} className="text-red-400" />,
            bg: "bg-red-500/10", border: "border-red-500/20",
            alert: stats.lowStockCount > 0
        },
    ];

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Dashboard Admin</h2>
                    <p className="text-ios-gray mt-1 text-sm">Pilotage de l'activité commerciale</p>
                </div>
                <ExportButton data={salesChartData} type="sales" period={`${chartPeriod}j`} />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {cards.map((card, i) => (
                    <div key={i} className={`glass-panel p-6 rounded-3xl border ${card.border} hover:scale-[1.02] transition-transform`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                {card.icon}
                            </div>
                            {card.alert && <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>}
                        </div>
                        <h3 className="text-ios-gray text-sm font-medium uppercase tracking-wide">{card.title}</h3>
                        <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                        {card.subtitle && <p className="text-sm text-ios-gray mt-1">{card.subtitle}</p>}
                    </div>
                ))}
            </div>

            {/* Comparisons */}
            <ComparisonCards data={comparisons} loading={analyticsLoading} />

            {/* Sales Chart */}
            <div className="glass-panel p-6 rounded-3xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Évolution des Ventes</h3>
                        <p className="text-ios-gray text-sm mt-1">Analyse détaillée</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Period selector */}
                        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                            {[7, 14, 30].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setChartPeriod(period)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${chartPeriod === period
                                        ? 'bg-ios-blue text-white'
                                        : 'text-ios-gray hover:text-white'
                                        }`}
                                >
                                    {period}j
                                </button>
                            ))}
                        </div>
                        {/* Chart type selector */}
                        <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => setChartType('line')}
                                className={`p-2 rounded-lg transition-all ${chartType === 'line'
                                    ? 'bg-ios-blue text-white'
                                    : 'text-ios-gray hover:text-white'
                                    }`}
                            >
                                <LineChart size={18} />
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                className={`p-2 rounded-lg transition-all ${chartType === 'bar'
                                    ? 'bg-ios-blue text-white'
                                    : 'text-ios-gray hover:text-white'
                                    }`}
                            >
                                <BarChart3 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
                <SalesChart data={salesChartData} period={chartPeriod} type={chartType} />
            </div>

            {/* Top Products & Category Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProductsWidget products={topProducts} loading={analyticsLoading} />
                <CategoryAnalysis data={categoryData} loading={analyticsLoading} />
            </div>
        </div>
    );
}
