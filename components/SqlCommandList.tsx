import React, { useState, useEffect, useRef } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import type { HistoryItem } from '../types';
import type { DatabaseType } from './DatabaseTypeDropdown';

interface SqlCommandListProps {
  history: HistoryItem[];
  currentCommand: string;
  isLoading: boolean;
  databaseType: DatabaseType;
  onDatabaseTypeChange: (type: DatabaseType) => void;
}

const getDisplayTitle = (dbType: DatabaseType): string => {
  switch (dbType) {
    case 'sql':
      return 'Generated SQL';
    case 'postgresql':
      return 'Generated PostgreSQL';
    case 'mongodb':
      return 'Generated MongoDB';
    default:
      return 'Generated Command';
  }
};

export const SqlCommandList: React.FC<SqlCommandListProps> = ({ 
  history, 
  currentCommand, 
  isLoading, 
  databaseType,
  onDatabaseTypeChange
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const endOfListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (history.length > 0 || currentCommand) {
      endOfListRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, currentCommand]);

  useEffect(() => {
    if (copiedIndex !== null) {
      const timer = setTimeout(() => setCopiedIndex(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedIndex]);

  const handleCopy = (command: string, index: number) => {
    if (command) {
      navigator.clipboard.writeText(command);
      setCopiedIndex(index);
    }
  };

  const allCommands = history.map(item => item.command).filter(cmd => cmd && !cmd.includes('Generating') && !cmd.includes('Error'));

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-300">{getDisplayTitle(databaseType)}</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 whitespace-nowrap">Database Type:</label>
          <select
            value={databaseType}
            onChange={(e) => onDatabaseTypeChange(e.target.value as DatabaseType)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="sql">SQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading && currentCommand.includes('Generating') && (
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <svg className="animate-spin h-4 w-4 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-400">Generating...</span>
            </div>
            <pre className="text-sm text-cyan-300 whitespace-pre-wrap font-mono">
              <code>{currentCommand}</code>
            </pre>
          </div>
        )}
        
        {allCommands.length === 0 && !isLoading ? (
          <p className="text-gray-500 text-sm text-center py-8">
            Generated commands will appear here
          </p>
        ) : (
          allCommands.map((command, index) => {
            if (!command || command.includes('Generating') || command.includes('Error')) {
              return null;
            }
            return (
              <div 
                key={index} 
                className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors relative group"
              >
                <button
                  onClick={() => handleCopy(command, index)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy command"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
                <pre className="text-sm text-cyan-300 whitespace-pre-wrap font-mono pr-8">
                  <code>{command}</code>
                </pre>
                {copiedIndex === index && (
                  <div className="absolute top-2 right-2 text-xs text-green-400 bg-green-900/50 px-2 py-1 rounded">
                    Copied!
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={endOfListRef} />
      </div>
    </div>
  );
};

