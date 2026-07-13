const mongoose = require('mongoose');

const getDBStats = async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const stats = [];
        
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            stats.push({ name: col.name, count });
        }
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCollectionData = async (req, res) => {
    try {
        const { collectionName } = req.params;
        const data = await mongoose.connection.db.collection(collectionName).find().limit(50).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getExplorerPage = (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AAES :: Data Explorer</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg: #000000;
                --surface: #111111;
                --border: #222222;
                --text: #ffffff;
                --text-muted: #888888;
                --accent: #ffffff;
                --hover: #1a1a1a;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
                background: var(--bg); 
                color: var(--text); 
                font-family: 'Inter', sans-serif; 
                display: flex;
                height: 100vh;
                overflow: hidden;
            }

            aside {
                width: 280px;
                border-right: 1px solid var(--border);
                display: flex;
                flex-direction: column;
                background: var(--surface);
            }

            .aside-header {
                padding: 24px;
                border-bottom: 1px solid var(--border);
            }

            .aside-header h1 {
                font-size: 14px;
                font-weight: 800;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .collection-list {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            }

            .collection-item {
                padding: 12px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                color: var(--text-muted);
                transition: all 0.2s;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
            }

            .collection-item:hover {
                background: var(--hover);
                color: var(--text);
            }

            .collection-item.active {
                background: var(--accent);
                color: var(--bg);
            }

            .count-badge {
                font-size: 10px;
                background: rgba(255,255,255,0.1);
                padding: 2px 6px;
                border-radius: 4px;
            }

            .active .count-badge {
                background: rgba(0,0,0,0.1);
            }

            main {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: var(--bg);
            }

            header {
                padding: 20px 32px;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .content {
                flex: 1;
                padding: 32px;
                overflow-y: auto;
            }

            .doc-card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 16px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                white-space: pre-wrap;
                word-break: break-all;
                line-height: 1.6;
                transition: border-color 0.2s;
            }

            .doc-card:hover {
                border-color: var(--text-muted);
            }

            .doc-id {
                color: var(--text-muted);
                font-size: 10px;
                margin-bottom: 8px;
                display: block;
            }

            .no-selection {
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--text-muted);
                text-align: center;
            }

            .loader {
                width: 20px;
                height: 20px;
                border: 2px solid var(--border);
                border-top-color: var(--accent);
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <aside>
            <div class="aside-header">
                <h1>Data Explorer</h1>
            </div>
            <div class="collection-list" id="collection-list">
                <!-- Collections will be loaded here -->
            </div>
        </aside>
        <main>
            <header id="main-header">
                <span style="font-size: 14px; font-weight: 700;">Select a collection to browse</span>
            </header>
            <div class="content" id="main-content">
                <div class="no-selection">
                    <p>SYSTEM DATA HUB v1.0</p>
                    <p style="font-size: 12px; margin-top: 8px;">Select a standard collection from the left sidebar.</p>
                </div>
            </div>
        </main>

        <script>
            async function loadCollections() {
                const res = await fetch('/api/admin/db/collections');
                const data = await res.json();
                const list = document.getElementById('collection-list');
                list.innerHTML = '';
                data.forEach(col => {
                    const div = document.createElement('div');
                    div.className = 'collection-item';
                    div.innerHTML = \`\${col.name} <span class="count-badge">\${col.count}</span>\`;
                    div.onclick = () => loadCollectionData(col.name, div);
                    list.appendChild(div);
                });
            }

            async function loadCollectionData(name, element) {
                // UI feedback
                document.querySelectorAll('.collection-item').forEach(el => el.classList.remove('active'));
                element.classList.add('active');
                document.getElementById('main-header').innerHTML = \`<span style="font-size: 14px; font-weight: 700;">Browser / \${name}</span>\`;
                document.getElementById('main-content').innerHTML = '<div class="no-selection"><div class="loader"></div></div>';

                // Fetch
                const res = await fetch(\`/api/admin/db/collection/\${name}\`);
                const data = await res.json();
                
                const content = document.getElementById('main-content');
                content.innerHTML = '';
                
                if (data.length === 0) {
                    content.innerHTML = '<div class="no-selection"><p>No documents found in this collection.</p></div>';
                    return;
                }

                data.forEach(doc => {
                    const card = document.createElement('div');
                    card.className = 'doc-card';
                    const id = doc._id;
                    delete doc._id;
                    card.innerHTML = \`<span class="doc-id">ID: \${id}</span>\${JSON.stringify(doc, null, 2)}\`;
                    content.appendChild(card);
                });
            }

            loadCollections();
        </script>
    </body>
    </html>
    `;
    res.send(html);
};

module.exports = { getDBStats, getCollectionData, getExplorerPage };
