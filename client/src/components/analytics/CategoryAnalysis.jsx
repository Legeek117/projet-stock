import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0A84FF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FFCC00', '#FF2D55'];

export default function CategoryAnalysis({ data, loading }) {
    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-4">Ventes par Catégorie</h3>
                <div className="animate-pulse bg-white/5 h-[300px] rounded-xl"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="glass-panel p-6 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-4">Ventes par Catégorie</h3>
                <div className="flex items-center justify-center h-[300px]">
                    <p className="text-ios-gray">Aucune donnée disponible</p>
                </div>
            </div>
        );
    }

    const chartData = data.map(item => ({
        name: item.category,
        value: parseFloat(item.revenue),
        count: parseInt(item.items_sold)
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-lg">
                    <p className="text-white font-bold mb-2">{payload[0].name}</p>
                    <p className="text-green-400 text-sm">
                        Revenus: <span className="font-bold">{payload[0].value.toFixed(0)} FCFA</span>
                    </p>
                    <p className="text-ios-blue text-sm">
                        Articles vendus: <span className="font-bold">{payload[0].payload.count}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Ne pas afficher si < 5%

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-4">Ventes par Catégorie</h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Liste détaillée */}
            <div className="mt-6 space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="text-white text-sm">{item.category}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold text-sm">{parseFloat(item.revenue).toFixed(0)} FCFA</p>
                            <p className="text-xs text-ios-gray">{item.items_sold} articles</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
