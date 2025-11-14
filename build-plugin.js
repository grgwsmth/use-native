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
// The JSON.stringify creates a very long single-line string, so we need to match it carefully
// Match from (globalThis as any).__html__ = to the semicolon, handling very long strings
// Use non-greedy matching but ensure we get the whole assignment
tsContent = tsContent.replace(/\(globalThis as any\)\.__html__\s*=\s*`[\s\S]*?`\s*;/g, '');
// For JSON.stringify'd strings, they're on one line but very long - match until semicolon
tsContent = tsContent.replace(/\(globalThis as any\)\.__html__\s*=\s*"[^"]*"\s*;/g, '');
// More aggressive: match everything from __html__ = to the next semicolon (non-greedy)
tsContent = tsContent.replace(/\(globalThis as any\)\.__html__\s*=\s*[^;]+;/g, '');
tsContent = tsContent.replace(/const __html__\s*=\s*[^;]+;/g, '');

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

