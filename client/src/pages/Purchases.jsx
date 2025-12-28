import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingCart, Plus, Minus, Trash2, Search, Truck, Save, History, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Purchases() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsData, suppliersData, historyData] = await Promise.all([
                api('/products'),
                api('/purchases/suppliers'),
                api('/purchases')
            ]);
            setProducts(Array.isArray(productsData) ? productsData : []);
            setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
            setHistory(Array.isArray(historyData) ? historyData : []);
        } catch (err) {
            console.error(err);
            setProducts([]);
            setSuppliers([]);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { ...product, quantity: 1, unit_price: product.price || 0 }]);
        }
    };

    const updateCartQty = (id, delta) => {
        setCart(cart.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        }));
    };

    const updateCartPrice = (id, price) => {
        setCart(cart.map(i => i.id === id ? { ...i, unit_price: parseFloat(price) || 0 } : i));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(i => i.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const handleSubmit = async () => {
        if (!selectedSupplier || cart.length === 0) return;
        setSubmitting(true);
        try {
            await api('/purchases', {
                method: 'POST',
                body: JSON.stringify({
                    supplier_id: parseInt(selectedSupplier),
                    items: cart.map(i => ({
                        product_id: i.id,
                        quantity: i.quantity,
                        unit_price: i.unit_price
                    }))
                })
            });
            setOrderSuccess(true);
            setCart([]);
            setSelectedSupplier('');
            await fetchData();
            setTimeout(() => setOrderSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement de l'achat");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (showHistory) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <History size={32} className="text-ios-blue" />
                        Historique des Achats
                    </h2>
                    <button
                        onClick={() => setShowHistory(false)}
                        className="bg-white/5 text-white px-4 py-2 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        Nouvel Achat
                    </button>
                </div>

                <div className="glass-panel overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="p-4 text-xs font-bold text-ios-gray uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-ios-gray uppercase">Fournisseur</th>
                                <th className="p-4 text-xs font-bold text-ios-gray uppercase">Articles</th>
                                <th className="p-4 text-xs font-bold text-ios-gray uppercase">Total</th>
                                <th className="p-4 text-xs font-bold text-ios-gray uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map(purchase => (
                                <tr key={purchase.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-sm text-white">
                                        {format(new Date(purchase.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-ios-blue">{purchase.supplier_name}</td>
                                    <td className="p-4">
                                        <div className="text-[10px] text-ios-gray flex flex-wrap gap-1">
                                            {purchase.items?.slice(0, 2).map((item, idx) => (
                                                <span key={idx} className="bg-white/5 px-2 py-0.5 rounded-full">
                                                    {item.quantity}x {item.product_name}
                                                </span>
                                            ))}
                                            {purchase.items?.length > 2 && <span className="text-[10px] items-center flex">+{purchase.items.length - 2} de plus</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-white">{parseInt(purchase.total_amount).toLocaleString()} FCFA</td>
                                    <td className="p-4 text-right">
                                        <button className="text-ios-blue text-xs font-bold hover:underline">Détails</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
            {/* Colonne Liste Produits */}
            <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Truck size={32} className="text-ios-blue" />
                        Nouvel Achat
                    </h2>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="bg-white/5 text-ios-gray px-4 py-2 rounded-xl text-sm font-bold border border-white/5 hover:text-white transition-colors"
                    >
                        Historique
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit à commander..."
                        className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-ios-blue transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl"></div>)
                        ) : filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-ios-blue/30 transition-all text-left flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-ios-gray group-hover:text-ios-blue transition-colors font-bold text-lg">
                                    {product.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">{product.name}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[10px] text-ios-gray uppercase font-bold">{product.category_name}</p>
                                        <p className="text-xs text-ios-blue font-bold">{product.stock_quantity} en stock</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Colonne Panier Achat */}
            <div className="glass-panel rounded-[32px] p-6 flex flex-col border border-white/5 shadow-2xl relative overflow-hidden bg-white/[0.02]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingCart size={24} className="text-ios-blue" />
                        Bon d'Achat
                    </h3>
                    <span className="bg-ios-blue/10 text-ios-blue px-3 py-1 rounded-full text-xs font-bold">
                        {cart.length} articles
                    </span>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-bold text-ios-gray uppercase block mb-3 ml-1">Fournisseur</label>
                    <div className="relative">
                        <select
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white appearance-none outline-none focus:ring-1 focus:ring-ios-blue"
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            <option value="">Sélectionner un fournisseur...</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <Truck size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-ios-gray pointer-events-none" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-ios-gray/40 gap-4">
                            <Truck size={48} className="animate-bounce" />
                            <p className="text-center text-sm font-medium">Sélectionnez des produits pour<br />lancer une commande</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-sm font-bold text-white">{item.name}</p>
                                        <p className="text-[10px] text-ios-gray uppercase mt-0.5">Vente: {parseInt(item.price).toLocaleString()} FCFA</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-ios-gray hover:text-red-400 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                                    <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/5">
                                        <button onClick={() => updateCartQty(item.id, -1)} className="p-2 hover:bg-white/5 rounded-lg text-ios-blue">
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-white font-bold text-sm">{item.quantity}</span>
                                        <button onClick={() => updateCartQty(item.id, 1)} className="p-2 hover:bg-white/5 rounded-lg text-ios-blue">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-[120px]">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="Prix Achat"
                                                className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-3 pr-8 text-white text-xs text-right outline-none focus:border-ios-blue"
                                                value={item.unit_price}
                                                onChange={(e) => updateCartPrice(item.id, e.target.value)}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-ios-gray">FCFA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-ios-gray font-medium">Total Commande</span>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-white">{total.toLocaleString()} FCFA</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || cart.length === 0 || !selectedSupplier}
                        className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 shadow-xl ${orderSuccess
                            ? 'bg-green-500 text-white scale-100'
                            : submitting
                                ? 'bg-ios-blue/50 cursor-not-allowed text-white'
                                : 'bg-ios-blue text-white hover:bg-blue-600 hover:shadow-ios-blue/20'
                            } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                    >
                        {orderSuccess ? (
                            <>
                                <CheckCircle2 size={24} className="animate-bounce" />
                                VALIDÉ !
                            </>
                        ) : submitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ENCOURS...
                            </>
                        ) : (
                            <>
                                <Save size={24} strokeWidth={2.5} />
                                ENREGISTRER L'ACHAT
                            </>
                        )}
                    </button>
                    {!selectedSupplier && cart.length > 0 && (
                        <p className="text-[10px] text-red-400 text-center font-bold uppercase animate-pulse">
                            Sélectionnez un fournisseur pour valider
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
