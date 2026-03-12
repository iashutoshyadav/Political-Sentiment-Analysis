import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, TrendingUp, Minus, TrendingDown, Search, ChartPie } from 'lucide-react';
import { sentimentService } from '../services/sentimentService';
import ChartSection from '../components/ChartSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const StatCard = ({ icon, label, value, color }) => (
    <div className="stat-card">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`} style={{ background: color + '20', border: `1px solid ${color}30` }}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 font-medium">{label}</p>
        </div>
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([sentimentService.getStats(), sentimentService.getHistory()])
            .then(([s, h]) => { setStats(s); setHistory(h); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const overallSummary = stats ? {
        positive: stats.overall_positive,
        neutral: stats.overall_neutral,
        negative: stats.overall_negative,
    } : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Header */}
            <div className="mb-5 animate-fade-in">
                <h1 className="page-header">Welcome, {user?.username}</h1>
                <p className="page-subheader mb-4">Here's an overview of your political sentiment analyses</p>
            </div>

            {loading ? <LoadingSpinner text="Loading dashboard..." /> : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-up">
                        <StatCard icon={<ChartPie className="w-6 h-6" />} label="Total Analyses" value={stats?.total_analyses || 0} color="#3b82f6" />
                        <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Positive Articles" value={stats?.overall_positive || 0} color="#22c55e" />
                        <StatCard icon={<Minus className="w-6 h-6" />} label="Neutral Articles" value={stats?.overall_neutral || 0} color="#f59e0b" />
                        <StatCard icon={<TrendingDown className="w-6 h-6" />} label="Negative Articles" value={stats?.overall_negative || 0} color="#ef4444" />
                    </div>

                    {/* Charts */}
                    {(stats?.total_analyses > 0) ? (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">Analytics Overview</h2>
                            <ChartSection summary={overallSummary} partyStats={stats?.party_stats} history={history} />
                        </div>
                    ) : (
                        <div className="card text-center py-12 mb-8 flex flex-col items-center">
                            <div className="mb-4 text-slate-400 bg-slate-800/50 p-4 rounded-full"><Search className="w-10 h-10" /></div>
                            <h3 className="text-lg font-semibold text-white mb-2">No analyses yet</h3>
                            <p className="text-slate-400 text-sm mb-6">Start by analyzing sentiment for a political party</p>
                            <Link to="/analysis" className="btn-primary inline-flex">Run First Analysis</Link>
                        </div>
                    )}

                    {/* Recent history */}
                    {history.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4">Recent Analyses</h2>
                            <div className="card overflow-hidden p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-700/50">
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Party</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">State</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sentiment</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Articles</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Score</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.slice(0, 8).map(a => (
                                                <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-blue-400">{a.party}</td>
                                                    <td className="px-6 py-4 text-slate-400">{a.state || 'All States'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`badge-${(a.dominant_sentiment || 'neutral').toLowerCase()}`}>
                                                            {a.dominant_sentiment}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">{a.total_articles}</td>
                                                    <td className="px-6 py-4 font-mono text-sm"
                                                        style={{ color: a.avg_sentiment_score > 0 ? '#22c55e' : a.avg_sentiment_score < 0 ? '#ef4444' : '#94a3b8' }}>
                                                        {a.avg_sentiment_score > 0 ? '+' : ''}{a.avg_sentiment_score?.toFixed(3)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(a.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
