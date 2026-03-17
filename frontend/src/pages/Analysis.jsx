import { useState } from 'react';
import { sentimentService } from '../services/sentimentService';
import ArticleCard from '../components/ArticleCard';
import { SentimentPieChart } from '../components/ChartSection';
import SentimentBadge from '../components/SentimentBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { PARTIES, STATES } from '../utils/constants';
import { calcPercentage } from '../utils/helpers';
import { motion } from 'framer-motion';
import { Search, Rocket, Download, Bot, Target, Sliders, Layout, Terminal, Globe } from 'lucide-react';

export default function Analysis() {
    const [party, setParty] = useState('BJP');
    const [state, setState] = useState('All States');
    const [pageSize, setPageSize] = useState(15);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await sentimentService.analyze(party, state === 'All States' ? null : state, pageSize);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Analysis failed. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const blob = await sentimentService.generateReport(result?.analysis_id, party, state);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sentiment_${party}_${state}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('PDF generation failed. Please try again.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary-600 font-mono text-[8px] font-bold uppercase tracking-[0.3em] bg-primary-100/50 px-2 py-0.5 rounded">Signal_Intercept</span>
                    <div className="w-10 h-px bg-chalk-200" />
                </div>
                <h1 className="text-4xl font-serif italic text-dark-950 flex items-center gap-4">
                    Intelligence Analysis<span className="text-primary-600">.</span>
                </h1>
                <p className="text-dark-500 text-sm font-light font-serif italic mt-1">Configure neural parameters to decipher regional political sentiment flows.</p>
            </motion.div>

            {/* Signal Configuration Panel */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-chalk-300 p-8 rounded-[2rem] shadow-sm mb-10 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Target className="w-32 h-32 text-dark-950" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 relative z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Sliders className="w-3 h-3 text-primary-500" />
                            <label className="text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Archive / Party</label>
                        </div>
                        <select className="w-full bg-[#fffcf8] border border-chalk-200 rounded-2xl py-4 px-5 text-sm font-serif italic focus:outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer" 
                                value={party} onChange={e => setParty(e.target.value)}>
                            {PARTIES.map(p => <option key={p.id} value={p.id}>{p.short} — {p.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-3 h-3 text-primary-500" />
                            <label className="text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Geo_State</label>
                        </div>
                        <select className="w-full bg-[#fffcf8] border border-chalk-200 rounded-2xl py-4 px-5 text-sm font-serif italic focus:outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer" 
                                value={state} onChange={e => setState(e.target.value)}>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Layout className="w-3 h-3 text-primary-500" />
                            <label className="text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Intercept_Volume</label>
                        </div>
                        <select className="w-full bg-[#fffcf8] border border-chalk-200 rounded-2xl py-4 px-5 text-sm font-serif italic focus:outline-none focus:border-primary-500 transition-all appearance-none cursor-pointer" 
                                value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                            {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} Intercepts</option>)}
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleAnalyze} 
                    disabled={loading} 
                    className="w-full sm:w-auto bg-dark-950 text-white px-12 py-4 font-serif italic text-sm hover:bg-dark-800 transition-all rounded-xl relative group overflow-hidden flex items-center justify-center gap-3"
                >
                    <span className="relative z-10">{loading ? 'Processing_Intercept...' : 'Run_AnalysisProtocol'}</span>
                    {!loading && <Rocket className="w-4 h-4 relative z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />}
                    <div className="absolute inset-x-0 h-[100%] top-0 bg-gradient-to-t from-primary-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                </button>
            </motion.div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-50 border border-red-100 rounded-[1.5rem] px-8 py-5 text-sm text-red-600 mb-8 font-serif italic flex items-center gap-3 shadow-sm"
                >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Protocol_Error: {error}
                </motion.div>
            )}

            {loading && (
                <div className="py-20 flex flex-col items-center">
                    <LoadingSpinner text="Intercepting signal flow and deciphering constructs..." />
                </div>
            )}

            {result && !loading && (
                <div className="space-y-12">
                    {/* Summary Decoded */}
                    <div className="flex flex-col gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-chalk-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                        <h2 className="text-2xl font-serif italic text-dark-950">{result.party} Summary</h2>
                                    </div>
                                    <p className="text-[10px] font-mono text-dark-400 uppercase tracking-widest">{result.state || 'National context'} • {result.summary?.total} ARTICLE_UNITS</p>
                                </div>
                                <button onClick={handleDownloadPDF} className="p-3 rounded-full hover:bg-chalk-50 transition-colors group relative">
                                    <Download className="w-5 h-5 text-dark-400 group-hover:text-primary-600 transition-colors" />
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                    </span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                {[
                                    { label: 'Positive', count: result.summary?.positive, color: '#16a34a' },
                                    { label: 'Neutral', count: result.summary?.neutral, color: '#71717a' },
                                    { label: 'Negative', count: result.summary?.negative, color: '#dc2626' },
                                ].map(({ label, count, color }) => (
                                    <div key={label} className="bg-[#fffcf8] border border-chalk-100 rounded-3xl p-5 text-center">
                                        <p className="text-2xl font-serif italic" style={{ color }}>{count}</p>
                                        <p className="text-[8px] font-black font-mono text-dark-300 uppercase tracking-widest mt-1 mb-2">{label}</p>
                                        <div className="h-1 bg-chalk-100 rounded-full overflow-hidden">
                                            <div className="h-full transition-all duration-1000" style={{ backgroundColor: color, width: `${calcPercentage(count, result.summary?.total)}%` }} />
                                        </div>
                                        <p className="text-[9px] font-bold mt-2" style={{ color }}>{calcPercentage(count, result.summary?.total)}%</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between py-4 border-t border-chalk-100">
                                <span className="text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono">Dominant Signal</span>
                                <SentimentBadge label={result.summary?.dominant_sentiment} score={result.summary?.avg_score} />
                            </div>

                            {result.insight && (
                                <div className="mt-8 p-6 bg-dark-950 rounded-[2rem] relative overflow-hidden group shadow-xl transition-all duration-500 hover:shadow-primary-500/10 border border-primary-500/20">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 scale-150"><Terminal className="w-24 h-24 text-primary-500" /></div>
                                    <div className="flex items-center gap-2 mb-4 relative z-10">
                                        <Bot className="w-4 h-4 text-primary-500" />
                                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.2em] font-mono">Decoded Output / Neural Insight</p>
                                    </div>
                                    <p className="text-white text-sm font-light font-serif italic leading-relaxed relative z-10">{result.insight}</p>
                                    <div className="mt-4 flex gap-1 relative z-10">
                                        <div className="w-1.5 h-px bg-primary-500/50" />
                                        <div className="w-1.5 h-px bg-primary-500/30" />
                                        <div className="w-1.5 h-px bg-primary-500/10" />
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/80 backdrop-blur-sm border border-chalk-200 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center blueprint-grid-subtle"
                        >
                            <h3 className="text-[9px] font-black text-dark-400 uppercase tracking-widest font-mono mb-6 self-start">Signal_Distribution / Mapping</h3>
                            <div className="w-full scale-105">
                                <SentimentPieChart data={result.summary} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Articles Feed */}
                    {result.articles?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-serif italic text-dark-950 flex items-center gap-3">
                                    <div className="w-6 h-px bg-primary-500" />
                                    Intercepted Artifacts
                                </h2>
                                <span className="text-[8px] font-mono text-dark-400 uppercase tracking-widest border border-chalk-200 px-3 py-1 rounded-full">INTERCEPT_LOG / {result.articles.length} UNITS</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {result.articles.map((a, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.05) }}
                                    >
                                        <ArticleCard article={a} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
