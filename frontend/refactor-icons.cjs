const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src/pages'),
];

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Self-closing Button with icon prop
  // e.g. <Button icon={<Icon size={16} />} className="..." />
  const selfClosingRegex = /<Button([^>]*?)icon=\{\s*<([A-Za-z0-9_]+)([^>]*?)\/?\>\s*\}([^>]*?)\/>/gs;
  content = content.replace(selfClosingRegex, (match, before, iconName, iconProps, after) => {
    // Inject className="w-4 h-4" or similar if we want, but let's just keep the original props
    return `<Button${before}${after}>\n  <${iconName}${iconProps} />\n</Button>`;
  });

  // 2. Open/Close Button with icon prop
  // e.g. <Button icon={<Icon />} ...>Text</Button>
  const openCloseRegex = /<Button([^>]*?)icon=\{\s*<([A-Za-z0-9_]+)([^>]*?)\/?\>\s*\}([^>]*?)>([\s\S]*?)<\/Button>/gs;
  content = content.replace(openCloseRegex, (match, before, iconName, iconProps, after, children) => {
    // If iconProps doesn't have className, we could add mr-2, but we can just prepend it.
    let props = iconProps;
    if (!props.includes('className=')) {
        props = props.endsWith(' ') ? props + 'className="mr-2"' : props + ' className="mr-2"';
    } else {
        props = props.replace('className="', 'className="mr-2 ');
    }
    return `<Button${before}${after}>\n  <${iconName}${props} /> ${children.trim()}\n</Button>`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated Icons: ${filePath}`);
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

console.log('Icon refactoring complete.');
