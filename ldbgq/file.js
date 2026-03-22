// src/index.js

export default {
  async fetch(request) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SessionVault | Pro Parser</title>
    
    <!-- TAILWIND CSS v4 -->
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    
    <!-- EXTERNAL HEAVY LIBRARIES -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/buffer/6.0.3/buffer.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-50 min-h-screen font-sans antialiased selection:bg-blue-500/30">

    <div class="max-w-5xl mx-auto px-6 py-8">
        <!-- Header -->
        <header class="flex justify-between items-center border-b border-slate-800 pb-6 mb-8">
            <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                    SessionVault
                </h1>
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Buffer & Pako Ready</span>
            </div>
        </header>

        <!-- Upload Zone -->
        <div id="drop-zone" class="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-900/50 hover:border-blue-500 hover:bg-blue-500/5 transition-all cursor-pointer group mb-8 relative overflow-hidden">
            <input type="file" id="file-input" accept=".ldb" class="hidden">
            
            <div class="relative z-10">
                <div class="w-16 h-16 mx-auto mb-4 text-slate-500 group-hover:text-blue-500 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-200 mb-2">Load LevelDB File</h3>
                <p class="text-slate-400 max-w-md mx-auto mb-6">
                    Drag & drop your <code class="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-sm">.ldb</code> file here. 
                    Binary block reading enabled.
                </p>
                <button onclick="document.getElementById('file-input').click()" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                    Select File
                </button>
            </div>
        </div>

        <!-- Stats Bar -->
        <div id="stats-bar" class="hidden grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col">
                <span class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">File Size</span>
                <span id="stat-size" class="text-2xl font-bold text-slate-100">0 KB</span>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col">
                <span class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Keys Found</span>
                <span id="stat-keys" class="text-2xl font-bold text-blue-400">0</span>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col">
                <span class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Engine</span>
                <span class="text-2xl font-bold text-slate-100">LevelDB</span>
            </div>
        </div>

        <!-- Terminal Window -->
        <div id="terminal-window" class="hidden bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[32rem] shadow-2xl ring-1 ring-white/5">
            <!-- Terminal Header -->
            <div class="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div class="font-mono text-xs text-slate-500">output.log</div>
                <div class="flex gap-2">
                    <button onclick="copyOutput()" class="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors">Copy</button>
                    <button onclick="clearOutput()" class="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors">Clear</button>
                </div>
            </div>
            
            <!-- Terminal Body -->
            <div id="terminal-body" class="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 bg-slate-950/50"></div>
        </div>
    </div>

    <script>
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const terminalWindow = document.getElementById('terminal-window');
        const terminalBody = document.getElementById('terminal-body');
        const statsBar = document.getElementById('stats-bar');
        
        const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
        events.forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('border-blue-500', 'bg-blue-500/5'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('border-blue-500', 'bg-blue-500/5'), false);
        });

        dropZone.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files), false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            handleFiles(dt.files);
        }

        function handleFiles(files) {
            if (files.length === 0) return;
            const file = files[0];
            
            document.getElementById('stat-size').textContent = (file.size / 1024).toFixed(2) + ' KB';
            statsBar.classList.remove('hidden');
            statsBar.classList.add('grid');
            terminalWindow.classList.remove('hidden');
            terminalBody.innerHTML = '<div class="text-slate-500">Initializing parser...</div>';

            const reader = new FileReader();
            reader.onload = function(e) {
                const buffer = Buffer.from(e.target.result);
                parseLDB(buffer);
            };
            
            reader.readAsArrayBuffer(file);
        }

        function parseLDB(buffer) {
            terminalBody.innerHTML = '';
            let keysFound = 0;
            const length = buffer.length;
            const minStringLen = 5;
            let currentString = "";
            let entries = [];

            for (let i = 0; i < length; i++) {
                const byte = buffer[i];

                if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
                    currentString += String.fromCharCode(byte);
                } else {
                    if (currentString.length >= minStringLen) {
                        if (!isGarbage(currentString)) {
                            entries.push({
                                offset: i - currentString.length,
                                text: currentString
                            });
                            keysFound++;
                        }
                    }
                    currentString = "";
                }
            }

            renderEntries(entries);
            document.getElementById('stat-keys').textContent = keysFound;
        }

        function isGarbage(str) {
            if (str.length > 200) return true;
            if (/^[\\x00-\\x1F]*$/.test(str)) return true;
            return false;
        }

        function renderEntries(entries) {
            const fragment = document.createDocumentFragment();
            const displayLimit = 500;
            const count = Math.min(entries.length, displayLimit);

            for (let i = 0; i < count; i++) {
                const entry = entries[i];
                const div = document.createElement('div');
                div.className = 'mb-2 pb-2 border-b border-slate-800/50 last:border-0';
                
                let typeClass = 'text-slate-300';
                if (entry.text.includes('http')) typeClass = 'text-blue-400 font-semibold';
                if (entry.text.includes('cookie') || entry.text.includes('session')) typeClass = 'text-emerald-400 font-semibold';

                div.innerHTML = '<div class="' + typeClass + ' break-all">' + escapeHtml(entry.text) + '</div><div class="text-xs text-slate-600 mt-1 font-mono">Offset: 0x' + entry.offset.toString(16).toUpperCase() + '</div>';
                fragment.appendChild(div);
            }

            if (entries.length > displayLimit) {
                const more = document.createElement('div');
                more.className = 'text-amber-500 text-center py-4 text-sm font-medium';
                more.textContent = '... and ' + (entries.length - displayLimit) + ' more entries hidden for performance.';
                fragment.appendChild(more);
            }

            terminalBody.appendChild(fragment);
        }

        function escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function copyOutput() {
            const text = terminalBody.innerText;
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard');
            });
        }

        function clearOutput() {
            terminalBody.innerHTML = '';
            statsBar.classList.add('hidden');
            statsBar.classList.remove('grid');
            terminalWindow.classList.add('hidden');
            fileInput.value = '';
        }
    </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};