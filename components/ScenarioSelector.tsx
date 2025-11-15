
import React from 'react';
import type { Scenario } from '../types';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ scenarios, onSelect }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 bg-slate-900">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Welcome, Chaplain</h2>
          <p className="mt-3 text-lg text-slate-400">Please select a ministry focus area to begin.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className="group bg-slate-800 p-6 rounded-lg text-left hover:bg-slate-700/80 transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-700 p-3 rounded-full group-hover:bg-cyan-600 transition-colors duration-300">
                   <scenario.icon className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-100">{scenario.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{scenario.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelector;
