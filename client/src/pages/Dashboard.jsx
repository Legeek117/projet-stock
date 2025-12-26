import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Package, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        productCount: 0,
        stockValue: 0,
        orderCount: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [products, orders] = await Promise.all([
                    api('/products'),
                    api('/orders')
                ]);

                const stockValue = products.reduce((acc, p) => acc + (parseFloat(p.price) * p.stock_quantity), 0);

                // Simuler une activité récente basée sur les commandes
                const recentActivity = orders.slice(0, 5).map(o => ({
                    type: 'Commande',
                    desc: `Commande #${o.id} - ${o.total_amount} €`,
                    date: new Date(o.created_at).toLocaleDateString(),
                    status: 'Complétée'
                }));

                setStats({
                    productCount: products.length,
                    stockValue: stockValue.toFixed(2),
                    orderCount: orders.length,
                    recentActivity
                });
            } catch (error) {
                console.error("Erreur chargement dashboard", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center text-white">Chargement des données...</div>;

    const cards = [
        { title: "Produits en Stock", value: stats.productCount, icon: <Package size={24} className="text-blue-400" />, change: "Articles référencés" },
        { title: "Valeur du Stock", value: `${stats.stockValue} €`, icon: <DollarSign size={24} className="text-green-400" />, change: "Valeur totale estimée" },
        { title: "Commandes", value: stats.orderCount, icon: <TrendingUp size={24} className="text-orange-400" />, change: "Historique complet" },
        { title: "État Système", value: "En Ligne", icon: <Activity size={24} className="text-purple-400" />, change: "API Connectée" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 inline-block">Tableau de Bord</h2>
                <p className="text-ios-gray mt-1">Aperçu de votre activité en temps réel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, index) => (
                    <div key={index} className="glass-panel p-6 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-gray-300`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-ios-gray text-sm font-medium">{stat.title}</h3>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="glass-panel p-8 rounded-[32px]">
                <h3 className="text-xl font-bold mb-6 text-white">Activité Récente</h3>
                <div className="space-y-4">
                    {stats.recentActivity.length > 0 ? stats.recentActivity.map((act, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                    C
                                </div>
                                <div>
                                    <p className="font-medium text-white">{act.desc}</p>
                                    <p className="text-xs text-ios-gray">{act.date}</p>
                                </div>
                            </div>
                            <span className="text-xs text-green-400 bg-green-900/30 px-3 py-1 rounded-full border border-green-500/20">
                                {act.status}
                            </span>
                        </div>
                    )) : (
                        <div className="text-ios-gray text-center py-4">Aucune activité récente</div>
                    )}
                </div>
            </div>
        </div>
    );
}
