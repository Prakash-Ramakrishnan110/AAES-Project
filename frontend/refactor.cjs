const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src/pages'),
//  path.join(__dirname, 'src/layout'),
//  path.join(__dirname, 'src/ui')
];

const replaceMap = {
  'color-primary': 'primary',
  'color-text-subtle': 'muted-foreground',
  'color-text-muted': 'muted-foreground',
  'color-text': 'foreground',
  'color-border-light': 'border',
  'color-border': 'border',
  'color-bg': 'background',
  'color-surface-glass': 'background/80',
  'color-surface': 'card',
  'color-success': 'emerald-500',
  'color-error': 'destructive',
  'color-warning': 'amber-500',
  
  // Imports Map
  "'../../ui/Button'": "'../../components/ui/Button'",
  "'../../ui/Card'": "'../../components/ui/Card'",
  "'../../ui/Input'": "'../../components/ui/Input'",
  "'../../ui/Badge'": "'../../components/ui/badge'",
  "'../../ui/Modal'": "'../../ui/Modal'", // Leave Modal for now
};

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [key, value] of Object.entries(replaceMap)) {
    // We want to replace all occurrences. For CSS classes, key might be embedded like `bg-color-primary`
    // so we can just replace `color-primary` with `primary`.
    // Exception: `text-color-text` -> `text-foreground`. If we do `color-text` -> `foreground` then `text-color-text` becomes `text-foreground`.
    // Wait, `border-color-border` -> `border-border`.
    // We must be careful about order. `color-text-subtle` must be replaced before `color-text`.
    content = content.split(key).join(value);
  }

  // Check specific edge cases
  content = content.split('variant="primary"').join(''); // Remove non-standard Shadcn variant
  content = content.split('variant="error"').join('variant="destructive"');
  content = content.split('variant="success"').join('variant="default"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) walkDir(dir);
});

console.log('Refactoring complete.');
