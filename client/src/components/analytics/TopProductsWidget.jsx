import { TrendingUp, Package } from 'lucide-react';

export default function TopProductsWidget({ products, loading }) {
    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-4">Top Produits</h3>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse bg-white/5 h-16 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="glass-panel p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-4">Top Produits</h3>
                <div className="flex flex-col items-center justify-center py-12">
                    <Package size={48} className="text-ios-gray mb-4 opacity-50" />
                    <p className="text-ios-gray">Aucune vente enregistrée</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Top Produits</h3>
                <TrendingUp size={20} className="text-green-400" />
            </div>

            <div className="space-y-3">
                {products.map((product, index) => {
                    const maxRevenue = products[0]?.revenue || 1;
                    const percentage = (product.revenue / maxRevenue) * 100;

                    return (
                        <div key={product.id} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                            index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                                index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-white/5 text-ios-gray'}
                                    `}>
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-ios-gray">{product.category_name || 'Sans catégorie'}</p>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-white font-bold">{product.total_sold}</p>
                                    <p className="text-xs text-green-400">{parseFloat(product.revenue).toFixed(0)} FCFA</p>
                                </div>
                            </div>

                            {/* Barre de progression */}
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                                index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                                    'bg-gradient-to-r from-ios-blue to-blue-600'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
