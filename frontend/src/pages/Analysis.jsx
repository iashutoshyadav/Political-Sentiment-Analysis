import { useState } from 'react';
import { sentimentService } from '../services/sentimentService';
import ArticleCard from '../components/ArticleCard';
import { SentimentPieChart } from '../components/ChartSection';
import SentimentBadge from '../components/SentimentBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { PARTIES, STATES } from '../utils/constants';
import { calcPercentage } from '../utils/helpers';
import { Search, Rocket, Download, Bot } from 'lucide-react';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="mb-4">
                <h1 className="page-header flex items-center gap-3"><Search className="w-8 h-8 text-blue-500" /> Sentiment Analysis</h1>
                <p className="page-subheader mb-4">Select a party and state to analyze political news sentiment</p>
            </div>

            {/* Controls */}
            <div className="card mb-6 animate-slide-up">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Political Party</label>
                        <select className="select-field text-sm py-2 px-3" value={party} onChange={e => setParty(e.target.value)}>
                            {PARTIES.map(p => <option key={p.id} value={p.id}>{p.short} — {p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">State / Region</label>
                        <select className="select-field" value={state} onChange={e => setState(e.target.value)}>
                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Articles to Analyze</label>
                        <select className="select-field" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                            {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} articles</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={handleAnalyze} disabled={loading} className="btn-primary flex items-center justify-center gap-2">
                    {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Analyzing...</> : <><Rocket className="w-4 h-4" /> Run Analysis</>}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-sm text-red-400 mb-6">{error}</div>
            )}

            {loading && <LoadingSpinner text="Fetching news and analyzing sentiment..." />}

            {result && !loading && (
                <div className="animate-fade-in space-y-8">
                    {/* Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-white">{result.party} Analysis</h2>
                                    <p className="text-sm text-slate-400">{result.state || 'All States'} • {result.summary?.total} articles</p>
                                </div>
                                <button onClick={handleDownloadPDF} className="btn-secondary text-xs flex items-center gap-2">
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                    { label: 'Positive', count: result.summary?.positive, color: '#22c55e', bg: '#22c55e15' },
                                    { label: 'Neutral', count: result.summary?.neutral, color: '#f59e0b', bg: '#f59e0b15' },
                                    { label: 'Negative', count: result.summary?.negative, color: '#ef4444', bg: '#ef444415' },
                                ].map(({ label, count, color, bg }) => (
                                    <div key={label} className="rounded-xl p-3 text-center" style={{ background: bg, border: `1px solid ${color}25` }}>
                                        <p className="text-xl font-bold" style={{ color }}>{count}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                                        <p className="text-xs font-semibold mt-0.5" style={{ color }}>
                                            {calcPercentage(count, result.summary?.total)}%
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between py-3 border-t border-slate-700/50">
                                <span className="text-xs text-slate-400">Dominant Sentiment</span>
                                <SentimentBadge label={result.summary?.dominant_sentiment} score={result.summary?.avg_score} />
                            </div>

                            {result.insight && (
                                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Bot className="w-16 h-16 text-blue-500" /></div>
                                    <p className="text-xs font-semibold text-blue-400 mb-2 flex items-center gap-1.5"><Bot className="w-4 h-4" /> AI Insight</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{result.insight}</p>
                                </div>
                            )}
                        </div>

                        <div className="chart-container">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">Sentiment Distribution</h3>
                            <SentimentPieChart data={result.summary} />
                        </div>
                    </div>

                    {/* Articles */}
                    {result.articles?.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4">Analyzed Articles ({result.articles.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {result.articles.map((a, i) => <ArticleCard key={i} article={a} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
