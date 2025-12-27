import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, ShoppingBag, ArrowRight } from 'lucide-react';

export default function MySales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await api('/orders');
            setSales(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur chargement historique:', error);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Mes Ventes</h2>
                <p className="text-ios-gray mt-1">Historique de vos transactions</p>
            </div>

            <div className="glass-panel overflow-hidden rounded-[24px]">
                {loading ? <div className="p-10 text-center text-white">Chargement...</div> : (
                    sales.length === 0 ? <div className="p-10 text-center text-ios-gray">Aucune vente enregistrée.</div> :
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5 text-ios-gray text-xs uppercase">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Articles</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-ios-gray" />
                                                {new Date(sale.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {sale.item_count} produits
                                            {/* TODO: Afficher détails au survol ? */}
                                        </td>
                                        <td className="p-4 font-mono font-bold text-white">
                                            {parseFloat(sale.total_amount).toFixed(0)} FCFA
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs border ${sale.status === 'cancelled' ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-green-500 text-green-400 bg-green-500/10'}`}>
                                                {sale.status === 'cancelled' ? 'Annulée' : 'Validée'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                )}
            </div>
        </div>
    );
}
