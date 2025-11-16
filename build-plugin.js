const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'ui.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Read the TypeScript file
const tsPath = path.join(__dirname, 'code.ts');
let tsContent = fs.readFileSync(tsPath, 'utf8');

// Use JSON.stringify to properly escape the HTML content
// This handles all special characters correctly, including quotes, backslashes, etc.
// Template literals in the HTML JavaScript will be preserved as strings and work when executed
const escapedHtml = JSON.stringify(htmlContent);

// Create an assignment for __html__ using a regular string assignment
// JSON.stringify already adds quotes and escapes everything properly
const htmlAssignment = `(globalThis as any).__html__ = ${escapedHtml};`;

// Remove any existing __html__ assignment first
// Match template literals (backticks) - can span multiple lines
tsContent = tsContent.replace(/\(globalThis as any\)\.__html__\s*=\s*`[\s\S]*?`\s*;/g, '');
// Match double-quoted strings (JSON.stringify output) - can be very long single line
// Use [\s\S] to match any character including newlines, but be careful with escaped quotes
tsContent = tsContent.replace(/\(globalThis as any\)\.__html__\s*=\s*"[\s\S]*?"\s*;/g, '');
// More aggressive: match everything from __html__ = to the next semicolon on a new line or end of string
// This handles cases where the string might have issues
tsContent = tsContent.replace(/\(globalThis as any\)\.__html__\s*=\s*[^;]*?;\s*\n/g, '');
tsContent = tsContent.replace(/const __html__\s*=\s*[^;]+;/g, '');

// Remove any leftover corrupted lines that start with escaped characters from the HTML string
// These are lines that start with \n\t or similar escaped sequences
tsContent = tsContent.replace(/^\s*\\n\\t[^\n]*$/gm, '');
tsContent = tsContent.replace(/^\s*\\n[^\n]*$/gm, '');

// Now inject the HTML at the top of the file (after comments)
const lines = tsContent.split('\n');
let insertIndex = 0;
// Find where to insert (after any comments at the start)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('//')) {
    insertIndex = i + 1;
  } else if (lines[i].trim().length > 0 && !lines[i].trim().startsWith('//')) {
    break;
  }
}
lines.splice(insertIndex, 0, htmlAssignment);
tsContent = lines.join('\n');

// Write back to the file
fs.writeFileSync(tsPath, tsContent, 'utf8');

console.log('✓ Injected HTML into code.ts');

