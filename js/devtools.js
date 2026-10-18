/**
 * AURA BROWSER - INTEGRATED DEVELOPER TOOLS ENGINE
 * Provides Console REPL, DOM Elements Inspector, Network Activity, and Application Storage.
 */

window.DevToolsEngine = {
  isOpen: false,
  activeTab: 'console',
  logs: [],

  init() {
    this.container = document.getElementById('browser-devtools');
    if (!this.container) return;

    this.bindEvents();
    this.interceptConsole();
    this.renderConsole();
  },

  toggle(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.container) {
      if (this.isOpen) {
        this.container.classList.add('open');
        this.switchTab(this.activeTab);
      } else {
        this.container.classList.remove('open');
      }
    }
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    const tabs = this.container.querySelectorAll('.devtools-tab-btn');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));

    const content = this.container.querySelector('#devtools-content');
    if (!content) return;

    if (tabName === 'console') {
      this.renderConsole();
    } else if (tabName === 'elements') {
      this.renderElements();
    } else if (tabName === 'network') {
      this.renderNetwork();
    } else if (tabName === 'storage') {
      this.renderStorage();
    }
  },

  bindEvents() {
    this.container.querySelectorAll('.devtools-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    const closeBtn = this.container.querySelector('#devtools-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle(false));
    }
  },

  interceptConsole() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    console.log = (...args) => {
      originalLog.apply(console, args);
      this.addLog('log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      this.addLog('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      this.addLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      this.addLog('info', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    this.addLog('info', 'Aura Browser DevTools Ready • v2.5.0 Engine initialized.');
  },

  addLog(type, text) {
    this.logs.push({ type, text, time: new Date().toLocaleTimeString() });
    if (this.isOpen && this.activeTab === 'console') {
      this.renderConsole();
    }
  },

  /* ----------------- Console Panel ----------------- */
  renderConsole() {
    const content = this.container.querySelector('#devtools-content');
    if (!content) return;

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
          <div style="font-size: 11px; color: var(--text-muted);">JavaScript Interactive Console</div>
          <button class="top-mini-btn" id="btn-clear-console" title="Clear Console" style="font-size: 11px; width: 22px; height: 22px;">🚫</button>
        </div>

        <div class="console-logs-container" id="console-logs-box" style="flex: 1; overflow-y: auto;">
          ${this.logs.map(l => `
            <div class="console-log-row ${l.type}">
              <span style="font-size: 10px; color: var(--text-dim); min-width: 55px;">${l.time}</span>
              <span style="flex: 1; word-break: break-all;">${l.text}</span>
            </div>
          `).join('')}
        </div>

        <div class="console-prompt-line">
          <span class="console-prompt-symbol">›</span>
          <input type="text" id="console-input" placeholder="Execute JavaScript expression..." autofocus />
        </div>
      </div>
    `;

    const logsBox = content.querySelector('#console-logs-box');
    logsBox.scrollTop = logsBox.scrollHeight;

    const input = content.querySelector('#console-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (!cmd) return;
        input.value = '';
        this.addLog('log', `› ${cmd}`);
        try {
          const res = window.eval(cmd);
          this.addLog('output', `< ${typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res)}`);
        } catch (err) {
          this.addLog('error', `✖ ${err.message}`);
        }
      }
    });

    content.querySelector('#btn-clear-console').addEventListener('click', () => {
      this.logs = [];
      this.renderConsole();
    });
  },

  /* ----------------- Elements Panel ----------------- */
  renderElements() {
    const content = this.container.querySelector('#devtools-content');
    if (!content) return;

    const activeTab = window.BrowserEngine.getActiveTab();
    const isInternal = activeTab && activeTab.url.startsWith('browser://');

    content.innerHTML = `
      <div style="display: flex; height: 100%;">
        <div style="flex: 1; overflow-y: auto; padding-right: 12px; border-right: 1px solid var(--border-color);">
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">DOM Tree Viewer</div>
          <div class="dom-tree-node"><span class="dom-tag">&lt;!DOCTYPE html&gt;</span></div>
          <div class="dom-tree-node"><span class="dom-tag">&lt;html</span> <span class="dom-attr">lang</span>=<span class="dom-val">"en"</span><span class="dom-tag">&gt;</span></div>
          <div class="dom-tree-node" style="padding-left: 24px;"><span class="dom-tag">&lt;head&gt;</span>...<span class="dom-tag">&lt;/head&gt;</span></div>
          <div class="dom-tree-node" style="padding-left: 24px;"><span class="dom-tag">&lt;body</span> <span class="dom-attr">class</span>=<span class="dom-val">"aura-viewport"</span><span class="dom-tag">&gt;</span></div>
          <div class="dom-tree-node" style="padding-left: 36px;"><span class="dom-tag">&lt;div</span> <span class="dom-attr">id</span>=<span class="dom-val">"page-content"</span><span class="dom-tag">&gt;</span></div>
          <div class="dom-tree-node" style="padding-left: 48px;"><span class="dom-text">Current Active Page: ${activeTab ? activeTab.title : 'None'}</span></div>
          <div class="dom-tree-node" style="padding-left: 48px;"><span class="dom-text">URL: ${activeTab ? activeTab.url : 'about:blank'}</span></div>
          <div class="dom-tree-node" style="padding-left: 36px;"><span class="dom-tag">&lt;/div&gt;</span></div>
          <div class="dom-tree-node" style="padding-left: 24px;"><span class="dom-tag">&lt;/body&gt;</span></div>
          <div class="dom-tree-node"><span class="dom-tag">&lt;/html&gt;</span></div>
        </div>
        <div style="width: 240px; padding-left: 12px; overflow-y: auto;">
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Styles / Computed</div>
          <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; font-size: 11px; font-family: var(--font-mono);">
            <div style="color: var(--accent);">element.style {</div>
            <div style="padding-left: 12px; color: #94a3b8;">display: <span style="color: #f59e0b;">flex</span>;</div>
            <div style="padding-left: 12px; color: #94a3b8;">width: <span style="color: #f59e0b;">100%</span>;</div>
            <div style="padding-left: 12px; color: #94a3b8;">background: <span style="color: #f59e0b;">var(--bg-window)</span>;</div>
            <div style="color: var(--accent);">}</div>
          </div>
        </div>
      </div>
    `;
  },

  /* ----------------- Network Panel ----------------- */
  renderNetwork() {
    const content = this.container.querySelector('#devtools-content');
    if (!content) return;

    const mockRequests = [
      { name: 'document.html', status: 200, type: 'document', size: '14.2 KB', time: '42 ms' },
      { name: 'browser.css', status: 200, type: 'stylesheet', size: '8.4 KB', time: '18 ms' },
      { name: 'browser.js', status: 200, type: 'script', size: '22.1 KB', time: '28 ms' },
      { name: 'rest_v1/summary', status: 200, type: 'fetch', size: '3.6 KB', time: '110 ms' },
      { name: 'favicon.ico', status: 200, type: 'image', size: '1.2 KB', time: '8 ms' }
    ];

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; font-weight: 700; color: var(--text-muted); font-size: 11px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 6px;">
          <span>Name</span>
          <span>Status</span>
          <span>Type</span>
          <span>Size</span>
          <span>Time</span>
        </div>
        <div style="flex: 1; overflow-y: auto;">
          ${mockRequests.map(r => `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 8px; font-size: 11px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
              <span style="color: var(--text-main);">${r.name}</span>
              <span style="color: var(--success);">${r.status} OK</span>
              <span style="color: var(--text-dim);">${r.type}</span>
              <span style="color: var(--text-muted);">${r.size}</span>
              <span style="color: var(--accent);">${r.time}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ----------------- Storage Panel ----------------- */
  renderStorage() {
    const content = this.container.querySelector('#devtools-content');
    if (!content) return;

    const keys = Object.keys(localStorage);

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">
          <span style="font-size: 11px; color: var(--text-muted);">LocalStorage (${keys.length} items)</span>
          <button class="btn-secondary" id="btn-refresh-storage" style="font-size: 10px; padding: 2px 8px;">Refresh</button>
        </div>
        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
          ${keys.map(k => `
            <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: 4px; padding: 6px;">
              <div style="color: var(--accent); font-weight: 700; font-size: 11px;">${k}</div>
              <div style="color: var(--text-dim); font-size: 10px; max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${localStorage.getItem(k)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    content.querySelector('#btn-refresh-storage').addEventListener('click', () => this.renderStorage());
  }
};
