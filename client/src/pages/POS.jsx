import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Plus, Minus, Trash2, ShoppingCart, Calculator, CheckCircle } from 'lucide-react';

export default function POS() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Payment State
    const [amountReceived, setAmountReceived] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api('/products');
            setProducts(data);
        } catch (error) {
            console.error("Erreur chargement produits", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        setCart(current => {
            const existing = current.find(item => item.id === product.id);
            if (existing) {
                return current.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...current, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(current => current.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(current => current.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                // Empêcher de dépasser le stock réel (optionnel mais recommandé)
                const product = products.find(p => p.id === productId);
                if (delta > 0 && product && newQty > product.stock_quantity) {
                    alert("Stock insuffisant !");
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const totalAmount = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const changeDue = amountReceived ? parseFloat(amountReceived) - totalAmount : 0;

    const handleValidateSale = async () => {
        if (cart.length === 0) {
            alert("Le panier est vide !");
            return;
        }

        if (!amountReceived || parseFloat(amountReceived) < totalAmount) {
            alert("Montant reçu insuffisant !");
            return;
        }

        try {
            await api('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    items: cart.map(item => ({
                        product_id: item.id,
                        quantity: item.quantity
                    })),
                    total_amount: totalAmount
                })
            });

            // Animation de succès
            setShowSuccess(true);

            // Reset après 1.5 secondes
            setTimeout(() => {
                setShowSuccess(false);
                setCart([]);
                setAmountReceived('');
                fetchProducts(); // Refresh stock
            }, 1500);

        } catch (error) {
            console.error('Erreur vente:', error);
            alert('Erreur lors de la validation (stock insuffisant ?)');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 min-h-[calc(100vh-200px)]">

            {/* LEFT: Product Grid */}
            <div className="flex-1 flex flex-col gap-4 md:gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Caisse</h2>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Scanner ou chercher..."
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-ios-blue w-full sm:w-64"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 content-start">
                    {filteredProducts.map(product => (
                        <div key={product.id}
                            onClick={() => product.stock_quantity > 0 && addToCart(product)}
                            className={`glass-panel p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all active:scale-95 flex flex-col justify-between h-40 ${product.stock_quantity === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>

                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-ios-gray uppercase tracking-wider bg-black/20 px-2 py-1 rounded inline-block">
                                    {product.category_name || 'Sans catégorie'}
                                </span>
                                <div className={`w-3 h-3 rounded-full ${product.stock_quantity < 5 ? 'bg-red-500 animate-pulse' : product.stock_quantity < 10 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                            </div>

                            <div>
                                <h3 className="font-bold text-white leading-tight mb-1 truncate">{product.name}</h3>
                                <p className="text-ios-blue font-mono font-bold">{parseFloat(product.price).toFixed(0)} FCFA</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Cart / Ticket */}
            <div className="w-full lg:w-[400px] glass-panel rounded-2xl md:rounded-[32px] flex flex-col border border-white/10 lg:h-full">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingCart size={24} className="text-ios-blue" />
                        Panier
                    </h3>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-ios-gray opacity-50">
                            <ShoppingCart size={48} className="mb-4" />
                            <p>Panier vide</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-colors">
                                <div className="flex-1 min-w-0 mr-2">
                                    <p className="text-white font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-ios-gray">{parseFloat(item.price).toFixed(0)} FCFA x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-white text-gray-400"><Minus size={14} /></button>
                                        <span className="text-sm font-bold w-4 text-center text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-white text-gray-400"><Plus size={14} /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Calculation & Validation */}
                <div className="p-6 bg-black/20 backdrop-blur-sm rounded-b-[32px]">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-ios-gray">
                            <span>Sous-total</span>
                            <span>{totalAmount.toFixed(0)} FCFA</span>
                        </div>
                        <div className="flex justify-between text-white text-2xl font-bold">
                            <span>Total à payer</span>
                            <span>{totalAmount.toFixed(0)} FCFA</span>
                        </div>

                        {/* Money Handling */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <label className="text-xs uppercase text-ios-gray font-bold mb-2 block">Montant Reçu</label>
                            <div className="flex gap-2 mb-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">FCFA</span>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 text-white font-mono focus:ring-1 focus:ring-ios-blue outline-none"
                                        value={amountReceived}
                                        onChange={e => setAmountReceived(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            {amountReceived && (
                                <div className={`text-center p-2 rounded-xl font-bold ${changeDue >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    Rendu : {changeDue.toFixed(0)} FCFA
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleValidateSale}
                        disabled={cart.length === 0 || loading || (amountReceived && changeDue < 0)}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${showSuccess
                            ? 'bg-green-500 text-white scale-105 shadow-[0_0_30px_rgba(34,197,94,0.5)]'
                            : cart.length > 0 && (!amountReceived || changeDue >= 0)
                                ? 'bg-ios-blue hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:scale-[1.02] active:scale-95'
                                : 'bg-white/10 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {showSuccess ? <><CheckCircle className="animate-bounce" /> Vente Validée !</> : 'Valider la Vente'}
                    </button>
                </div>
            </div>
        </div>
    );
}
