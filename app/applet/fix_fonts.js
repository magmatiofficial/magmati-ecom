const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

const fontRegex = /(?:([a-zA-Z0-9_-]+):)?(text-\[[0-9.]+(?:px|rem)\]|text-3xs|text-4xs)/g;

let filesChanged = 0;

['app', 'components'].forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, filePath => {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      const newContent = content.replace(fontRegex, (match, prefix, token) => {
        let mapped = token;
        if (/^(text-\[([0-7]|8|9|10)px\]|text-3xs|text-4xs)$/.test(token)) {
          mapped = 'text-2xs';
        } else if (token === 'text-[11px]') {
          mapped = 'text-xs';
        } else if (token === 'text-[13px]') {
          mapped = 'text-sm';
        } else if (token === 'text-[17px]') {
          mapped = 'text-lg';
        }

        if (mapped !== token) {
          changed = true;
          return prefix ? `${prefix}:${mapped}` : mapped;
        }
        return match;
      });

      if (changed) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        filesChanged++;
        console.log(`Updated: ${filePath}`);
      }
    });
  }
});

console.log(`Total files changed: ${filesChanged}`);
