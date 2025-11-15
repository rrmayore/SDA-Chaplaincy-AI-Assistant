import React, { useState } from 'react';
import type { AIResponseData, EllenGWhiteQuote } from '../types';
import { BookOpenIcon, SparklesIcon, ListChecksIcon, InfoIcon, SearchIcon, ClipboardIcon, CheckIcon } from './icons';
import { searchEllenGWhiteWritings } from '../services/geminiService';

interface ResourcePanelProps {
  data: AIResponseData | null;
  isLoading: boolean;
}

const ResourceCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-slate-800/50 rounded-lg p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="text-cyan-400">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
    </div>
    <div className="space-y-3 text-slate-300 text-sm">{children}</div>
  </div>
);

const SkeletonLoader: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="bg-slate-800/50 rounded-lg p-5">
            <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
             <div className="space-y-3 mt-4">
                <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-5">
            <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                 <div className="h-4 bg-slate-700 rounded w-1/4 self-end mt-1 ml-auto"></div>
            </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-5">
            <div className="h-6 bg-slate-700 rounded w-2/5 mb-4"></div>
             <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
            </div>
        </div>
    </div>
);

const EGWSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<EllenGWhiteQuote[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);
        setSearched(true);
        setResults([]);

        try {
            const searchResults = await searchEllenGWhiteWritings(query);
            setResults(searchResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during the search.');
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleCopy = (quote: EllenGWhiteQuote, index: number) => {
        const textToCopy = `"${quote.text}" — ${quote.source}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000); // Reset icon after 2 seconds
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };

    return (
        <ResourceCard icon={<SearchIcon className="w-6 h-6" />} title="Search Spirit of Prophecy">
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'faith and prayer'"
                    className="flex-grow bg-slate-700 text-slate-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isSearching}
                />
                <button
                    type="submit"
                    disabled={isSearching || !query.trim()}
                    className="px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isSearching ? '...' : 'Search'}
                </button>
            </form>

            {isSearching && (
                 <div className="text-center p-4">
                    <p className="text-slate-400">Searching...</p>
                 </div>
            )}
            
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {!isSearching && searched && results.length === 0 && !error && (
                <p className="text-slate-400 text-center p-4">No quotes found for your query.</p>
            )}

            {results.length > 0 && (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {results.map((quote, i) => (
                         <blockquote key={i} className="border-l-2 border-slate-600 pl-3 pr-8 relative group">
                           <p className="italic">"{quote.text}"</p>
                           <footer className="text-right text-xs text-slate-400 mt-1">— {quote.source}</footer>
                           <button
                             onClick={() => handleCopy(quote, i)}
                             className="absolute top-0 right-0 p-1.5 rounded-full text-slate-400 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                             aria-label="Copy quote"
                           >
                            {copiedIndex === i ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                           </button>
                         </blockquote>
                    ))}
                </div>
            )}
        </ResourceCard>
    );
};

const ResourcePanel: React.FC<ResourcePanelProps> = ({ data, isLoading }) => {
  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Resource Hub</h2>
      
      {isLoading && <SkeletonLoader />}

      {!isLoading && !data && (
        <div className="flex flex-col items-center justify-center h-4/5 text-center text-slate-500">
            <InfoIcon className="w-12 h-12 mb-4"/>
            <p className="text-lg font-semibold">Resources will appear here.</p>
            <p className="mt-1">Once you send a message, the AI will generate relevant resources for your session.</p>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {data.scripture?.length > 0 && (
            <ResourceCard icon={<BookOpenIcon className="w-6 h-6" />} title="Relevant Scripture">
              {data.scripture.map((s, i) => (
                <div key={i} className="border-l-2 border-slate-600 pl-3">
                  <p className="font-semibold text-slate-100">{s.reference}</p>
                  <p className="italic">"{s.text}"</p>
                </div>
              ))}
            </ResourceCard>
          )}

          {data.ellenGWhiteQuote?.length > 0 && (
            <ResourceCard icon={<SparklesIcon className="w-6 h-6" />} title="Spirit of Prophecy (E.G. White)">
               {data.ellenGWhiteQuote.map((q, i) => (
                <blockquote key={i} className="border-l-2 border-slate-600 pl-3">
                  <p className="italic">"{q.text}"</p>
                  <footer className="text-right text-xs text-slate-400 mt-1">— {q.source}</footer>
                </blockquote>
              ))}
            </ResourceCard>
          )}

          <EGWSearch />

          {data.practicalSteps?.length > 0 && (
            <ResourceCard icon={<ListChecksIcon className="w-6 h-6" />} title="Practical Steps">
              <ul className="list-disc list-inside space-y-2">
                {data.practicalSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </ResourceCard>
          )}

           {data.additionalResources?.length > 0 && (
            <ResourceCard icon={<InfoIcon className="w-6 h-6" />} title="Additional Resources">
              {data.additionalResources.map((res, i) => (
                <div key={i}>
                  <p className="font-semibold text-slate-100">{res.title}</p>
                  <p>{res.description}</p>
                </div>
              ))}
            </ResourceCard>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourcePanel;