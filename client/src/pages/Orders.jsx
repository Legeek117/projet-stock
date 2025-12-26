import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShoppingCart, Plus, CheckCircle, Clock } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await api('/orders');
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await api('/products');
            setProducts(data);
        } catch (err) { console.error(err); }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }]);
        }
    };

    const submitOrder = async () => {
        if (cart.length === 0) return;
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        try {
            await api('/orders', {
                method: 'POST',
                body: JSON.stringify({ items: cart, total_amount: total })
            });
            setShowNewOrder(false);
            setCart([]);
            fetchOrders();
            alert('Commande validée !');
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la commande (Stock insuffisant ?)");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Commandes</h2>
                    <p className="text-ios-gray mt-1">Suivi et historique</p>
                </div>
                <button onClick={() => setShowNewOrder(!showNewOrder)} className="bg-ios-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2">
                    {showNewOrder ? 'Annuler' : <><Plus size={18} /> Nouvelle Commande</>}
                </button>
            </div>

            {showNewOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.3s_ease-out]">
                    {/* Catalog */}
                    <div className="glass-panel p-6 rounded-3xl">
                        <h3 className="font-bold text-lg mb-4 text-white">Catalogue</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {products.map(p => (
                                <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <div>
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-ios-gray">{p.price} € • Stock: {p.stock_quantity}</div>
                                    </div>
                                    <button onClick={() => addToCart(p)} disabled={p.stock_quantity < 1} className="bg-white/10 hover:bg-ios-blue hover:text-white p-2 rounded-lg transition-colors disabled:opacity-50">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="glass-panel p-6 rounded-3xl flex flex-col">
                        <h3 className="font-bold text-lg mb-4 text-white">Panier</h3>
                        <div className="flex-1 space-y-2 overflow-y-auto mb-4">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <span>{item.name} <span className="text-ios-gray text-xs">x{item.quantity}</span></span>
                                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                </div>
                            ))}
                            {cart.length === 0 && <div className="text-center text-ios-gray py-10">Votre panier est vide</div>}
                        </div>
                        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                            <div className="text-xl font-bold">{cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)} €</div>
                            <button onClick={submitOrder} disabled={cart.length === 0} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History List */}
            <div className="glass-panel rounded-[24px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-ios-gray text-xs uppercase">
                        <tr>
                            <th className="p-6">ID</th>
                            <th className="p-6">Date</th>
                            <th className="p-6">Total</th>
                            <th className="p-6">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-6 font-mono text-sm opacity-70">#{order.id}</td>
                                <td className="p-6 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="p-6 font-bold">{order.total_amount} €</td>
                                <td className="p-6">
                                    <span className="flex items-center gap-2 text-xs font-semibold bg-green-500/20 text-green-300 px-3 py-1 rounded-full w-fit">
                                        <CheckCircle size={12} /> Complétée
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && !loading && <tr><td colSpan="4" className="p-8 text-center text-ios-gray">Aucune commande</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
