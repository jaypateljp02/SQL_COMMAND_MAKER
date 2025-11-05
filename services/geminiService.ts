
import { GoogleGenAI, Type } from "@google/genai";
import type { HistoryItem, GeminiResponse } from '../types';
import type { DatabaseType } from '../components/DatabaseTypeDropdown';

const getApiKey = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please set GEMINI_API_KEY in your .env.local file");
  }
  return apiKey;
};

let aiInstance: GoogleGenAI | null = null;

const getAiInstance = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return aiInstance;
};

const getSystemInstruction = (databaseType: DatabaseType): string => {
  const baseInstruction = `You are an expert database command generator. Your task is to translate natural language requests into appropriate database commands.

IMPORTANT: Understand user intent from simple, natural language. Users may say things like:
- "create a users table" (meaning CREATE TABLE)
- "add a user" (meaning INSERT)
- "show all users" (meaning SELECT)
- "remove users with id 5" (meaning DELETE)
- "update user email" (meaning UPDATE)
- "find products cheaper than 100" (meaning SELECT with WHERE clause)

You must respond with a JSON object that adheres to the provided schema.
The JSON object must contain three properties: 'command', 'explanation', and 'tableData'.

1. 'command': The generated database command as a string. This should be the actual executable command for the selected database type.
2. 'explanation': A brief, user-friendly explanation of what the command does.
3. 'tableData': A JSON object representing the state of the database *after* the command is executed. This object must have 'headers' (an array of strings for column/field names) and 'rows' (an array of arrays, where each inner array is a row/document of data).

For CREATE operations: 'tableData' should show the new table/collection with its columns/fields and zero rows/documents.
For INSERT operations: 'tableData' should show the table/collection with the new row/document added.
For SELECT/FIND operations: 'tableData' should contain the results of the query.
For DELETE operations: 'tableData' should show the table/collection after the row/document has been removed.
For UPDATE operations: 'tableData' should show the table/collection with the updated data.

Base your responses on the provided conversation history to handle iterative requests.`;

  const dbSpecificInstructions: Record<DatabaseType, string> = {
    sql: `Generate standard SQL commands (ANSI SQL). Examples:
- CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100));
- INSERT INTO users (name, email) VALUES ('John', 'john@example.com');
- SELECT * FROM users WHERE age > 25;
- UPDATE users SET email = 'new@example.com' WHERE id = 1;
- DELETE FROM users WHERE id = 5;`,

    postgresql: `Generate PostgreSQL-specific SQL commands. Use PostgreSQL syntax and features:
- CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100));
- INSERT INTO users (name, email) VALUES ('John', 'john@example.com') RETURNING *;
- SELECT * FROM users WHERE age > 25 ORDER BY name;
- UPDATE users SET email = 'new@example.com' WHERE id = 1 RETURNING *;
- DELETE FROM users WHERE id = 5 RETURNING *;
You can use PostgreSQL-specific features like SERIAL, JSONB, ARRAY types, etc.`,

    mongodb: `Generate MongoDB commands using the MongoDB shell syntax or JavaScript. Examples:
- db.users.insertOne({name: "John", email: "john@example.com"})
- db.users.find({age: {$gt: 25}})
- db.users.updateOne({_id: ObjectId("...")}, {$set: {email: "new@example.com"}})
- db.users.deleteOne({_id: ObjectId("...")})
- db.users.createIndex({email: 1})
For collections, use db.collectionName syntax. For tableData visualization, map MongoDB documents to the headers/rows format.`
  };

  return `${baseInstruction}\n\n${dbSpecificInstructions[databaseType]}`;
};

export const generateCommand = async (
  prompt: string, 
  history: HistoryItem[], 
  databaseType: DatabaseType
): Promise<GeminiResponse> => {
  try {
    const chatHistory = history
      .filter(item => item.databaseType === databaseType)
      .map(item => 
        `User: "${item.prompt}"\nAI Command: \`${item.command}\``
      ).join('\n\n');
    
    const historyContext = chatHistory 
      ? `Based on the following history:\n${chatHistory}\n\n`
      : '';
    
    const fullPrompt = `${historyContext}Generate the ${databaseType.toUpperCase()} command for this natural language request: "${prompt}"

Remember: Understand the user's intent from simple language. Don't require them to specify exact keywords like "CREATE", "INSERT", etc.`;

    const ai = getAiInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: getSystemInstruction(databaseType),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            command: { type: Type.STRING },
            explanation: { type: Type.STRING },
            tableData: {
              type: Type.OBJECT,
              properties: {
                headers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                rows: {
                  type: Type.ARRAY,
                  items: { 
                    type: Type.ARRAY,
                    items: {
                        // Loosening this to allow multiple types, since Gemini may return strings or numbers
                        type: Type.STRING 
                    }
                  }
                }
              },
              required: ['headers', 'rows']
            }
          },
          required: ['command', 'explanation', 'tableData']
        }
      }
    });

    const responseText = response.text.trim();
    const parsedResponse: GeminiResponse = JSON.parse(responseText);
    
    // A little bit of data cleaning for the rows which are expected to be (string|number)[]
    if (parsedResponse.tableData && parsedResponse.tableData.rows) {
      parsedResponse.tableData.rows = parsedResponse.tableData.rows.map(row => 
        row.map(cell => !isNaN(Number(cell)) && cell !== '' ? Number(cell) : cell)
      );
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};

// Legacy export for backward compatibility
export const generateSql = generateCommand;
