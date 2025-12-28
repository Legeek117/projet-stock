import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, Search, Filter, History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StockMovements() {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchMovements();
    }, []);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const data = await api('/stock/movements?limit=100');
            setMovements(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur mouvements stock", error);
            setMovements([]);
        } finally {
            setLoading(false);
        }
    };

    const getTypeDetails = (type) => {
        switch (type) {
            case 'in': return { label: 'Entrée', color: 'text-green-400', bg: 'bg-green-500/10', icon: ArrowDownLeft };
            case 'out': return { label: 'Sortie', color: 'text-red-400', bg: 'bg-red-500/10', icon: ArrowUpRight };
            case 'sale': return { label: 'Vente', color: 'text-ios-blue', bg: 'bg-ios-blue/10', icon: ArrowUpRight };
            case 'return': return { label: 'Retour', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: ArrowDownLeft };
            case 'loss': return { label: 'Perte', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: ArrowUpRight };
            case 'adjustment_in': return { label: 'Ajust. (+)', color: 'text-green-400', bg: 'bg-green-500/10', icon: RefreshCcw };
            case 'adjustment_out': return { label: 'Ajust. (-)', color: 'text-red-400', bg: 'bg-red-500/10', icon: RefreshCcw };
            default: return { label: type, color: 'text-ios-gray', bg: 'bg-white/5', icon: History };
        }
    };

    const filteredMovements = (Array.isArray(movements) ? movements : []).filter(m => {
        const matchesSearch = (m.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.reason && m.reason.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = typeFilter === 'all' || m.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Flux de Stock</h2>
                    <p className="text-ios-gray mt-1 text-sm">Gestion et traçabilité des articles</p>
                </div>
                <button
                    onClick={fetchMovements}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                    <RefreshCcw size={20} className={`text-ios-blue ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit ou motif..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-ios-blue transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <Filter className="text-ios-gray shrink-0" size={18} />
                    {[
                        { id: 'all', label: 'Tout' },
                        { id: 'sale', label: 'Ventes' },
                        { id: 'in', label: 'Entrées' },
                        { id: 'out', label: 'Sorties' },
                        { id: 'loss', label: 'Pertes' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setTypeFilter(filter.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${typeFilter === filter.id
                                ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20'
                                : 'bg-white/5 text-ios-gray hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste des mouvements */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-ios-gray font-medium text-xs uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-ios-gray font-medium text-xs uppercase tracking-wider">Produit</th>
                                <th className="px-6 py-4 text-ios-gray font-medium text-xs uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-ios-gray font-medium text-xs uppercase tracking-wider text-center">Quantité</th>
                                <th className="px-6 py-4 text-ios-gray font-medium text-xs uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-ios-gray font-medium text-xs uppercase tracking-wider">Utilisateur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-4">
                                            <div className="h-10 bg-white/5 rounded-xl"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredMovements.length > 0 ? (
                                filteredMovements.map((movement) => {
                                    const details = getTypeDetails(movement.type);
                                    const Icon = details.icon;

                                    return (
                                        <tr key={movement.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-white text-sm">
                                                    {format(new Date(movement.created_at), 'dd MMM yyyy', { locale: fr })}
                                                </div>
                                                <div className="text-ios-gray text-xs mt-0.5">
                                                    {format(new Date(movement.created_at), 'HH:mm')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-white font-medium text-sm">{movement.product_name}</div>
                                                <div className="text-ios-gray text-xs mt-0.5 line-clamp-1 italic">
                                                    {movement.reason || 'Aucun motif'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${details.bg} ${details.color}`}>
                                                    <Icon size={12} strokeWidth={3} />
                                                    {details.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className={`font-bold text-sm ${movement.type.includes('in') || movement.type === 'return'
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                                    }`}>
                                                    {movement.type.includes('in') || movement.type === 'return' ? '+' : '-'}{movement.quantity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-ios-gray text-xs">{movement.old_stock}</span>
                                                    <div className="h-px w-3 bg-white/10"></div>
                                                    <span className="text-white font-bold text-sm">{movement.new_stock}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-ios-blue/20 flex items-center justify-center text-[10px] text-ios-blue font-bold">
                                                        {movement.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-ios-gray text-sm">{movement.username}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <History size={48} className="text-ios-gray opacity-20" />
                                            <p className="text-ios-gray">Aucun mouvement trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
