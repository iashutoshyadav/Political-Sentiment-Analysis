import SentimentBadge from './SentimentBadge';
import { truncate, formatDate } from '../utils/helpers';
import { getPartyColor } from '../utils/colors';

export default function ArticleCard({ article }) {
    const { title, description, source, published_at, sentiment_label, sentiment_score, party, url } = article;
    const partyColor = getPartyColor(party);

    return (
        <div className="glass rounded-xl p-4 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 group animate-fade-in flex flex-col h-full">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0" style={{ background: `${partyColor}25`, color: partyColor, border: `1px solid ${partyColor}40` }}>
                        {party}
                    </span>
                    {source && (
                        <span className="text-[11px] text-slate-400 font-medium tracking-wide flex-shrink-0">{source}</span>
                    )}
                    {published_at && (
                        <span className="text-[11px] text-slate-500 flex-shrink-0">{formatDate(published_at)}</span>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <SentimentBadge label={sentiment_label} score={sentiment_score} />
                </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-100 mb-1.5 leading-snug group-hover:text-white transition-colors flex-grow">
                {title}
            </h3>

            {description && (
                <p className="text-[13px] text-slate-400 leading-relaxed mb-1">{truncate(description, 110)}</p>
            )}

            {url && url !== '#' && (
                <div className="mt-auto pt-2">
                    <a href={url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
                        Read full article →
                    </a>
                </div>
            )}
        </div>
    );
}
