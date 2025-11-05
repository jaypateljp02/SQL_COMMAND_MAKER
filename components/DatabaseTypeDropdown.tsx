import React from 'react';

export type DatabaseType = 'sql' | 'postgresql' | 'mongodb';

interface DatabaseTypeDropdownProps {
  value: DatabaseType;
  onChange: (type: DatabaseType) => void;
  disabled?: boolean;
}

export const DatabaseTypeDropdown: React.FC<DatabaseTypeDropdownProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-semibold text-gray-300 whitespace-nowrap">Database Type:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DatabaseType)}
        disabled={disabled}
        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="sql">SQL (Generic)</option>
        <option value="postgresql">PostgreSQL</option>
        <option value="mongodb">MongoDB</option>
      </select>
    </div>
  );
};

