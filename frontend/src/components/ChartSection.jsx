import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts';
import { SENTIMENT_COLORS, CHART_COLORS } from '../utils/constants';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="glass rounded-xl p-3 text-xs border border-slate-600/50 shadow-xl">
                {label && <p className="text-slate-300 font-semibold mb-1">{label}</p>}
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: <b>{p.value}</b></p>
                ))}
            </div>
        );
    }
    return null;
};

export function SentimentPieChart({ data }) {
    const chartData = [
        { name: 'Positive', value: data?.positive || 0, color: SENTIMENT_COLORS.Positive },
        { name: 'Neutral', value: data?.neutral || 0, color: SENTIMENT_COLORS.Neutral },
        { name: 'Negative', value: data?.negative || 0, color: SENTIMENT_COLORS.Negative },
    ].filter(d => d.value > 0);

    if (!chartData.length) return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No data to display</div>;

    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#475569', strokeWidth: 1 }}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

export function PartyBarChart({ data }) {
    if (!data?.length) return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Run analyses on multiple parties to compare</div>;

    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="party" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="positive" name="Positive" fill={SENTIMENT_COLORS.Positive} radius={[4, 4, 0, 0]} />
                <Bar dataKey="neutral" name="Neutral" fill={SENTIMENT_COLORS.Neutral} radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative" name="Negative" fill={SENTIMENT_COLORS.Negative} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function TrendLineChart({ data }) {
    if (!data?.length) return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Analyze articles to build trend data</div>;

    const chartData = data.slice(0, 10).reverse().map((a, i) => ({
        name: a.party || `#${i + 1}`,
        score: parseFloat((a.avg_sentiment_score || 0).toFixed(2)),
        total: a.total_articles || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[-1, 1]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="score" name="Avg Sentiment" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default function ChartSection({ summary, partyStats, history }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="chart-container">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Sentiment Distribution</h3>
                <SentimentPieChart data={summary} />
            </div>
            <div className="chart-container">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Party Comparison</h3>
                <PartyBarChart data={partyStats} />
            </div>
            <div className="chart-container">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Sentiment Trend</h3>
                <TrendLineChart data={history} />
            </div>
        </div>
    );
}
