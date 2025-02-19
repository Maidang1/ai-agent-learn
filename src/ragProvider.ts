import fs from 'fs';
import path from 'path';

export function getRAGContext() {
  // Read index.txt from the project root
  const filePath = path.join(__dirname, '..', 'index.txt');
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error("Error reading index.txt:", err);
    return "";
  }
}
