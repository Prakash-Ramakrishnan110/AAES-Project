const fs = require('fs');
const { execSync } = require('child_process');

let md = fs.readFileSync('PROJECT_REPORT.md', 'utf-8');
const regex = /```mermaid([\s\S]*?)```/g;
let match;
let count = 0;
let newMd = md;

while ((match = regex.exec(md)) !== null) {
    count++;
    const mmdContent = match[1].trim();
    const mmdFile = `diagram_${count}.mmd`;
    const pngFile = `diagram_${count}.png`;
    fs.writeFileSync(mmdFile, mmdContent);
    console.log(`Generating ${pngFile}...`);
    try {
        execSync(`npx mmdc -i ${mmdFile} -o ${pngFile} -b white`, { stdio: 'inherit' });
        newMd = newMd.replace(match[0], `![Diagram ${count}](${pngFile})`);
    } catch (e) {
        console.error(`Failed to generate ${pngFile}`);
    }
}

fs.writeFileSync('PROJECT_REPORT_WITH_IMAGES.md', newMd);
console.log('Running pandoc...');
try {
    execSync('pandoc PROJECT_REPORT_WITH_IMAGES.md -o output.docx -f markdown-yaml_metadata_block', { stdio: 'inherit' });
    console.log('Successfully generated output.docx!');
} catch (e) {
    console.error('Pandoc failed.');
}
