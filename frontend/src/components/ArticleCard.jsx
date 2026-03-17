import SentimentBadge from './SentimentBadge';
import { truncate, formatDate } from '../utils/helpers';
import { getPartyColor } from '../utils/colors';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';

export default function ArticleCard({ article }) {
    const { title, description, source, published_at, sentiment_label, sentiment_score, party, url, urlToImage } = article;
    const partyColor = getPartyColor(party);

    return (
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] hover:border-primary-500/30 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] group flex flex-col h-full relative overflow-hidden">
            {/* Image Header */}
            <div className="relative h-48 overflow-hidden bg-chalk-100">
                {urlToImage ? (
                    <img 
                        src={urlToImage} 
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800'; }}
                    />
                ) : (
                    <div className="w-full h-full blueprint-grid opacity-20 flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-dark-300" />
                    </div>
                )}
                
                {/* Technical Overlay */}
                <div className="absolute top-4 left-4 z-20">
                    <span className="text-[7px] font-black font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-dark-950/80 text-primary-500 backdrop-blur-sm border border-white/10">
                        Signal_Aperture
                    </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <div className="p-6 flex flex-col flex-grow relative z-10">
                {/* Hover Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
                
                <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                    <div className="flex flex-col gap-2">
                        <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg w-fit" 
                              style={{ background: `${partyColor}10`, color: partyColor, border: `1px solid ${partyColor}20` }}>
                            {party}
                        </span>
                        <div className="flex items-center gap-2 opacity-60">
                             <Newspaper className="w-2.5 h-2.5" />
                             <span className="text-[10px] font-mono text-dark-500 uppercase tracking-tighter">{source || 'Unknown_Src'}</span>
                        </div>
                    </div>
                    <SentimentBadge label={sentiment_label} score={sentiment_score} />
                </div>

                <h3 className="text-base font-serif italic text-dark-950 mb-3 leading-snug group-hover:text-primary-600 transition-colors flex-grow">
                    {title}
                </h3>

                {description && (
                    <p className="text-[13px] text-dark-500 font-light font-serif italic leading-relaxed mb-4 line-clamp-3">
                        {truncate(description, 130)}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-chalk-100 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="text-[9px] font-mono text-dark-300">{published_at ? formatDate(published_at) : 'RECENT_LOG'}</span>
                    </div>
                    
                    {url && url !== '#' && (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-dark-950 hover:text-primary-600 transition-colors uppercase tracking-widest">
                            DECIPHER_FULL <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
