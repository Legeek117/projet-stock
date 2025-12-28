import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Scan, ClipboardList, CheckCircle2, AlertCircle, Save, RefreshCw, Box } from 'lucide-react';

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api('/products');
            setProducts(data);
            // Initialiser l'inventaire avec les stocks actuels
            const initialInv = {};
            data.forEach(p => initialInv[p.id] = p.stock_quantity);
            setInventory(initialInv);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateCount = (id, value) => {
        setInventory({ ...inventory, [id]: parseInt(value) || 0 });
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            // Pour chaque produit, si le stock a changé, on crée un ajustement
            for (const product of products) {
                const newQty = inventory[product.id];
                if (newQty !== product.stock_quantity) {
                    const diff = newQty - product.stock_quantity;
                    const type = diff > 0 ? 'adjustment_in' : 'adjustment_out';

                    await api('/stock/movements', {
                        method: 'POST',
                        body: JSON.stringify({
                            product_id: product.id,
                            type: type,
                            quantity: Math.abs(diff),
                            reason: 'Inventaire physique périodique'
                        })
                    });
                }
            }
            setSuccess(true);
            await fetchProducts();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour de l'inventaire");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <ClipboardList size={32} className="text-ios-blue" />
                        Inventaire Physique
                    </h2>
                    <p className="text-ios-gray mt-1">Saisissez les stocks réels comptés en rayon.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-white/5 text-white font-bold flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <Scan size={20} /> Mode Scan
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${success ? 'bg-green-500 text-white' : 'bg-ios-blue text-white hover:bg-blue-600 shadow-ios-blue/20'
                            }`}
                    >
                        {success ? <CheckCircle2 size={20} /> : <Save size={20} />}
                        {success ? 'ENREGISTRÉ' : 'VALIDER TOUT'}
                    </button>
                </div>
            </div>

            <div className="glass-panel rounded-[32px] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-6 text-xs font-black text-ios-gray uppercase tracking-widest">Produit</th>
                                <th className="p-6 text-xs font-black text-ios-gray uppercase tracking-widest text-center">Stock Système</th>
                                <th className="p-6 text-xs font-black text-ios-gray uppercase tracking-widest text-center">Stock Réel</th>
                                <th className="p-6 text-xs font-black text-ios-gray uppercase tracking-widest text-right">Écart</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="p-8"><div className="h-4 bg-white/5 rounded w-1/2 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : products.map(product => {
                                const diff = inventory[product.id] - product.stock_quantity;
                                return (
                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-ios-gray group-hover:bg-ios-blue/10 group-hover:text-ios-blue transition-all">
                                                    <Box size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{product.name}</p>
                                                    <p className="text-[10px] text-ios-gray uppercase font-black mt-0.5">{product.category_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-ios-gray font-medium">{product.stock_quantity}</span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center">
                                                <input
                                                    type="number"
                                                    className="w-24 bg-black/40 border border-white/10 rounded-xl p-3 text-center text-white font-bold outline-none focus:ring-1 focus:ring-ios-blue transition-all"
                                                    value={inventory[product.id]}
                                                    onChange={(e) => updateCount(product.id, e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            {diff === 0 ? (
                                                <span className="text-[10px] font-black text-green-500/50 uppercase tracking-widest">Conforme</span>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${diff > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {diff > 0 ? '+' : ''}{diff}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue">
                    <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                    <p className="text-white font-bold">Note d'inventaire</p>
                    <p className="text-sm text-ios-gray mt-1">La validation créera automatiquement des entrées ou sorties de stock pour ajuster votre inventaire système aux réalités physiques.</p>
                </div>
                <button
                    onClick={fetchProducts}
                    className="p-3 hover:bg-white/5 rounded-xl text-ios-gray transition-colors"
                    title="Actualiser"
                >
                    <RefreshCw size={20} />
                </button>
            </div>
        </div>
    );
}
