import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, TrendingUp, Minus, TrendingDown, Search, ChartPie, Shield, Cpu, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { sentimentService } from '../services/sentimentService';
import ChartSection from '../components/ChartSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';

const StatCard = ({ icon, label, value, color, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative group overflow-hidden"
    >
        <div className="bg-white/95 border border-chalk-300 p-4 rounded-[1.5rem] shadow-sm group-hover:shadow-md transition-all duration-500">
            {/* Technical Detail */}
            <div className="absolute top-4 right-6 text-[7px] font-mono text-dark-300 uppercase tracking-widest opacity-40">MODULE_CH_0{index + 1}</div>
            
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-500 group-hover:scale-110`} 
                     style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                    {icon}
                </div>
                <div>
                    <p className="text-[9px] font-black text-dark-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
                    <p className="text-2xl font-serif italic text-dark-950 leading-none">{value}</p>
                </div>
            </div>

            {/* Metric Footer */}
            <div className="mt-4 pt-4 border-t border-chalk-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                    <span className="text-[7px] font-mono text-dark-300 uppercase tracking-tighter">Live Stream / Decoded</span>
                </div>
                <div className="w-8 h-px bg-chalk-100" />
            </div>
        </div>
    </motion.div>
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

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner text="Initialising Intelligence Hub..." /></div>;

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
            {/* Header Area */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary-600 font-mono text-[8px] font-bold uppercase tracking-[0.3em] bg-primary-100/50 px-2 py-0.5 rounded">Console_Main</span>
                        <div className="w-10 h-px bg-chalk-200" />
                    </div>
                    <h1 className="text-4xl font-serif italic text-dark-950 leading-tight">Welcome, {user?.username}<span className="text-primary-600">.</span></h1>
                    <p className="text-dark-500 text-sm font-light font-serif italic max-w-md mt-1">Decoding geopolitical narratives through ensemble sentiment intelligence.</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 text-[9px] font-mono font-bold text-dark-400 uppercase tracking-widest border border-chalk-200 py-3 px-6 rounded-full bg-[#fffcf8]"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        SYSTEM_ONLINE
                    </div>
                    <div className="w-px h-3 bg-chalk-200 mx-2" />
                    <div className="flex items-center gap-2 italic">
                        {new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                    </div>
                </motion.div>
            </div>

            {/* Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard index={0} icon={<Globe className="w-5 h-5" />} label="Analysis Flow" value={stats?.total_analyses || 0} color="#0f172a" />
                <StatCard index={1} icon={<Zap className="w-5 h-5" />} label="Positivity Index" value={stats?.overall_positive || 0} color="#ea580c" />
                <StatCard index={2} icon={<Minus className="w-5 h-5" />} label="Neutral Buffer" value={stats?.overall_neutral || 0} color="#71717a" />
                <StatCard index={3} icon={<Shield className="w-5 h-5" />} label="Negative Flags" value={stats?.overall_negative || 0} color="#dc2626" />
            </div>

            {/* Primary Analysis Module */}
            {(stats?.total_analyses > 0) ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <div className="flex items-center justify-between mb-6 border-b border-chalk-200 pb-3">
                        <h2 className="text-xl font-serif italic text-dark-950 flex items-center gap-3">
                            <ChartPie className="w-5 h-5 text-primary-500" />
                            Distribution Metrics
                        </h2>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary-500" />
                            <div className="w-2 h-2 rounded-full bg-chalk-200" />
                        </div>
                    </div>
                    <div className="bg-white border border-chalk-200 p-6 rounded-[2rem] shadow-sm">
                        <ChartSection summary={overallSummary} partyStats={stats?.party_stats} history={history} />
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 border border-white/40 text-center py-20 mb-12 flex flex-col items-center rounded-[3rem] shadow-sm blueprint-grid-subtle"
                >
                    <div className="mb-6 text-chalk-300 bg-chalk-50 p-6 rounded-full border border-chalk-100"><Search className="w-12 h-12" /></div>
                    <h3 className="text-2xl font-serif italic text-dark-950 mb-3">No decoded signals found.</h3>
                    <p className="text-dark-500 text-sm font-light font-serif italic mb-8 max-w-xs leading-relaxed">Your intelligence archive is empty. Initialise your first analysis sequence.</p>
                    <Link to="/analysis" className="bg-dark-950 text-white px-10 py-4 font-serif italic text-sm hover:bg-dark-800 transition-all rounded-xl relative group overflow-hidden">
                        <span className="relative z-10">Run_AnalysisSequence</span>
                        <div className="absolute inset-x-0 h-[100%] top-0 bg-gradient-to-t from-primary-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    </Link>
                </motion.div>
            )}

            {/* Archive Logs */}
            {history.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-serif italic text-dark-950">Intelligence Archive Logs</h2>
                        <span className="text-[8px] font-mono text-dark-400 uppercase tracking-widest border border-chalk-200 px-3 py-1 rounded-full">Viewing / 001 - 008</span>
                    </div>
                    <div className="bg-white border border-chalk-200 overflow-hidden rounded-[2rem] shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-chalk-100 bg-chalk-50/30">
                                        <th className="text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Archive / Party</th>
                                        <th className="hidden lg:table-cell text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Geo_State</th>
                                        <th className="text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Dominant_Signal</th>
                                        <th className="hidden sm:table-cell text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Volume</th>
                                        <th className="text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Decipher_Score</th>
                                        <th className="hidden md:table-cell text-right px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Log_Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice(0, 8).map(a => (
                                        <tr key={a.id} className="border-b border-chalk-50 hover:bg-[#fffbf6] transition-colors group">
                                            <td className="px-8 py-4 font-serif italic text-dark-950 group-hover:text-primary-600 transition-colors">{a.party}</td>
                                            <td className="hidden lg:table-cell px-8 py-4 text-dark-500 font-light italic">{a.state || 'National Context'}</td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1 h-1 rounded-full ${
                                                        a.dominant_sentiment === 'Positive' ? 'bg-green-500' : 
                                                        a.dominant_sentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-400'
                                                    }`} />
                                                    <span className={`text-[10px] font-bold uppercase tracking-tight ${
                                                        a.dominant_sentiment === 'Positive' ? 'text-green-600' : 
                                                        a.dominant_sentiment === 'Negative' ? 'text-red-600' : 'text-dark-400'
                                                    }`}>
                                                        {a.dominant_sentiment}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-8 py-4 text-dark-800 font-mono text-[10px]">{a.total_articles} units</td>
                                            <td className="px-8 py-4">
                                                <span className={`font-mono text-[10px] font-bold px-2 py-1 rounded bg-[#fff7ed] border border-chalk-200 ${
                                                    a.avg_sentiment_score > 0 ? 'text-green-600' : a.avg_sentiment_score < 0 ? 'text-red-600' : 'text-dark-500'
                                                }`}>
                                                    {a.avg_sentiment_score > 0 ? '+' : ''}{a.avg_sentiment_score?.toFixed(3)}
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell px-8 py-4 text-dark-300 text-[10px] text-right font-mono italic">{formatDate(a.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
