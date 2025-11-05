
import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import type { DatabaseType } from './DatabaseTypeDropdown';

interface SqlDisplayProps {
  command: string;
  isLoading: boolean;
  databaseType: DatabaseType;
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

const getPlaceholderText = (dbType: DatabaseType): string => {
  switch (dbType) {
    case 'sql':
      return '// SQL will appear here...';
    case 'postgresql':
      return '// PostgreSQL command will appear here...';
    case 'mongodb':
      return '// MongoDB command will appear here...';
    default:
      return '// Command will appear here...';
  }
};

export const SqlDisplay: React.FC<SqlDisplayProps> = ({ command, isLoading, databaseType }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    if (command) {
      navigator.clipboard.writeText(command);
      setCopied(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h2 className="text-md font-semibold text-gray-300">{getDisplayTitle(databaseType)}</h2>
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                disabled={!command || isLoading}
            >
                <CopyIcon />
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
        <pre className="p-3 flex-1 overflow-auto">
            <code className="text-sm text-cyan-300 whitespace-pre-wrap font-mono">
                {isLoading && !command ? `// Generating ${databaseType.toUpperCase()}...` : command || getPlaceholderText(databaseType)}
            </code>
        </pre>
    </div>
  );
};
