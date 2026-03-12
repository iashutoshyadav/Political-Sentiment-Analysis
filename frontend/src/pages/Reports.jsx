import { useEffect, useState } from 'react';
import { sentimentService } from '../services/sentimentService';
import SentimentBadge from '../components/SentimentBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import { FileText, Download, Activity } from 'lucide-react';

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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="page-header flex items-center gap-3"><FileText className="w-8 h-8 text-blue-500" /> Analysis Reports</h1>
                <p className="page-subheader">Download PDF reports for your historical analyses</p>
            </div>

            {loading ? <LoadingSpinner text="Loading history..." /> : (
                <>
                    {history.length === 0 ? (
                        <div className="card text-center py-16 flex flex-col items-center">
                            <div className="mb-4 text-slate-400 bg-slate-800/50 p-4 rounded-full inline-flex"><Activity className="w-10 h-10" /></div>
                            <h3 className="text-lg font-semibold text-white mb-2">No reports yet</h3>
                            <p className="text-slate-400 text-sm">Run an analysis first to generate downloadable reports.</p>
                        </div>
                    ) : (
                        <div className="card p-0 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-slate-300">{history.length} Analyses Found</h2>
                                <span className="text-xs text-slate-500">Click to download PDF</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700/50 bg-slate-800/30">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Party</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">State</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dominant</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Count</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pos/Neu/Neg</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">PDF</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((a, i) => (
                                            <tr key={a.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 text-xs">{i + 1}</td>
                                                <td className="px-6 py-4 font-semibold text-blue-400">{a.party}</td>
                                                <td className="px-6 py-4 text-slate-400">{a.state || 'All States'}</td>
                                                <td className="px-6 py-4">
                                                    <SentimentBadge label={a.dominant_sentiment} />
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{a.total_articles}</td>
                                                <td className="px-6 py-4 text-xs">
                                                    <span className="text-green-400">{a.positive_count}</span>
                                                    <span className="text-slate-600 mx-1">/</span>
                                                    <span className="text-amber-400">{a.neutral_count}</span>
                                                    <span className="text-slate-600 mx-1">/</span>
                                                    <span className="text-red-400">{a.negative_count}</span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs"
                                                    style={{ color: a.avg_sentiment_score > 0 ? '#22c55e' : a.avg_sentiment_score < 0 ? '#ef4444' : '#94a3b8' }}>
                                                    {a.avg_sentiment_score > 0 ? '+' : ''}{a.avg_sentiment_score?.toFixed(3)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(a.created_at)}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleDownload(a)} disabled={downloading === a.id}
                                                        className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                                                        {downloading === a.id ? (
                                                            <><span className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> Generating...</>
                                                        ) : (
                                                            <><Download className="w-3.5 h-3.5" /> PDF</>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
