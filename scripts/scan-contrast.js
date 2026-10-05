const fs = require('fs');
const path = require('path');

const darkBgs = ['bg-zinc-800', 'bg-zinc-900', 'bg-zinc-950', 'bg-black', 'bg-primary', 'bg-text-main', 'bg-neutral-800', 'bg-neutral-900', 'bg-neutral-950', 'bg-secondary'];
const darkTexts = ['text-zinc-400', 'text-zinc-500', 'text-zinc-600', 'text-zinc-700', 'text-zinc-800', 'text-zinc-900', 'text-zinc-950', 'text-neutral-400', 'text-neutral-500', 'text-neutral-600', 'text-neutral-700', 'text-neutral-800', 'text-neutral-900', 'text-neutral-950', 'text-text-main', 'text-app-text', 'text-text-muted', 'text-app-muted', 'text-black'];

function getFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = [...getFiles('app'), ...getFiles('components')];
let matches = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check className attributes
    const classMatches = line.match(/className=(?:["']([^"']+)["']|\{`([^`]+)`\}|\{cn\(([^)]+)\)\})/g);
    if (classMatches) {
      classMatches.forEach(cm => {
        // Extract plain class string tokens
        const tokens = cm.replace(/hover:[^\s"'\`]+/g, '').replace(/focus:[^\s"'\`]+/g, '').split(/[\s,"'`]+/);
        const hasDarkBg = tokens.some(t => darkBgs.includes(t));
        const hasDarkText = tokens.some(t => darkTexts.includes(t));

        if (hasDarkBg && hasDarkText) {
          matches.push(`${file}:${idx + 1}: [Dark BG + Dark Text] ${line.trim()}`);
        }
      });
    }

    // Check Button usages with conflicting bg or text
    if (line.includes('<Button')) {
      const tokens = line.split(/[\s,"'`]+/);
      const hasDarkBgInButton = tokens.some(t => darkBgs.includes(t));
      const hasDarkTextInButton = tokens.some(t => darkTexts.includes(t));
      if (hasDarkBgInButton || hasDarkTextInButton) {
        matches.push(`${file}:${idx + 1}: [Button Conflict] ${line.trim()}`);
      }
    }
  });
});

console.log(`Total scan matches found: ${matches.length}`);
matches.slice(0, 40).forEach(m => console.log(m));
