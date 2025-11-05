
import React, { useEffect, useRef } from 'react';
import type { HistoryItem } from '../types';
import { CopyIcon } from './icons/CopyIcon';

const HistoryItemDisplay: React.FC<{ item: HistoryItem }> = ({ item }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(item.command);
    };

    const getDbTypeLabel = (dbType: string) => {
        switch (dbType) {
            case 'sql': return 'SQL';
            case 'postgresql': return 'PostgreSQL';
            case 'mongodb': return 'MongoDB';
            default: return dbType.toUpperCase();
        }
    };

    return (
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-300">Prompt:</span> {item.prompt}
                </p>
                <span className="text-xs px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded">
                    {getDbTypeLabel(item.databaseType)}
                </span>
            </div>
            <div className="relative bg-gray-900/50 p-2 rounded">
                 <pre className="text-xs text-cyan-400 font-mono overflow-x-auto">
                    <code>{item.command}</code>
                </pre>
                <button
                    onClick={handleCopy}
                    className="absolute top-1 right-1 p-1 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded"
                    aria-label="Copy Command"
                >
                    <CopyIcon className="w-3 h-3"/>
                </button>
            </div>
        </div>
    );
};

interface HistoryLogProps {
    history: HistoryItem[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
    const endOfHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    return (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2">
            <h2 className="text-lg font-semibold text-gray-300 sticky top-0 bg-gray-900 py-2">Conversation History</h2>
            {history.length === 0 ? (
                <p className="text-gray-500">Your conversation history will appear here.</p>
            ) : (
                history.map((item, index) => <HistoryItemDisplay key={index} item={item} />)
            )}
            <div ref={endOfHistoryRef} />
        </div>
    );
};
