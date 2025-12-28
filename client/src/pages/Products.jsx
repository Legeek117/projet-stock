import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Search, Package, History, TrendingUp } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import QuickAdjustModal from '../components/QuickAdjustModal';
import PriceHistoryModal from '../components/PriceHistoryModal';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api('/products');
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
            await api(`/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleQuickAdjust = (product) => {
        setSelectedProduct(product);
        setIsAdjustOpen(true);
    };

    const handleViewHistory = (product) => {
        setSelectedProduct(product);
        setIsHistoryOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col gap-3 md:gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Produits</h2>
                    <p className="text-ios-gray mt-1 text-sm">Gérez votre inventaire ({products.length} articles)</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group flex-1 sm:flex-initial">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray group-focus-within:text-ios-blue transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#1C1C1E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ios-blue w-full sm:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center justify-center gap-2 bg-ios-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Ajouter</span>
                    </button>
                </div>
            </div>

            {/* Table Panel */}
            <div className="glass-panel overflow-hidden rounded-2xl md:rounded-[24px]">
                {loading ? (
                    <div className="p-8 md:p-12 text-center text-ios-gray">Chargement...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-white/5 border-b border-white/5 text-ios-gray text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 md:p-6 font-medium">Nom</th>
                                    <th className="p-4 md:p-6 font-medium">Catégorie</th>
                                    <th className="p-4 md:p-6 font-medium">Prix</th>
                                    <th className="p-4 md:p-6 font-medium text-center">Stock</th>
                                    <th className="p-4 md:p-6 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 md:p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-ios-blue">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{product.name}</div>
                                                    {product.description && <div className="text-xs text-ios-gray truncate max-w-[200px]">{product.description}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-sm text-gray-300">
                                            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5 text-xs md:text-sm">
                                                {product.category_name || 'Sans catégorie'}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white text-sm md:text-base">{parseFloat(product.price).toFixed(0)} FCFA</span>
                                                <button
                                                    onClick={() => handleViewHistory(product)}
                                                    className="p-1.5 text-ios-gray hover:text-ios-blue hover:bg-ios-blue/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                                                    title="Historique des prix"
                                                >
                                                    <TrendingUp size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock_quantity < 5 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                    {product.stock_quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuickAdjust(product)}
                                                    className="text-[10px] text-ios-blue hover:underline md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                                >
                                                    Ajuster
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(product)} className="p-2 hover:bg-white/10 rounded-lg text-ios-blue transition-colors" title="Modifier">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors" title="Supprimer">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-ios-gray">
                                            Aucun produit trouvé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isModalOpen && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    onSave={() => {
                        setIsModalOpen(false);
                        setSelectedProduct(null);
                        fetchProducts();
                    }}
                />
            )}

            {isAdjustOpen && (
                <QuickAdjustModal
                    product={selectedProduct}
                    onClose={() => {
                        setIsAdjustOpen(false);
                        setSelectedProduct(null);
                    }}
                    onSave={() => {
                        setIsAdjustOpen(false);
                        setSelectedProduct(null);
                        fetchProducts();
                    }}
                />
            )}

            {isHistoryOpen && (
                <PriceHistoryModal
                    product={selectedProduct}
                    onClose={() => {
                        setIsHistoryOpen(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
}
