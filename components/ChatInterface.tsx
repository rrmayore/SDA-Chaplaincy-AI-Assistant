import React, { useState, useRef, useEffect } from 'react';
import type { Message, Scenario, EllenGWhiteQuote } from '../types';
import { SendIcon, UserIcon, AssistantIcon, SparklesIcon, ClipboardIcon, CheckIcon, XIcon, InsertIcon } from './icons';
import { searchEllenGWhiteWritings } from '../services/geminiService';

// This is the search component, similar to the one in ResourcePanel,
// but designed as a pop-up within the chat interface.
const EGWChatSearch: React.FC<{ onClose: () => void; onInsertQuote: (quote: string) => void }> = ({ onClose, onInsertQuote }) => {
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
            setTimeout(() => setCopiedIndex(null), 2000);
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };

    const handleInsert = (quote: EllenGWhiteQuote) => {
        const textToInsert = `"${quote.text}" — ${quote.source}`;
        onInsertQuote(textToInsert);
    };

    return (
         <div className="absolute bottom-full left-0 right-0 mb-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 p-4 max-h-[50vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
                <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-cyan-400" />
                    Search Spirit of Prophecy
                </h4>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700" aria-label="Close search">
                    <XIcon className="w-5 h-5 text-slate-400" />
                </button>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2 mb-3 flex-shrink-0">
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
             <div className="flex-1 overflow-y-auto pr-2">
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
                    <div className="space-y-4">
                        {results.map((quote, i) => (
                             <blockquote key={i} className="border-l-2 border-slate-600 pl-3 pr-20 relative group text-sm">
                               <p className="italic">"{quote.text}"</p>
                               <footer className="text-right text-xs text-slate-400 mt-1">— {quote.source}</footer>
                               <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleInsert(quote)}
                                  className="p-1.5 rounded-full text-slate-400 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100"
                                  aria-label="Insert quote"
                                  title="Insert quote"
                                >
                                  <InsertIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCopy(quote, i)}
                                  className="p-1.5 rounded-full text-slate-400 bg-slate-800/50 hover:bg-slate-700 hover:text-slate-100"
                                  aria-label="Copy quote"
                                  title="Copy quote"
                                >
                                 {copiedIndex === i ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
                                </button>
                               </div>
                             </blockquote>
                        ))}
                    </div>
                )}
             </div>
        </div>
    );
};


interface ChatInterfaceProps {
    scenario: Scenario;
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    onSendMessage: (input: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ scenario, messages, isLoading, error, onSendMessage }) => {
    const [input, setInput] = useState('');
    const [showEgwSearch, setShowEgwSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
            setShowEgwSearch(false);
        }
    };

    const handleInsertQuote = (quoteText: string) => {
        setInput(prevInput => prevInput ? `${prevInput}\n\n${quoteText}`.trim() : quoteText);
        setShowEgwSearch(false);
        textareaRef.current?.focus();
    };


    return (
        <div className="flex flex-col h-full bg-slate-800">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">{scenario.title}</h2>
                <p className="text-sm text-slate-400">{scenario.description}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'assistant' && (
                           <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                                <AssistantIcon className="w-5 h-5 text-white" />
                           </div>
                        )}
                        <div className={`max-w-lg p-4 rounded-xl ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                         {message.role === 'user' && (
                           <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-5 h-5 text-white" />
                           </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                            <AssistantIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-lg p-4 rounded-xl bg-slate-700 text-slate-200 rounded-bl-none">
                           <div className="flex items-center justify-center gap-2">
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {error && <div className="p-4 text-center text-sm text-red-400 bg-red-900/50 mx-4 mb-2 rounded-md">{error}</div>}

            <div className="p-4 border-t border-slate-700 relative">
                 {showEgwSearch && <EGWChatSearch onClose={() => setShowEgwSearch(false)} onInsertQuote={handleInsertQuote} />}
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setShowEgwSearch(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                             if (e.key === 'Escape') {
                                setShowEgwSearch(false);
                            }
                        }}
                        placeholder="Describe the situation..."
                        className="w-full bg-slate-700 text-slate-200 rounded-lg p-3 pr-24 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none overflow-y-auto"
                        rows={1}
                        style={{maxHeight: '120px'}}
                        disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                         <button
                            type="button"
                            onClick={() => setShowEgwSearch(s => !s)}
                            className="p-2 rounded-full text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                            aria-label="Search Spirit of Prophecy"
                            title="Search Spirit of Prophecy"
                            >
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-cyan-600 text-white disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;