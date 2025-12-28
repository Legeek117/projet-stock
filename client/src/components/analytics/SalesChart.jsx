import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SalesChart({ data, period = 7, type = 'line' }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px]">
                <p className="text-ios-gray">Aucune donnée disponible</p>
            </div>
        );
    }

    // Formatter les données pour le graphique
    const formattedData = data.map(item => ({
        date: format(parseISO(item.date), 'dd MMM', { locale: fr }),
        ventes: parseInt(item.count) || 0,
        montant: parseFloat(item.total) || 0
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-lg">
                    <p className="text-white font-bold mb-2">{payload[0].payload.date}</p>
                    <p className="text-ios-blue text-sm">
                        Ventes: <span className="font-bold">{payload[0].payload.ventes}</span>
                    </p>
                    <p className="text-green-400 text-sm">
                        Montant: <span className="font-bold">{payload[0].payload.montant.toFixed(0)} FCFA</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const ChartComponent = type === 'bar' ? BarChart : LineChart;
    const DataComponent = type === 'bar' ? Bar : Line;

    return (
        <div className="glass-panel p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Évolution des Ventes</h3>
                    <p className="text-ios-gray text-sm mt-1">{period} derniers jours</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <ChartComponent data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                        dataKey="date"
                        stroke="#8E8E93"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#8E8E93"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />

                    {type === 'line' ? (
                        <>
                            <Line
                                type="monotone"
                                dataKey="ventes"
                                stroke="#0A84FF"
                                strokeWidth={3}
                                dot={{ fill: '#0A84FF', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Nombre de ventes"
                            />
                            <Line
                                type="monotone"
                                dataKey="montant"
                                stroke="#34C759"
                                strokeWidth={3}
                                dot={{ fill: '#34C759', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Montant (FCFA)"
                            />
                        </>
                    ) : (
                        <>
                            <Bar dataKey="ventes" fill="#0A84FF" name="Nombre de ventes" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="montant" fill="#34C759" name="Montant (FCFA)" radius={[8, 8, 0, 0]} />
                        </>
                    )}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
}
