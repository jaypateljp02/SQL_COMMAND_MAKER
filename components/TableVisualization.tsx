
import React from 'react';
import type { TableData } from '../types';

interface TableVisualizationProps {
  data: TableData | null;
  isLoading: boolean;
}

export const TableVisualization: React.FC<TableVisualizationProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="text-center text-gray-400">Loading visualization...</div>;
  }

  if (!data || !data.headers || data.headers.length === 0) {
    return <div className="text-center text-gray-500">No table to display. Your visualization will appear here after generating SQL.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
          <tr>
            {data.headers.map((header, index) => (
              <th key={index} scope="col" className="px-4 py-2 font-medium tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.length === 0 ? (
            <tr>
              <td colSpan={data.headers.length} className="text-center py-4 text-gray-500 italic">
                Table created, no rows yet.
              </td>
            </tr>
          ) : (
            data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-gray-800/30 border-b border-gray-700 hover:bg-gray-700/50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
