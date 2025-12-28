import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PriceHistoryModal({ product, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await api(`/stock/price-history/${product.id}`);
            setHistory(data);
        } catch (error) {
            console.error("Erreur historique prix", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-3xl p-6 relative z-10 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Historique des prix</h3>
                        <p className="text-ios-gray text-xs mt-0.5">{product.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl"></div>
                            ))}
                        </div>
                    ) : history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((change, index) => {
                                const diff = change.old_price ? change.new_price - change.old_price : 0;
                                const isIncrease = diff > 0;

                                return (
                                    <div key={change.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index === 0 ? 'bg-ios-blue/20 text-ios-blue' : 'bg-white/5 text-ios-gray'
                                                }`}>
                                                <div className="relative">
                                                    <Clock size={18} />
                                                    {index === 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-ios-blue rounded-full border border-[#1C1C1E]"></div>}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">{parseFloat(change.new_price).toFixed(0)} FCFA</div>
                                                <div className="text-[10px] text-ios-gray mt-0.5 uppercase tracking-wider">
                                                    {format(new Date(change.created_at), 'dd MMMM yyyy', { locale: fr })}
                                                </div>
                                            </div>
                                        </div>

                                        {change.old_price && (
                                            <div className="text-right">
                                                <div className={`flex items-center justify-end gap-1 text-xs font-bold ${isIncrease ? 'text-red-400' : 'text-green-400'}`}>
                                                    {isIncrease ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {Math.abs(diff).toFixed(0)}
                                                </div>
                                                <div className="text-[10px] text-ios-gray mt-0.5">
                                                    vs {parseFloat(change.old_price).toFixed(0)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-ios-gray">
                            <Clock size={40} className="mx-auto opacity-20 mb-3" />
                            <p>Aucun changement de prix enregistré</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-ios-gray italic text-center leading-relaxed px-4">
                        L'historique est généré automatiquement lors de la modification du prix d'un produit.
                    </p>
                </div>
            </div>
        </div>
    );
}
