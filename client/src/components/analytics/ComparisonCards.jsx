import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ComparisonCards({ data, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="glass-panel p-6 rounded-3xl animate-pulse">
                        <div className="h-20 bg-white/5 rounded-xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const calculateChange = (current, previous) => {
        if (!previous || parseFloat(previous) === 0) return { percent: 0, trend: 'neutral' };
        const change = ((parseFloat(current) - parseFloat(previous)) / parseFloat(previous)) * 100;
        return {
            percent: Math.abs(change).toFixed(1),
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
        };
    };

    const todayVsYesterday = calculateChange(data.today?.total, data.yesterday?.total);
    const thisMonthVsLastMonth = calculateChange(data.thisMonth?.total, data.lastMonth?.total);

    const ComparisonCard = ({ title, current, previous, change, period }) => {
        const TrendIcon = change.trend === 'up' ? TrendingUp : change.trend === 'down' ? TrendingDown : Minus;
        const trendColor = change.trend === 'up' ? 'text-green-400' : change.trend === 'down' ? 'text-red-400' : 'text-ios-gray';
        const bgColor = change.trend === 'up' ? 'bg-green-500/10' : change.trend === 'down' ? 'bg-red-500/10' : 'bg-white/5';

        return (
            <div className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-ios-gray text-sm uppercase tracking-wider">{title}</p>
                        <h3 className="text-3xl font-bold text-white mt-2">
                            {parseFloat(current || 0).toFixed(0)} <span className="text-lg text-ios-gray">FCFA</span>
                        </h3>
                    </div>
                    <div className={`${bgColor} p-2 rounded-xl`}>
                        <TrendIcon size={20} className={trendColor} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`${trendColor} font-bold text-sm`}>
                        {change.trend === 'up' ? '+' : change.trend === 'down' ? '-' : ''}{change.percent}%
                    </span>
                    <span className="text-ios-gray text-xs">vs {period}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs text-ios-gray">
                        {period}: <span className="text-white font-medium">{parseFloat(previous || 0).toFixed(0)} FCFA</span>
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComparisonCard
                title="Aujourd'hui"
                current={data.today?.total}
                previous={data.yesterday?.total}
                change={todayVsYesterday}
                period="hier"
            />
            <ComparisonCard
                title="Ce Mois"
                current={data.thisMonth?.total}
                previous={data.lastMonth?.total}
                change={thisMonthVsLastMonth}
                period="mois dernier"
            />
        </div>
    );
}
