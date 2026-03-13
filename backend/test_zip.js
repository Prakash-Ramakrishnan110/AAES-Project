const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

async function testZip() {
    const zipPath = path.resolve(__dirname, 'test_bulk.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`ZIP created successfully: ${archive.pointer()} total bytes`);
        fs.unlinkSync(zipPath);
    });

    archive.on('error', (err) => {
        console.error('Archiver error:', err);
    });

    archive.pipe(output);

    // Try to add a dummy file
    const dummyFile = path.resolve(__dirname, 'dummy.txt');
    fs.writeFileSync(dummyFile, 'hello world');
    archive.file(dummyFile, { name: 'dummy.txt' });

    await archive.finalize();
    fs.unlinkSync(dummyFile);
}

testZip().catch(console.error);
