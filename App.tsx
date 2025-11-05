
import React, { useState, useRef, useEffect } from 'react';
import { generateCommand } from './services/geminiService';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { SqlCommandList } from './components/SqlCommandList';
import type { DatabaseType } from './components/DatabaseTypeDropdown';
import { TableVisualization } from './components/TableVisualization';
import type { HistoryItem, TableData } from './types';
import { DatabaseIcon } from './components/icons/DatabaseIcon';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentCommand, setCurrentCommand] = useState<string>('');
  const [currentTableData, setCurrentTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [databaseType, setDatabaseType] = useState<DatabaseType>('sql');

  const visualizationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length > 0) {
      visualizationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handlePromptSubmit = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setCurrentCommand(`// Generating ${databaseType.toUpperCase()}...`);
    setCurrentTableData(null);

    try {
      const response = await generateCommand(prompt, history, databaseType);
      
      const newHistoryItem: HistoryItem = {
        prompt,
        command: response.command,
        explanation: response.explanation,
        tableData: response.tableData,
        databaseType
      };

      setHistory(prevHistory => [...prevHistory, newHistoryItem]);
      setCurrentCommand(response.command);
      setCurrentTableData(response.tableData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate ${databaseType.toUpperCase()} command. ${errorMessage}`);
      setCurrentCommand(`// Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const latestHistoryItem = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-900 text-gray-200">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Main Content: Google Translate-like Layout */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Natural Language Prompt */}
            <div className="w-full lg:w-1/2 p-4 border-r border-gray-700">
              <PromptInput onSubmit={handlePromptSubmit} isLoading={isLoading} />
            </div>

            {/* Right: Generated SQL List */}
            <div className="w-full lg:w-1/2 p-4">
              <SqlCommandList 
                history={history}
                currentCommand={currentCommand} 
                isLoading={isLoading}
                databaseType={databaseType}
                onDatabaseTypeChange={setDatabaseType}
              />
            </div>
          </div>

          {/* Bottom: Explanation and Visualization */}
          <div className="border-t border-gray-700 overflow-y-auto max-h-[300px]">
            <div className="p-4 flex flex-col gap-4">
              {/* Explanation Section */}
              {latestHistoryItem?.explanation && !isLoading && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400">{latestHistoryItem.explanation}</p>
                </div>
              )}
              
              {/* Visualization Section */}
              <div ref={visualizationRef} className="flex flex-col">
                <h2 className="text-lg font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <DatabaseIcon />
                  Database Visualization
                </h2>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 overflow-auto">
                  <TableVisualization data={latestHistoryItem?.tableData || null} isLoading={isLoading}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
