
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-gray-800/30 border-b border-gray-700 p-4">
      <h1 className="text-xl font-bold text-center text-cyan-400">
        Natural Language to Database Query Translator
      </h1>
    </header>
  );
};
