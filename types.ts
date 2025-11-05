
import type { DatabaseType } from './components/DatabaseTypeDropdown';

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface HistoryItem {
  prompt: string;
  command: string;
  explanation: string;
  tableData: TableData;
  databaseType: DatabaseType;
}

export interface GeminiResponse {
  command: string;
  explanation: string;
  tableData: TableData;
}
