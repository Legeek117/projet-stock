import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DollarSign, ShoppingBag, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await api('/stats/user');
                setStats(data);
            } catch (error) {
                console.error("Erreur stats user", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div>Chargement...</div>;
    if (!stats || !stats.salesToday) return <div className="text-red-400">Erreur de chargement ou aucune donnée disponible.</div>;

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Mon Espace Vendeur</h2>
                    <p className="text-ios-gray mt-1 text-sm">Vos performances du moment</p>
                </div>
                <Link to="/pos" className="w-full sm:w-auto bg-ios-blue hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(10,132,255,0.4)] transition-all transform hover:scale-105">
                    <PlusCircle size={20} />
                    Nouvelle Vente
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="glass-panel p-8 rounded-[32px] border border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                    <h3 className="text-green-300 font-medium uppercase tracking-wider text-sm mb-2">Ventes du Jour</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">{stats.salesToday.count}</span>
                        <span className="text-xl text-green-400">ventes</span>
                    </div>
                    <div className="mt-4 text-2xl font-mono text-white/80">
                        {parseFloat(stats.salesToday.total || 0).toLocaleString()} FCFA
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[32px]">
                    <h3 className="text-ios-gray font-medium uppercase tracking-wider text-sm mb-2">Cette Semaine</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">{stats.salesWeek.count}</span>
                        <span className="text-xl text-ios-gray">ventes</span>
                    </div>
                    <div className="mt-4 text-2xl font-mono text-white/50">
                        {parseFloat(stats.salesWeek.total || 0).toLocaleString()} FCFA
                    </div>
                </div>
            </div>
        </div>
    );
}
