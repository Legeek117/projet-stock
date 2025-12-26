import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Package, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await api('/stats/admin');
                setStats(data);
            } catch (error) {
                console.error("Erreur stats admin", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-white">Chargement des statistiques...</div>;
    if (!stats) return <div className="p-10 text-red-400">Impossible de charger les statistiques.</div>;

    const cards = [
        {
            title: "Chiffre d'Affaires",
            value: `${parseFloat(stats.totalRevenue).toLocaleString()} €`,
            icon: <DollarSign size={28} className="text-green-400" />,
            bg: "bg-green-500/10", border: "border-green-500/20"
        },
        {
            title: "Ventes du Jour",
            value: `${stats.salesToday.count} (${parseFloat(stats.salesToday.total).toLocaleString()} €)`,
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
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Vue d'ensemble Admin</h2>
                <p className="text-ios-gray mt-1">Pilotage de l'activité commerciale</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart Placeholder (Simple Bar Visualisation) */}
                <div className="glass-panel p-8 rounded-[32px]">
                    <h3 className="text-xl font-bold text-white mb-6">Ventes des 7 derniers jours</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {stats.salesChart.length > 0 ? stats.salesChart.map((day, i) => {
                            const maxVal = Math.max(...stats.salesChart.map(s => parseFloat(s.total) || 0), 100);
                            const height = (parseFloat(day.total) / maxVal) * 100;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                    <div className="w-full bg-blue-500/20 rounded-t-lg relative group-hover:bg-blue-500 transition-colors" style={{ height: `${height}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {day.total}€
                                        </div>
                                    </div>
                                    <div className="text-xs text-ios-gray rotate-45 mt-2 origin-left">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                                </div>
                            );
                        }) : <div className="text-ios-gray w-full text-center self-center">Pas assez de données</div>}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[32px] flex items-center justify-center border-dashed border-2 border-white/10">
                    <div className="text-center">
                        <p className="text-ios-gray mb-4">Espace pour Top Produits / Meilleurs Vendeurs</p>
                        <button className="text-ios-blue text-sm hover:underline">Configurer le widget</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
