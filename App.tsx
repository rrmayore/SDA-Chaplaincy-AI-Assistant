
import React, { useState, useCallback } from 'react';
import { SCENARIOS } from './constants';
import type { Scenario, Message, AIResponseData } from './types';
import { getChaplaincyResponse } from './services/geminiService';
import ScenarioSelector from './components/ScenarioSelector';
import ChatInterface from './components/ChatInterface';
import ResourcePanel from './components/ResourcePanel';
import { LogoIcon } from './components/icons';

export default function App(): React.ReactElement {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponseData, setAiResponseData] = useState<AIResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        role: 'assistant',
        content: `You've selected the "${scenario.title}" scenario. How can I assist you with ${scenario.description.toLowerCase()}? Please describe the situation you need help with.`,
      },
    ]);
    setAiResponseData(null);
    setError(null);
  };

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!selectedScenario || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);
    setAiResponseData(null);

    try {
      const response = await getChaplaincyResponse(selectedScenario, newMessages);
      setAiResponseData(response);
      setMessages([...newMessages, { role: 'assistant', content: response.response }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get response from AI. ${errorMessage}`);
      setMessages([...newMessages, { role: 'assistant', content: "I'm sorry, I encountered an error and couldn't process your request." }]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedScenario, messages, isLoading]);
  
  const resetChat = () => {
    setSelectedScenario(null);
    setMessages([]);
    setAiResponseData(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold text-slate-100">SDA Chaplaincy AI Assistant</h1>
        </div>
        {selectedScenario && (
            <button
                onClick={resetChat}
                className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
                New Session
            </button>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden">
        {!selectedScenario ? (
          <ScenarioSelector scenarios={SCENARIOS} onSelect={handleScenarioSelect} />
        ) : (
          <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
            <div className="lg:w-1/2 flex flex-col h-full overflow-y-auto">
               <ChatInterface
                    scenario={selectedScenario}
                    messages={messages}
                    isLoading={isLoading}
                    error={error}
                    onSendMessage={handleSendMessage}
                />
            </div>
            <div className="lg:w-1/2 lg:border-l border-t lg:border-t-0 border-slate-700 h-full overflow-y-auto bg-slate-900/50">
                <ResourcePanel data={aiResponseData} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
