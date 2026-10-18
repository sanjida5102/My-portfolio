/**
 * AURA BROWSER - CORE CLIENT ENGINE
 * Handles tab lifecycles, navigation state machines, sandboxing, history, bookmarks, and shortcuts.
 */

window.BrowserEngine = {
  tabs: [],
  activeTabId: null,
  splitSecondaryTabId: null,
  isSplitMode: false,
  isIncognito: false,
  currentWorkspace: 'general',
  zoomLevel: 100,
  isDeviceMode: false,

  init() {
    this.bindDomElements();
    this.loadSettings();
    this.bindShortcuts();
    this.bindEvents();
    this.loadBookmarksBar();
    
    // Initialize with a default New Tab
    this.createTab('browser://newtab', 'New Tab', true);

    // Initialize DevTools
    if (window.DevToolsEngine) {
      window.DevToolsEngine.init();
    }
  },

  bindDomElements() {
    this.tabStrip = document.getElementById('tab-strip');
    this.viewport = document.getElementById('viewport-container');
    this.omnibox = document.getElementById('omnibox-input');
    this.omniboxDropdown = document.getElementById('omnibox-dropdown');
    this.btnBack = document.getElementById('btn-nav-back');
    this.btnForward = document.getElementById('btn-nav-forward');
    this.btnReload = document.getElementById('btn-nav-reload');
    this.btnHome = document.getElementById('btn-nav-home');
    this.btnBookmark = document.getElementById('btn-omnibox-star');
    this.btnReader = document.getElementById('btn-reader-mode');
    this.securityBadge = document.getElementById('security-badge');
    this.bookmarksBar = document.getElementById('bookmarks-bar');
    this.sidepanel = document.getElementById('browser-sidepanel');
    this.statusBar = document.getElementById('browser-status-bar');
  },

  /* -------------------------------------------------------------
     TAB MANAGEMENT
     ------------------------------------------------------------- */
  createTab(url = 'browser://newtab', title = 'New Tab', activate = true) {
    const tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    
    const tab = {
      id: tabId,
      url: url,
      title: title,
      icon: this.getIconForUrl(url),
      history: [url],
      historyIndex: 0,
      isLoading: false,
      isPinned: false,
      workspace: this.currentWorkspace,
      zoom: 100,
      readerMode: false
    };

    this.tabs.push(tab);
    this.renderTabElement(tab);
    this.renderPaneElement(tab);

    if (activate) {
      this.switchTab(tabId);
    }

    this.navigateTo(tabId, url);
    return tab;
  },

  renderTabElement(tab) {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab-item';
    tabEl.id = `el_${tab.id}`;
    tabEl.dataset.tabId = tab.id;
    tabEl.innerHTML = `
      <div class="tab-favicon">${tab.icon}</div>
      <div class="tab-loading-spinner"></div>
      <div class="tab-title">${tab.title}</div>
      <div class="tab-close-btn" title="Close Tab (Ctrl+W)">✕</div>
    `;

    // Tab click to activate
    tabEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-close-btn')) {
        e.stopPropagation();
        this.closeTab(tab.id);
      } else {
        this.switchTab(tab.id);
      }
    });

    // Right-click context menu
    tabEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showTabContextMenu(e, tab.id);
    });

    this.tabStrip.appendChild(tabEl);
  },

  renderPaneElement(tab) {
    const pane = document.createElement('div');
    pane.className = 'view-tab-pane';
    pane.id = `pane_${tab.id}`;
    this.viewport.querySelector('.view-stage').appendChild(pane);
  },

  switchTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    this.activeTabId = tabId;

    // Update tab bar UI
    document.querySelectorAll('.tab-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tabId === tabId);
    });

    // Update Panes
    document.querySelectorAll('.view-tab-pane').forEach(el => {
      el.classList.toggle('active', el.id === `pane_${tabId}`);
    });

    // Update Omnibox & Controls
    this.updateToolbarState(tab);

    if (window.DevToolsEngine && window.DevToolsEngine.isOpen) {
      window.DevToolsEngine.switchTab(window.DevToolsEngine.activeTab);
    }
  },

  closeTab(tabId) {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    // Remove DOM elements
    const tabEl = document.getElementById(`el_${tabId}`);
    if (tabEl) tabEl.remove();

    const paneEl = document.getElementById(`pane_${tabId}`);
    if (paneEl) paneEl.remove();

    this.tabs.splice(index, 1);

    // If active tab was closed, switch to neighbor
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        const nextIndex = Math.max(0, index - 1);
        this.switchTab(this.tabs[nextIndex].id);
      } else {
        this.createTab('browser://newtab', 'New Tab', true);
      }
    }
  },

  closeOtherTabs(tabId) {
    const toClose = this.tabs.filter(t => t.id !== tabId && !t.isPinned).map(t => t.id);
    toClose.forEach(id => this.closeTab(id));
  },

  pinTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;
    tab.isPinned = !tab.isPinned;
    const tabEl = document.getElementById(`el_${tabId}`);
    if (tabEl) {
      tabEl.classList.toggle('pinned', tab.isPinned);
    }
  },

  duplicateTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      this.createTab(tab.url, tab.title, true);
    }
  },

  getActiveTab() {
    return this.tabs.find(t => t.id === this.activeTabId);
  },

  /* -------------------------------------------------------------
     NAVIGATION & OMNIBOX ENGINE
     ------------------------------------------------------------- */
  navigateTo(tabId, rawInput) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    let targetUrl = rawInput.trim();
    let title = targetUrl;
    let isInternal = false;

    // Determine target URL format
    if (targetUrl.startsWith('browser://') || targetUrl === 'about:blank') {
      isInternal = true;
      title = this.formatInternalTitle(targetUrl);
    } else if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
      title = new URL(targetUrl).hostname;
    } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      try {
        title = new URL(targetUrl).hostname;
      } catch (e) {
        title = targetUrl;
      }
    } else if (targetUrl.length > 0) {
      // It is a search query
      const defaultEngine = localStorage.getItem('aura_search_engine') || 'NeoSearch';
      if (defaultEngine === 'NeoSearch') {
        targetUrl = `browser://search?q=${encodeURIComponent(targetUrl)}`;
        isInternal = true;
        title = `NeoSearch: ${rawInput}`;
      } else if (defaultEngine === 'Google') {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
        title = `Google: ${rawInput}`;
      } else if (defaultEngine === 'DuckDuckGo') {
        targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(targetUrl)}`;
        title = `DuckDuckGo: ${rawInput}`;
      } else if (defaultEngine === 'Wikipedia') {
        targetUrl = `browser://wikipedia?q=${encodeURIComponent(targetUrl)}`;
        isInternal = true;
        title = `Wiki: ${rawInput}`;
      } else {
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
        title = `Bing: ${rawInput}`;
      }
    } else {
      targetUrl = 'browser://newtab';
      isInternal = true;
      title = 'New Tab';
    }

    // Update tab state
    tab.url = targetUrl;
    tab.title = title;
    tab.icon = this.getIconForUrl(targetUrl);

    // Record History (unless Incognito)
    if (!this.isIncognito && !targetUrl.startsWith('browser://newtab')) {
      this.addHistory(targetUrl, title);
    }

    // Update DOM tab bar item
    const tabEl = document.getElementById(`el_${tab.id}`);
    if (tabEl) {
      tabEl.querySelector('.tab-title').textContent = title;
      tabEl.querySelector('.tab-favicon').innerHTML = tab.icon;
    }

    // Update viewport pane content
    const pane = document.getElementById(`pane_${tab.id}`);
    if (pane) {
      this.renderPaneContent(pane, tab);
    }

    if (this.activeTabId === tab.id) {
      this.updateToolbarState(tab);
    }
  },

  renderPaneContent(pane, tab) {
    pane.innerHTML = '';

    if (tab.url.startsWith('browser://') || tab.url === 'about:blank') {
      // Native internal app
      window.BuiltinApps.render(tab.url, pane, tab.id);
    } else {
      // External web page loaded in sandboxed iframe with smart fallback handler
      const iframeWrapper = document.createElement('div');
      iframeWrapper.className = 'page-iframe-wrapper';
      
      const iframe = document.createElement('iframe');
      iframe.className = 'page-iframe';
      iframe.src = tab.url;
      iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';

      // Fallback Assistant overlay for sites that disallow iframe embedding (X-Frame-Options)
      const fallback = document.createElement('div');
      fallback.className = 'iframe-fallback-card';
      fallback.style.display = 'none';
      fallback.innerHTML = `
        <div class="fallback-icon">🛡️</div>
        <h2 class="fallback-title">External Site Security Shield</h2>
        <p class="fallback-desc">
          <strong>${tab.title}</strong> restricts direct in-browser embedding via modern <code>X-Frame-Options</code> or CSP security policies.
        </p>
        <div class="fallback-actions">
          <button class="btn-primary" onclick="window.open('${tab.url}', '_blank')">🚀 Open in Native Tab</button>
          <button class="btn-secondary" onclick="window.BrowserEngine.navigateTo('${tab.id}', 'browser://search?q=${encodeURIComponent(tab.title)}')">🔍 Search on NeoSearch</button>
          <button class="btn-secondary" onclick="window.BrowserEngine.navigateTo('${tab.id}', 'browser://newtab')">🏠 Return Home</button>
        </div>
      `;

      // Detect if iframe failed or loaded
      let loadTimeout = setTimeout(() => {
        // Show helpful options if slow or potentially blocked
      }, 3000);

      iframe.onload = () => {
        clearTimeout(loadTimeout);
      };

      iframe.onerror = () => {
        fallback.style.display = 'flex';
      };

      iframeWrapper.appendChild(iframe);
      iframeWrapper.appendChild(fallback);
      pane.appendChild(iframeWrapper);
    }
  },

  formatInternalTitle(url) {
    if (url.includes('newtab') || url === 'about:blank') return 'New Tab';
    if (url.includes('search')) return 'NeoSearch';
    if (url.includes('wikipedia')) return 'Wikipedia Explorer';
    if (url.includes('news')) return 'Tech Pulse News';
    if (url.includes('codelab')) return 'CodeLab Studio';
    if (url.includes('arcade')) return 'Arcade Zone';
    if (url.includes('ai')) return 'Aura AI Copilot';
    if (url.includes('notes')) return 'Web Notes';
    if (url.includes('history')) return 'History';
    if (url.includes('bookmarks')) return 'Bookmarks';
    if (url.includes('downloads')) return 'Downloads';
    if (url.includes('settings')) return 'Settings';
    return 'Browser App';
  },

  getIconForUrl(url) {
    if (url.startsWith('browser://newtab') || url === 'about:blank') return '🏠';
    if (url.startsWith('browser://search')) return '🔍';
    if (url.startsWith('browser://wikipedia')) return '📚';
    if (url.startsWith('browser://news')) return '📰';
    if (url.startsWith('browser://codelab')) return '💻';
    if (url.startsWith('browser://arcade')) return '🎮';
    if (url.startsWith('browser://ai')) return '🤖';
    if (url.startsWith('browser://notes')) return '📝';
    if (url.startsWith('browser://history')) return '🕒';
    if (url.startsWith('browser://bookmarks')) return '⭐';
    if (url.startsWith('browser://downloads')) return '📥';
    if (url.startsWith('browser://settings')) return '⚙️';
    if (url.includes('youtube.com')) return '▶️';
    if (url.includes('github.com')) return '🐙';
    if (url.includes('reddit.com')) return '👽';
    return '🌐';
  },

  updateToolbarState(tab) {
    if (!tab) return;
    this.omnibox.value = tab.url.startsWith('browser://newtab') ? '' : tab.url;
    
    // Security Badge
    if (tab.url.startsWith('browser://')) {
      this.securityBadge.className = 'security-badge internal';
      this.securityBadge.innerHTML = '⚡ <span>System</span>';
    } else if (tab.url.startsWith('https://')) {
      this.securityBadge.className = 'security-badge';
      this.securityBadge.innerHTML = '🔒 <span>Secure</span>';
    } else {
      this.securityBadge.className = 'security-badge insecure';
      this.securityBadge.innerHTML = '⚠️ <span>Not Secure</span>';
    }

    // Bookmark star status
    const bookmarks = JSON.parse(localStorage.getItem('aura_bookmarks') || '[]');
    const isBookmarked = bookmarks.some(b => b.url === tab.url);
    this.btnBookmark.classList.toggle('bookmarked', isBookmarked);
    this.btnBookmark.textContent = isBookmarked ? '⭐' : '☆';
  },

  goBack() {
    const tab = this.getActiveTab();
    if (tab && tab.historyIndex > 0) {
      tab.historyIndex--;
      this.navigateTo(tab.id, tab.history[tab.historyIndex]);
    }
  },

  goForward() {
    const tab = this.getActiveTab();
    if (tab && tab.historyIndex < tab.history.length - 1) {
      tab.historyIndex++;
      this.navigateTo(tab.id, tab.history[tab.historyIndex]);
    }
  },

  reload() {
    const tab = this.getActiveTab();
    if (tab) {
      this.navigateTo(tab.id, tab.url);
    }
  },

  goHome() {
    const tab = this.getActiveTab();
    if (tab) {
      this.navigateTo(tab.id, 'browser://newtab');
    }
  },

  /* -------------------------------------------------------------
     BOOKMARKS & HISTORY SYSTEM
     ------------------------------------------------------------- */
  toggleBookmark() {
    const tab = this.getActiveTab();
    if (!tab) return;

    let bookmarks = JSON.parse(localStorage.getItem('aura_bookmarks') || '[]');
    const idx = bookmarks.findIndex(b => b.url === tab.url);

    if (idx > -1) {
      bookmarks.splice(idx, 1);
      this.showToast('Bookmark removed');
    } else {
      bookmarks.push({
        title: tab.title,
        url: tab.url,
        icon: tab.icon
      });
      this.showToast('⭐ Saved to Bookmarks');
    }

    localStorage.setItem('aura_bookmarks', JSON.stringify(bookmarks));
    this.updateToolbarState(tab);
    this.loadBookmarksBar();
  },

  loadBookmarksBar() {
    if (!this.bookmarksBar) return;
    const bookmarks = JSON.parse(localStorage.getItem('aura_bookmarks') || JSON.stringify([
      { title: 'NeoSearch', url: 'browser://search', icon: '🔍' },
      { title: 'Wikipedia', url: 'browser://wikipedia', icon: '📚' },
      { title: 'Tech News', url: 'browser://news', icon: '📰' },
      { title: 'CodeLab', url: 'browser://codelab', icon: '💻' },
      { title: 'Arcade', url: 'browser://arcade', icon: '🎮' },
      { title: 'AI Copilot', url: 'browser://ai', icon: '🤖' }
    ]));

    this.bookmarksBar.innerHTML = `
      ${bookmarks.map(b => `
        <div class="bookmark-item" data-url="${b.url}">
          <span class="bm-icon">${b.icon || '🔖'}</span>
          <span class="bm-title">${b.title}</span>
        </div>
      `).join('')}
      <div class="bookmarks-divider"></div>
      <div class="bookmark-item" id="btn-bookmarks-manager">
        <span class="bm-icon">📂</span>
        <span class="bm-title">All Bookmarks</span>
      </div>
    `;

    this.bookmarksBar.querySelectorAll('.bookmark-item[data-url]').forEach(item => {
      item.addEventListener('click', () => {
        this.navigateTo(this.activeTabId, item.dataset.url);
      });
    });

    const mgr = this.bookmarksBar.querySelector('#btn-bookmarks-manager');
    if (mgr) {
      mgr.addEventListener('click', () => {
        this.navigateTo(this.activeTabId, 'browser://bookmarks');
      });
    }
  },

  addHistory(url, title) {
    let history = JSON.parse(localStorage.getItem('aura_history') || '[]');
    history.unshift({
      url,
      title,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    // Cap at 100 entries
    if (history.length > 100) history.pop();
    localStorage.setItem('aura_history', JSON.stringify(history));
  },

  /* -------------------------------------------------------------
     OMNIBOX SUGGESTIONS & AUTOCOMPLETE
     ------------------------------------------------------------- */
  handleOmniboxInput(val) {
    if (!val.trim()) {
      this.omniboxDropdown.style.display = 'none';
      return;
    }

    const query = val.trim();
    let suggestionsHtml = '';

    // Math Evaluation
    try {
      if (/^[0-9+\-*/().^ %]+$/.test(query) && /[+\-*/]/.test(query)) {
        const mathRes = Function(`'use strict'; return (${query})`)();
        suggestionsHtml += `
          <div class="math-eval-card" onclick="window.BrowserEngine.navigateTo('${this.activeTabId}', 'browser://search?q=${encodeURIComponent(query)}')">
            <span style="color: var(--text-muted); font-size: 13px;">${query} =</span>
            <span class="math-result">${mathRes}</span>
          </div>
        `;
      }
    } catch (e) {}

    // Suggestions List
    const defaultEngine = localStorage.getItem('aura_search_engine') || 'NeoSearch';
    const suggestions = [
      { text: `Search ${defaultEngine} for "${query}"`, desc: `Query via ${defaultEngine}`, icon: '🔍', action: () => this.navigateTo(this.activeTabId, query) },
      { text: `https://${query.replace(/^https?:\/\//, '')}`, desc: 'Direct Website Link', icon: '🌐', action: () => this.navigateTo(this.activeTabId, `https://${query.replace(/^https?:\/\//, '')}`) },
      { text: `Wikipedia: ${query}`, desc: 'Search live Wikipedia articles', icon: '📚', action: () => this.navigateTo(this.activeTabId, `browser://wikipedia?q=${encodeURIComponent(query)}`) },
      { text: `CodeLab Experiment with "${query}"`, desc: 'Open in CodeLab Studio', icon: '💻', action: () => this.navigateTo(this.activeTabId, 'browser://codelab') }
    ];

    suggestionsHtml += `
      <div class="dropdown-section-title">Smart Suggestions</div>
      ${suggestions.map((s, idx) => `
        <div class="suggestion-item" data-idx="${idx}">
          <span class="sugg-icon">${s.icon}</span>
          <div class="sugg-content">
            <div class="sugg-text">${s.text}</div>
            <div class="sugg-desc">${s.desc}</div>
          </div>
        </div>
      `).join('')}
    `;

    this.omniboxDropdown.innerHTML = suggestionsHtml;
    this.omniboxDropdown.style.display = 'block';

    this.omniboxDropdown.querySelectorAll('.suggestion-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        suggestions[idx].action();
        this.omniboxDropdown.style.display = 'none';
      });
    });
  },

  /* -------------------------------------------------------------
     SETTINGS, THEMES & SHORTCUTS
     ------------------------------------------------------------- */
  setTheme(themeName) {
    if (themeName === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
    localStorage.setItem('aura_theme', themeName);
    this.showToast(`Applied ${themeName} Theme`);
  },

  loadSettings() {
    const savedTheme = localStorage.getItem('aura_theme') || 'default';
    if (savedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  },

  toggleIncognito() {
    this.isIncognito = !this.isIncognito;
    document.body.classList.toggle('incognito-mode', this.isIncognito);
    this.showToast(this.isIncognito ? '🕶️ Incognito Mode Enabled' : 'Normal Browsing Restored');
  },

  toggleSplitView() {
    const stage = this.viewport.querySelector('.view-stage');
    this.isSplitMode = !this.isSplitMode;
    stage.classList.toggle('split-mode', this.isSplitMode);

    if (this.isSplitMode && this.tabs.length > 1) {
      const otherTab = this.tabs.find(t => t.id !== this.activeTabId);
      if (otherTab) {
        const otherPane = document.getElementById(`pane_${otherTab.id}`);
        if (otherPane) otherPane.classList.add('split-secondary');
      }
    }
    this.showToast(this.isSplitMode ? '⚡ Split Screen Enabled' : 'Single Screen View');
  },

  toggleSidePanel(type = 'ai') {
    if (this.sidepanel.classList.contains('open') && this.sidepanel.dataset.type === type) {
      this.sidepanel.classList.remove('open');
      return;
    }

    this.sidepanel.classList.add('open');
    this.sidepanel.dataset.type = type;

    const titleEl = this.sidepanel.querySelector('.sidepanel-title');
    const bodyEl = this.sidepanel.querySelector('.sidepanel-body');

    if (type === 'ai') {
      titleEl.innerHTML = '🤖 Aura Copilot AI';
      window.BuiltinApps.renderAIAssistant(bodyEl, this.activeTabId);
    } else if (type === 'notes') {
      titleEl.innerHTML = '📝 Web Notes';
      window.BuiltinApps.renderNotes(bodyEl, this.activeTabId);
    }
  },

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  },

  showTabContextMenu(e, tabId) {
    const menu = document.getElementById('custom-context-menu');
    if (!menu) return;

    menu.innerHTML = `
      <div class="menu-item" id="ctx-new-tab"><div class="menu-item-left">➕ New Tab</div><span class="menu-shortcut">Ctrl+T</span></div>
      <div class="menu-item" id="ctx-dup-tab"><div class="menu-item-left">📑 Duplicate Tab</div></div>
      <div class="menu-item" id="ctx-pin-tab"><div class="menu-item-left">📌 Pin / Unpin Tab</div></div>
      <div class="menu-separator"></div>
      <div class="menu-item" id="ctx-close-tab"><div class="menu-item-left">✕ Close Tab</div><span class="menu-shortcut">Ctrl+W</span></div>
      <div class="menu-item" id="ctx-close-others"><div class="menu-item-left">🚫 Close Other Tabs</div></div>
    `;

    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;
    menu.style.display = 'block';

    const hide = () => {
      menu.style.display = 'none';
      window.removeEventListener('click', hide);
    };
    setTimeout(() => window.addEventListener('click', hide), 50);

    menu.querySelector('#ctx-new-tab').onclick = () => this.createTab();
    menu.querySelector('#ctx-dup-tab').onclick = () => this.duplicateTab(tabId);
    menu.querySelector('#ctx-pin-tab').onclick = () => this.pinTab(tabId);
    menu.querySelector('#ctx-close-tab').onclick = () => this.closeTab(tabId);
    menu.querySelector('#ctx-close-others').onclick = () => this.closeOtherTabs(tabId);
  },

  bindEvents() {
    // Navigation Buttons
    this.btnBack.addEventListener('click', () => this.goBack());
    this.btnForward.addEventListener('click', () => this.goForward());
    this.btnReload.addEventListener('click', () => this.reload());
    this.btnHome.addEventListener('click', () => this.goHome());
    this.btnBookmark.addEventListener('click', () => this.toggleBookmark());

    // New Tab Button
    document.getElementById('btn-new-tab').addEventListener('click', () => this.createTab());

    // Omnibox
    this.omnibox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.navigateTo(this.activeTabId, this.omnibox.value);
        this.omniboxDropdown.style.display = 'none';
      }
    });

    this.omnibox.addEventListener('input', (e) => {
      this.handleOmniboxInput(e.target.value);
    });

    this.omnibox.addEventListener('focus', () => {
      this.omnibox.select();
      if (this.omnibox.value) this.handleOmniboxInput(this.omnibox.value);
    });

    document.addEventListener('click', (e) => {
      if (!this.omnibox.contains(e.target) && !this.omniboxDropdown.contains(e.target)) {
        this.omniboxDropdown.style.display = 'none';
      }
    });

    // Workspaces
    document.querySelectorAll('.ws-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.ws-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentWorkspace = pill.dataset.ws;
        this.showToast(`Switched to "${pill.textContent}" Workspace`);
      });
    });

    // Side Rail Action Buttons
    document.querySelectorAll('.rail-btn[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'newtab') this.createTab();
        else if (action === 'search') this.navigateTo(this.activeTabId, 'browser://search');
        else if (action === 'ai') this.toggleSidePanel('ai');
        else if (action === 'notes') this.toggleSidePanel('notes');
        else if (action === 'codelab') this.navigateTo(this.activeTabId, 'browser://codelab');
        else if (action === 'arcade') this.navigateTo(this.activeTabId, 'browser://arcade');
        else if (action === 'history') this.navigateTo(this.activeTabId, 'browser://history');
        else if (action === 'bookmarks') this.navigateTo(this.activeTabId, 'browser://bookmarks');
        else if (action === 'downloads') this.navigateTo(this.activeTabId, 'browser://downloads');
        else if (action === 'settings') this.navigateTo(this.activeTabId, 'browser://settings');
      });
    });

    // Split Mode button
    const btnSplit = document.getElementById('btn-split-view');
    if (btnSplit) btnSplit.addEventListener('click', () => this.toggleSplitView());

    // DevTools button
    const btnDevTools = document.getElementById('btn-toggle-devtools');
    if (btnDevTools) btnDevTools.addEventListener('click', () => window.DevToolsEngine.toggle());

    // Incognito toggle button
    const btnIncog = document.getElementById('btn-toggle-incognito');
    if (btnIncog) btnIncog.addEventListener('click', () => this.toggleIncognito());

    // Sidepanel close
    const spClose = document.getElementById('sidepanel-close-btn');
    if (spClose) spClose.addEventListener('click', () => this.sidepanel.classList.remove('open'));
  },

  bindShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        this.createTab();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        this.closeTab(this.activeTabId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        this.omnibox.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        this.reload();
      } else if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        window.DevToolsEngine.toggle();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        this.navigateTo(this.activeTabId, 'browser://history');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        this.navigateTo(this.activeTabId, 'browser://downloads');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.toggleBookmark();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.toggleIncognito();
      }
    });
  }
};

// Launch when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.BrowserEngine.init();
});
