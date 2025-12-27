import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, Plus, Trash2 } from 'lucide-react';

export default function ProductModal({ product, onClose, onSave }) {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category_name: product?.category_name || '',
        stock_quantity: product?.stock_quantity || 0, // Stock simple si pas de variantes
    });

    const [categoryMode, setCategoryMode] = useState('select'); // 'select' ou 'custom'
    const [customCategory, setCustomCategory] = useState('');

    // Variantes
    const [variants, setVariants] = useState(
        product?.variants && product.variants.length > 0
            ? product.variants
            : []
    );

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await api('/products/categories');
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur catégories", error);
            setCategories([]); // Fallback sur tableau vide
        }
    };

    const addVariant = () => {
        setVariants([...variants, { name: '', stock: 0 }]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalCategoryName = categoryMode === 'custom' ? customCategory : formData.category_name;

        const payload = {
            ...formData,
            category_name: finalCategoryName,
            variants: variants.length > 0 ? variants : undefined,
            stock_quantity: variants.length === 0 ? formData.stock_quantity : undefined, // Stock simple si pas de variantes
        };

        try {
            if (product) {
                // Update (simplifié pour l'instant, pas de gestion variantes en édition)
                await api(`/products/${product.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                // Create
                await api('/products', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            onSave();
        } catch (error) {
            alert("Erreur lors de l'enregistrement");
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-2xl rounded-3xl p-8 relative z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">
                        {product ? 'Modifier le produit' : 'Nouveau produit'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom */}
                    <div>
                        <label className="text-xs font-medium text-ios-gray uppercase block mb-2">Nom du produit</label>
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-ios-gray uppercase block mb-2">Description</label>
                        <textarea
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Prix */}
                    <div>
                        <label className="text-xs font-medium text-ios-gray uppercase block mb-2">Prix (FCFA)</label>
                        <input
                            type="number"
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label className="text-xs font-medium text-ios-gray uppercase block mb-2">Catégorie</label>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => setCategoryMode('select')}
                                className={`px-4 py-2 rounded-lg text-sm ${categoryMode === 'select' ? 'bg-ios-blue text-white' : 'bg-white/5 text-gray-400'}`}
                            >
                                Existante
                            </button>
                            <button
                                type="button"
                                onClick={() => setCategoryMode('custom')}
                                className={`px-4 py-2 rounded-lg text-sm ${categoryMode === 'custom' ? 'bg-ios-blue text-white' : 'bg-white/5 text-gray-400'}`}
                            >
                                Autre (Nouvelle)
                            </button>
                        </div>

                        {categoryMode === 'select' ? (
                            <select
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                                value={formData.category_name}
                                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                            >
                                <option value="">-- Sélectionner --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                placeholder="Nom de la nouvelle catégorie"
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                            />
                        )}
                    </div>

                    {/* Variantes */}
                    <div className="border-t border-white/10 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-xs font-medium text-ios-gray uppercase">Variantes (Optionnel)</label>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-1 text-ios-blue hover:text-blue-400 text-sm"
                            >
                                <Plus size={16} /> Ajouter une variante
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <div className="bg-white/5 rounded-xl p-4 text-center text-ios-gray text-sm">
                                <p>Aucune variante. Le stock sera géré globalement.</p>
                                <input
                                    type="number"
                                    placeholder="Stock global"
                                    className="mt-2 w-32 bg-black/30 border border-white/10 rounded-lg p-2 text-white text-center"
                                    value={formData.stock_quantity}
                                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {variants.map((variant, index) => (
                                    <div key={index} className="flex gap-2 items-center bg-white/5 p-3 rounded-xl">
                                        <input
                                            type="text"
                                            placeholder="Nom (ex: XL, Rouge)"
                                            className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm"
                                            value={variant.name}
                                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            className="w-24 bg-black/30 border border-white/10 rounded-lg p-2 text-white text-sm text-center"
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-ios-gray hover:bg-white/5"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-ios-blue text-white hover:bg-blue-600 font-medium"
                        >
                            {product ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
