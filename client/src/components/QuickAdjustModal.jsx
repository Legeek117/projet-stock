import { useState } from 'react';
import { api } from '../services/api';
import { X, Plus, Minus, Info } from 'lucide-react';

export default function QuickAdjustModal({ product, onClose, onSave }) {
    const [quantity, setQuantity] = useState(1);
    const [type, setType] = useState('in'); // 'in' pour entrée, 'adjustment_out' pour sortie/perte
    const [reason, setReason] = useState('Ajustement manuel');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api('/stock/movements', {
                method: 'POST',
                body: JSON.stringify({
                    product_id: product.id,
                    type: type,
                    quantity: quantity,
                    reason: reason
                }),
            });
            onSave();
        } catch (error) {
            console.error("Erreur ajustement", error);
            alert("Erreur lors de l'ajustement du stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-3xl p-6 relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Ajuster le stock</h3>
                        <p className="text-ios-gray text-xs mt-0.5">{product.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sélecteur de type */}
                    <div className="flex p-1 bg-black/30 rounded-2xl border border-white/5">
                        <button
                            type="button"
                            onClick={() => setType('in')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${type === 'in' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-ios-gray hover:text-white'
                                }`}
                        >
                            <Plus size={16} /> Entrée
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('adjustment_out')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${type === 'adjustment_out' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-ios-gray hover:text-white'
                                }`}
                        >
                            <Minus size={16} /> Sortie
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-ios-gray uppercase block mb-1.5 ml-1">Quantité</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-center text-lg font-bold outline-none focus:ring-1 focus:ring-ios-blue"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-ios-gray uppercase block mb-1.5 ml-1">Stock Actuel</label>
                            <div className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-white text-center text-lg font-bold">
                                {product.stock_quantity}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-ios-gray uppercase block mb-1.5 ml-1">Motif / Commentaire</label>
                        <textarea
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:ring-1 focus:ring-ios-blue resize-none"
                            rows="2"
                            placeholder="Ex: Arrivage fournisseur, Perte, Don..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex items-start gap-2 bg-ios-blue/10 p-3 rounded-xl border border-ios-blue/20">
                        <Info size={16} className="text-ios-blue shrink-0 mt-0.5" />
                        <p className="text-[11px] text-ios-blue leading-relaxed">
                            Cette action sera enregistrée dans l'historique des mouvements de stock et modifiera le stock global du produit.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl text-ios-gray hover:bg-white/5 font-medium transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-ios-blue text-white hover:bg-blue-600 font-bold transition-all disabled:opacity-50"
                        >
                            {loading ? 'Chargement...' : 'Confirmer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
