import { useEffect, useState } from 'react';
import { sentimentService } from '../services/sentimentService';
import SentimentBadge from '../components/SentimentBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';
import { FileText, Download, Activity, Archive, Database, Terminal } from 'lucide-react';

export default function Reports() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        sentimentService.getHistory()
            .then(setHistory)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = async (analysis) => {
        setDownloading(analysis.id);
        try {
            const blob = await sentimentService.generateReport(analysis.id, analysis.party, analysis.state);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${analysis.party}_${analysis.state || 'all'}_${analysis.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(null);
        }
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner text="Accessing Archive Terminal..." /></div>;

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary-600 font-mono text-[8px] font-bold uppercase tracking-[0.3em] bg-primary-100/50 px-2 py-0.5 rounded">Archive_Log</span>
                    <div className="w-10 h-px bg-chalk-200" />
                </div>
                <h1 className="text-4xl font-serif italic text-dark-950 flex items-center gap-4">
                    Intelligence Archive<span className="text-primary-600">.</span>
                </h1>
                <p className="text-dark-500 text-sm font-light font-serif italic mt-1">Access and download verified sentiment intelligence reports from historical intercepts.</p>
            </motion.div>

            {history.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 border border-white/40 text-center py-24 flex flex-col items-center rounded-[3rem] shadow-sm blueprint-grid-subtle"
                >
                    <div className="mb-6 text-chalk-300 bg-chalk-50 p-6 rounded-full border border-chalk-100"><Database className="w-12 h-12" /></div>
                    <h3 className="text-2xl font-serif italic text-dark-950 mb-3">Archive is currently empty.</h3>
                    <p className="text-dark-500 text-sm font-light font-serif italic mb-8 max-w-xs leading-relaxed">No historical signals have been recorded yet. Execute an analysis protocol to begin logging.</p>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-chalk-300 overflow-hidden rounded-[2rem] shadow-sm"
                >
                    <div className="px-10 py-6 border-b border-chalk-100 bg-chalk-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Archive className="w-4 h-4 text-primary-500" />
                            <h2 className="text-[10px] font-black text-dark-800 uppercase tracking-widest font-mono">{history.length} REGISTERED_ENTRIES</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[8px] font-mono text-dark-400 uppercase tracking-widest">Database_Secure</span>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-chalk-100 bg-[#fffcf8]">
                                    <th className="hidden md:table-cell text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">ID</th>
                                    <th className="text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Entity_Party</th>
                                    <th className="hidden lg:table-cell text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Geo_State</th>
                                    <th className="text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Signal_Type</th>
                                    <th className="hidden sm:table-cell text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Dist_Ratio</th>
                                    <th className="text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Index</th>
                                    <th className="hidden md:table-cell text-left px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Timestamp</th>
                                    <th className="text-right px-8 py-4 text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Export_PDF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((a, i) => (
                                    <tr key={a.id} className="border-b border-chalk-50 hover:bg-[#fffbf6] transition-colors group">
                                        <td className="hidden md:table-cell px-8 py-4 text-dark-300 text-[10px] font-mono">LOG_{String(i + 1).padStart(3, '0')}</td>
                                        <td className="px-8 py-4 font-serif italic text-dark-950 group-hover:text-primary-600 transition-colors">{a.party}</td>
                                        <td className="hidden lg:table-cell px-8 py-4 text-dark-500 font-light italic text-[13px]">{a.state || 'All_Stations'}</td>
                                        <td className="px-8 py-4">
                                            <SentimentBadge label={a.dominant_sentiment} />
                                        </td>
                                        <td className="hidden sm:table-cell px-8 py-4">
                                            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold">
                                                <span className="text-green-600">{a.positive_count}</span>
                                                <span className="text-chalk-300">/</span>
                                                <span className="text-amber-500">{a.neutral_count}</span>
                                                <span className="text-chalk-300">/</span>
                                                <span className="text-red-500">{a.negative_count}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`font-mono text-[10px] font-bold ${
                                                a.avg_sentiment_score > 0 ? 'text-green-600' : a.avg_sentiment_score < 0 ? 'text-red-600' : 'text-dark-500'
                                            }`}>
                                                {a.avg_sentiment_score > 0 ? '+' : ''}{a.avg_sentiment_score?.toFixed(3)}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-8 py-4 text-dark-400 text-[10px] font-mono italic">{formatDate(a.created_at)}</td>
                                        <td className="px-8 py-4 text-right">
                                            <button 
                                                onClick={() => handleDownload(a)} 
                                                disabled={downloading === a.id}
                                                className="inline-flex items-center gap-2 bg-[#fff7ed] hover:bg-dark-950 text-dark-600 hover:text-white border border-chalk-200 hover:border-dark-950 px-4 py-1.5 rounded-xl transition-all duration-300 group/btn disabled:opacity-50"
                                            >
                                                {downloading === a.id ? (
                                                    <><span className="w-3 h-3 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /> <span className="text-[10px] font-mono font-black uppercase">Building...</span></>
                                                ) : (
                                                    <><Download className="w-3.5 h-3.5 group-hover/btn:translate-y-0.5 transition-transform" /> <span className="text-[10px] font-mono font-black uppercase">Export</span></>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Terminal Aesthetic Detail */}
            <div className="mt-12 flex items-center justify-between px-6 opacity-40">
                <div className="flex gap-4">
                     <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-dark-950" />
                         <span className="text-[7px] font-mono text-dark-300 uppercase tracking-widest">Stream_ID / 0x932</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-dark-950" />
                         <span className="text-[7px] font-mono text-dark-300 uppercase tracking-widest">Kernel / Verified</span>
                     </div>
                </div>
                <Terminal className="w-4 h-4 text-dark-300" />
            </div>
        </div>
    );
}
