import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import ProductModal from '../components/ProductModal';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
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
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Produits</h2>
                    <p className="text-ios-gray mt-1">Gérez votre inventaire ({products.length} articles)</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray group-focus-within:text-ios-blue transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#1C1C1E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ios-blue w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-ios-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Ajouter</span>
                    </button>
                </div>
            </div>

            {/* Table Panel */}
            <div className="glass-panel overflow-hidden rounded-[24px]">
                {loading ? (
                    <div className="p-12 text-center text-ios-gray">Chargement...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5 text-ios-gray text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-6 font-medium">Nom</th>
                                    <th className="p-6 font-medium">Catégorie</th>
                                    <th className="p-6 font-medium">Prix</th>
                                    <th className="p-6 font-medium">Stock</th>
                                    <th className="p-6 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
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
                                        <td className="p-6 text-sm text-gray-300">
                                            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                {product.category || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-6 font-medium text-white">{product.price} €</td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock_quantity < 5 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                {product.stock_quantity} en stock
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(product)} className="p-2 hover:bg-white/10 rounded-lg text-ios-blue transition-colors">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors">
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

            {isModalOpen && (
                <ProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={editingProduct}
                    onSuccess={fetchProducts}
                />
            )}
        </div>
    );
}
