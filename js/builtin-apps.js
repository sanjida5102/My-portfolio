/**
 * AURA BROWSER - BUILT-IN NATIVE APPLICATIONS ENGINE
 * Provides internal browser:// pages with rich interactive functionality.
 */

window.BuiltinApps = {
  // Renders the appropriate native page into a container
  render(url, container, tabId) {
    const cleanUrl = url.toLowerCase().trim();
    
    if (cleanUrl === 'browser://newtab' || cleanUrl === 'about:blank' || cleanUrl === '' || cleanUrl === 'browser://home') {
      this.renderNewTab(container, tabId);
    } else if (cleanUrl.startsWith('browser://search')) {
      const params = new URLSearchParams(cleanUrl.split('?')[1] || '');
      const query = params.get('q') || '';
      this.renderSearch(container, tabId, query);
    } else if (cleanUrl.startsWith('browser://wikipedia')) {
      const params = new URLSearchParams(cleanUrl.split('?')[1] || '');
      const query = params.get('q') || 'Web browser';
      this.renderWikipedia(container, tabId, query);
    } else if (cleanUrl === 'browser://news') {
      this.renderNews(container, tabId);
    } else if (cleanUrl === 'browser://codelab') {
      this.renderCodeLab(container, tabId);
    } else if (cleanUrl === 'browser://arcade') {
      this.renderArcade(container, tabId);
    } else if (cleanUrl === 'browser://ai') {
      this.renderAIAssistant(container, tabId);
    } else if (cleanUrl === 'browser://notes') {
      this.renderNotes(container, tabId);
    } else if (cleanUrl === 'browser://history') {
      this.renderHistory(container, tabId);
    } else if (cleanUrl === 'browser://bookmarks') {
      this.renderBookmarks(container, tabId);
    } else if (cleanUrl === 'browser://downloads') {
      this.renderDownloads(container, tabId);
    } else if (cleanUrl === 'browser://settings') {
      this.renderSettings(container, tabId);
    } else {
      this.render404(container, url);
    }
  },

  /* -------------------------------------------------------------
     1. NEW TAB / HOME PAGE
     ------------------------------------------------------------- */
  renderNewTab(container, tabId) {
    const speedDials = JSON.parse(localStorage.getItem('aura_speed_dials') || JSON.stringify([
      { title: 'NeoSearch', url: 'browser://search', icon: '🔍', color: '#3b82f6' },
      { title: 'Wikipedia', url: 'browser://wikipedia', icon: '📚', color: '#6366f1' },
      { title: 'Tech News', url: 'browser://news', icon: '📰', color: '#f59e0b' },
      { title: 'CodeLab', url: 'browser://codelab', icon: '💻', color: '#10b981' },
      { title: 'Arcade', url: 'browser://arcade', icon: '🎮', color: '#ec4899' },
      { title: 'AI Copilot', url: 'browser://ai', icon: '🤖', color: '#8b5cf6' },
      { title: 'Notes', url: 'browser://notes', icon: '📝', color: '#06b6d4' },
      { title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️', color: '#ef4444' },
      { title: 'GitHub', url: 'https://github.com', icon: '🐙', color: '#475569' },
      { title: 'Settings', url: 'browser://settings', icon: '⚙️', color: '#64748b' }
    ]));

    const quotes = [
      { text: "The web as I envisaged it, we have not seen it yet. The future is still so much bigger than the past.", author: "Tim Berners-Lee" },
      { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
      { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
      { text: "First, solve the problem. Then, write the code.", author: "John Johnson" }
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    container.innerHTML = `
      <div class="native-page-container">
        <div class="newtab-hero">
          <div class="newtab-clock" id="nt-clock">12:00</div>
          <div class="newtab-date" id="nt-date">Monday, September 29</div>
          
          <div class="newtab-search-box">
            <span style="font-size: 18px; color: var(--accent);">🔍</span>
            <input type="text" class="newtab-search-input" id="nt-search-input" placeholder="Search the web or enter URL..." autofocus />
            <button class="btn-primary" id="nt-search-btn" style="padding: 6px 16px; font-size: 13px;">Search</button>
          </div>

          <div class="speed-dial-grid" id="speed-dial-list">
            ${speedDials.map(dial => `
              <div class="speed-dial-item" data-url="${dial.url}">
                <div class="speed-dial-icon" style="background: ${dial.color}22; color: ${dial.color};">
                  ${dial.icon}
                </div>
                <div class="speed-dial-title">${dial.title}</div>
              </div>
            `).join('')}
            <div class="speed-dial-item" id="btn-add-speeddial">
              <div class="speed-dial-icon" style="background: rgba(255,255,255,0.05); color: var(--text-dim);">
                ➕
              </div>
              <div class="speed-dial-title">Add Shortcut</div>
            </div>
          </div>

          <div class="newtab-widgets-row">
            <!-- Weather Widget -->
            <div class="widget-card">
              <div class="widget-card-header">
                <span>🌤️ Weather Radar</span>
                <span id="nt-weather-loc" style="color: var(--accent); font-weight: 600; cursor: pointer;">Tokyo, JP ✏️</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                <div>
                  <div style="font-size: 28px; font-weight: 800; font-family: var(--font-display);" id="nt-weather-temp">24°C</div>
                  <div style="font-size: 12px; color: var(--text-muted);" id="nt-weather-cond">Partly Cloudy • Humidity 58%</div>
                </div>
                <div style="font-size: 36px;">⛅</div>
              </div>
            </div>

            <!-- Quick Note Widget -->
            <div class="widget-card">
              <div class="widget-card-header">
                <span>📝 Quick Scratchpad</span>
                <span style="font-size: 10px; color: var(--success);" id="nt-note-status">Saved</span>
              </div>
              <textarea id="nt-quick-note" style="width:100%; height: 50px; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); border: 1px solid var(--border-color); color: var(--text-main); padding: 6px; font-size: 12px; resize: none;" placeholder="Jot down a quick thought or URL...">${localStorage.getItem('aura_quick_note') || ''}</textarea>
            </div>

            <!-- Daily Quote Widget -->
            <div class="widget-card" style="grid-column: 1 / -1;">
              <div style="font-size: 13px; font-style: italic; color: var(--text-main); line-height: 1.5;">"${randomQuote.text}"</div>
              <div style="font-size: 11px; color: var(--accent); font-weight: 600; text-align: right; margin-top: 4px;">— ${randomQuote.author}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Real-time Clock
    const updateTime = () => {
      const clockEl = container.querySelector('#nt-clock');
      const dateEl = container.querySelector('#nt-date');
      if (!clockEl || !dateEl) return;
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Search events
    const searchInput = container.querySelector('#nt-search-input');
    const searchBtn = container.querySelector('#nt-search-btn');
    const performSearch = () => {
      const q = searchInput.value.trim();
      if (!q) return;
      window.BrowserEngine.navigateTo(tabId, q);
    };
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performSearch();
    });
    searchBtn.addEventListener('click', performSearch);

    // Speed dial clicks
    container.querySelectorAll('.speed-dial-item[data-url]').forEach(item => {
      item.addEventListener('click', () => {
        window.BrowserEngine.navigateTo(tabId, item.dataset.url);
      });
    });

    // Add speed dial
    const addBtn = container.querySelector('#btn-add-speeddial');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const title = prompt('Shortcut Name:');
        if (!title) return;
        const url = prompt('Shortcut URL (e.g., https://example.com or browser://news):');
        if (!url) return;
        speedDials.push({ title, url, icon: '🌐', color: '#3b82f6' });
        localStorage.setItem('aura_speed_dials', JSON.stringify(speedDials));
        this.renderNewTab(container, tabId);
      });
    }

    // Quick notes autosave
    const noteArea = container.querySelector('#nt-quick-note');
    const noteStatus = container.querySelector('#nt-note-status');
    if (noteArea) {
      noteArea.addEventListener('input', () => {
        localStorage.setItem('aura_quick_note', noteArea.value);
        if (noteStatus) {
          noteStatus.textContent = 'Saving...';
          setTimeout(() => { noteStatus.textContent = 'Saved'; }, 400);
        }
      });
    }

    // Weather Location Prompt
    const weatherLoc = container.querySelector('#nt-weather-loc');
    if (weatherLoc) {
      weatherLoc.addEventListener('click', () => {
        const loc = prompt('Enter city name (e.g., London, New York, Tokyo, Sydney):', 'London');
        if (loc) {
          weatherLoc.textContent = `${loc} ✏️`;
          const tempEl = container.querySelector('#nt-weather-temp');
          if (tempEl) tempEl.textContent = `${Math.floor(18 + Math.random() * 12)}°C`;
        }
      });
    }
  },

  /* -------------------------------------------------------------
     2. NEOSEARCH ENGINE
     ------------------------------------------------------------- */
  renderSearch(container, tabId, query = '') {
    container.innerHTML = `
      <div class="native-page-container">
        <div class="search-results-layout">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
            <div style="font-size: 24px; font-weight: 800; font-family: var(--font-display); background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              NeoSearch
            </div>
            <div class="newtab-search-box" style="margin: 0; max-width: 600px; height: 42px;">
              <input type="text" class="newtab-search-input" id="search-page-input" value="${query}" placeholder="Search web..." />
              <button class="btn-primary" id="search-page-btn" style="padding: 4px 14px; font-size: 12px;">Search</button>
            </div>
          </div>

          <div class="search-filter-pills">
            <button class="search-filter-btn active" data-filter="all">🌐 All</button>
            <button class="search-filter-btn" data-filter="wiki">📚 Wikipedia</button>
            <button class="search-filter-btn" data-filter="tech">💻 Developer</button>
            <button class="search-filter-btn" data-filter="images">🖼️ Images</button>
          </div>

          <div id="search-loading" style="display: none; padding: 30px; text-align: center; color: var(--text-muted);">
            <div class="tab-loading-spinner" style="display: inline-block; width: 28px; height: 28px; margin-bottom: 8px;"></div>
            <div>Querying search indices...</div>
          </div>

          <div id="search-results-list"></div>
        </div>
      </div>
    `;

    const input = container.querySelector('#search-page-input');
    const btn = container.querySelector('#search-page-btn');
    const resultsContainer = container.querySelector('#search-results-list');
    const loading = container.querySelector('#search-loading');

    const executeSearch = async (q) => {
      if (!q.trim()) {
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-main);">Search the Knowledge Base</div>
            <div style="font-size: 13px; margin-top: 6px;">Enter keywords to discover articles, technical documentation, games, and web apps.</div>
          </div>
        `;
        return;
      }

      loading.style.display = 'block';
      resultsContainer.innerHTML = '';

      try {
        // Fetch real Wikipedia API summary for instant knowledge card
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`);
        let wikiData = null;
        if (wikiRes.ok) {
          wikiData = await wikiRes.json();
        }

        loading.style.display = 'none';

        let html = '';

        // Math evaluation if math query
        try {
          if (/^[0-9+\-*/().^ %]+$/.test(q) && /[+\-*/]/.test(q)) {
            const mathVal = Function(`'use strict'; return (${q})`)();
            html += `
              <div class="search-result-card" style="border-left: 4px solid var(--accent);">
                <div class="result-url">Calculator • Instant Answer</div>
                <div class="result-title" style="font-size: 24px; font-family: var(--font-mono);">${q} = ${mathVal}</div>
              </div>
            `;
          }
        } catch (e) {}

        // Instant Wikipedia Knowledge Graph Card
        if (wikiData && wikiData.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found' && wikiData.extract) {
          html += `
            <div class="search-result-card" style="background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1)); border: 1.5px solid var(--accent);">
              <div style="display: flex; gap: 16px;">
                ${wikiData.thumbnail ? `<img src="${wikiData.thumbnail.source}" style="width: 90px; height: 90px; object-fit: cover; border-radius: var(--radius-md); border: 1px solid var(--border-color);" />` : ''}
                <div>
                  <div class="result-url">Wikipedia Knowledge Card • Verified</div>
                  <div class="result-title" style="font-size: 18px;" onclick="window.BrowserEngine.navigateTo('${tabId}', 'browser://wikipedia?q=${encodeURIComponent(wikiData.title)}')">${wikiData.title}</div>
                  <div class="result-snippet">${wikiData.extract}</div>
                  <div style="margin-top: 10px; display: flex; gap: 8px;">
                    <button class="btn-primary" style="padding: 4px 12px; font-size: 11px;" onclick="window.BrowserEngine.navigateTo('${tabId}', 'browser://wikipedia?q=${encodeURIComponent(wikiData.title)}')">Open Article in Browser</button>
                    <button class="btn-secondary" style="padding: 4px 12px; font-size: 11px;" onclick="window.BrowserEngine.navigateTo('${tabId}', '${wikiData.content_urls ? wikiData.content_urls.desktop.page : 'https://wikipedia.org'}')">View on Wikipedia.org</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        // Curated intelligent mock & web search results
        const webResults = [
          {
            title: `${q} - Official Documentation & Guides`,
            url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(q)}`,
            snippet: `Comprehensive documentation, tutorials, references, and developer guidelines for ${q}. Includes code examples, browser compatibility tables, and best practices.`
          },
          {
            title: `${q} on GitHub - Open Source Repositories`,
            url: `https://github.com/search?q=${encodeURIComponent(q)}`,
            snippet: `Discover top open source libraries, tools, frameworks, and projects relating to "${q}" with thousands of stars from the global developer community.`
          },
          {
            title: `Latest Discussions & Insights: ${q}`,
            url: `https://news.ycombinator.com`,
            snippet: `Community discussions, architecture teardowns, breaking updates, and technical insights regarding ${q}.`
          },
          {
            title: `Interactive CodeLab Presets for ${q}`,
            url: `browser://codelab`,
            snippet: `Test and prototype with ${q} live in the Aura Browser integrated CodeLab web environment with instant reload and DOM inspection.`
          }
        ];

        webResults.forEach(item => {
          html += `
            <div class="search-result-card">
              <div class="result-url">${item.url}</div>
              <div class="result-title" onclick="window.BrowserEngine.navigateTo('${tabId}', '${item.url}')">${item.title}</div>
              <div class="result-snippet">${item.snippet}</div>
            </div>
          `;
        });

        resultsContainer.innerHTML = html;

      } catch (err) {
        loading.style.display = 'none';
        resultsContainer.innerHTML = `
          <div class="search-result-card">
            <div class="result-title">Search Query: ${q}</div>
            <div class="result-snippet">Direct search completed. You can browse results directly or open external search.</div>
            <div style="margin-top: 12px;">
              <button class="btn-primary" onclick="window.BrowserEngine.navigateTo('${tabId}', 'https://duckduckgo.com/?q=${encodeURIComponent(q)}')">Search on DuckDuckGo</button>
            </div>
          </div>
        `;
      }
    };

    btn.addEventListener('click', () => executeSearch(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch(input.value);
    });

    if (query) {
      executeSearch(query);
    } else {
      executeSearch('');
    }
  },

  /* -------------------------------------------------------------
     3. WIKIPEDIA EXPLORER
     ------------------------------------------------------------- */
  async renderWikipedia(container, tabId, query = 'Web browser') {
    container.innerHTML = `
      <div class="native-page-container" style="max-width: 900px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 28px;">📚</span>
            <div>
              <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Wikipedia Explorer</div>
              <div style="font-size: 12px; color: var(--text-muted);">Live encyclopedia reader with instant distraction-free view</div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="wiki-search-box" value="${query}" style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 6px 12px; color: #fff; width: 220px;" placeholder="Search topic..." />
            <button class="btn-primary" id="wiki-search-btn" style="padding: 6px 14px; font-size: 12px;">Search</button>
          </div>
        </div>

        <div id="wiki-article-content">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div class="tab-loading-spinner" style="display: inline-block; width: 32px; height: 32px; margin-bottom: 12px;"></div>
            <div>Fetching article from Wikipedia API...</div>
          </div>
        </div>
      </div>
    `;

    const searchBox = container.querySelector('#wiki-search-box');
    const searchBtn = container.querySelector('#wiki-search-btn');
    const contentArea = container.querySelector('#wiki-article-content');

    const loadArticle = async (title) => {
      contentArea.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div class="tab-loading-spinner" style="display: inline-block; width: 32px; height: 32px; margin-bottom: 12px;"></div>
          <div>Loading "${title}"...</div>
        </div>
      `;

      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        if (!res.ok) throw new Error('Article not found');
        const data = await res.json();

        contentArea.innerHTML = `
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px;">
            <div style="display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap;">
              ${data.thumbnail ? `
                <img src="${data.thumbnail.source}" alt="${data.title}" style="max-width: 240px; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-md);" />
              ` : ''}
              <div style="flex: 1; min-width: 280px;">
                <h1 style="font-size: 32px; font-weight: 800; font-family: var(--font-heading, var(--font-display)); color: var(--text-main); margin-bottom: 10px;">${data.title}</h1>
                ${data.description ? `<div style="font-size: 14px; color: var(--accent); font-weight: 600; margin-bottom: 16px;">${data.description}</div>` : ''}
                <div style="font-size: 15px; line-height: 1.8; color: var(--text-main); margin-bottom: 24px;">${data.extract_html || data.extract}</div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <a href="${data.content_urls ? data.content_urls.desktop.page : '#'}" target="_blank" class="btn-primary" style="text-decoration: none; font-size: 12px; padding: 8px 16px;">
                    Read Full on Wikipedia ↗
                  </a>
                  <button class="btn-secondary" style="font-size: 12px; padding: 8px 16px;" onclick="navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!');">
                    📋 Copy Article Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        contentArea.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
            <div style="font-size: 18px; font-weight: 700; color: var(--text-main);">Article Not Found</div>
            <div style="font-size: 13px; margin-top: 6px;">Could not retrieve Wikipedia content for "${title}". Try searching for another topic.</div>
          </div>
        `;
      }
    };

    searchBtn.addEventListener('click', () => loadArticle(searchBox.value));
    searchBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loadArticle(searchBox.value);
    });

    loadArticle(query);
  },

  /* -------------------------------------------------------------
     4. TECH NEWS & TRENDS (Live Hacker News Reader)
     ------------------------------------------------------------- */
  async renderNews(container, tabId) {
    container.innerHTML = `
      <div class="native-page-container" style="max-width: 900px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px;">📰</span>
            <div>
              <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Tech Pulse & Hacker News</div>
              <div style="font-size: 12px; color: var(--text-muted);">Live breaking technology news and engineer discussions</div>
            </div>
          </div>
          <button class="btn-secondary" id="news-refresh-btn" style="font-size: 12px; padding: 6px 12px;">🔄 Refresh Feed</button>
        </div>

        <div id="news-feed-list">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div class="tab-loading-spinner" style="display: inline-block; width: 32px; height: 32px; margin-bottom: 12px;"></div>
            <div>Fetching live top stories...</div>
          </div>
        </div>
      </div>
    `;

    const feedList = container.querySelector('#news-feed-list');
    const refreshBtn = container.querySelector('#news-refresh-btn');

    const loadNews = async () => {
      feedList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div class="tab-loading-spinner" style="display: inline-block; width: 32px; height: 32px; margin-bottom: 12px;"></div>
          <div>Loading latest tech stories...</div>
        </div>
      `;

      try {
        const topIdsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topIds = await topIdsRes.json();
        const selectedIds = topIds.slice(0, 15);

        const storyPromises = selectedIds.map(id => 
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
        );

        const stories = await Promise.all(storyPromises);

        feedList.innerHTML = stories.filter(s => s && s.title).map((story, idx) => `
          <div class="search-result-card" style="display: flex; align-items: flex-start; gap: 14px;">
            <div style="font-size: 16px; font-weight: 800; color: var(--accent); min-width: 28px; text-align: center;">#${idx + 1}</div>
            <div style="flex: 1;">
              <div class="result-title" onclick="window.BrowserEngine.navigateTo('${tabId}', '${story.url || `https://news.ycombinator.com/item?id=${story.id}`}')">${story.title}</div>
              <div style="display: flex; gap: 12px; font-size: 11.5px; color: var(--text-dim); margin-top: 4px;">
                <span>🔺 ${story.score || 0} points</span>
                <span>👤 by ${story.by || 'anonymous'}</span>
                <span>💬 ${story.descendants || 0} comments</span>
                ${story.url ? `<span>🌐 ${new URL(story.url).hostname}</span>` : ''}
              </div>
            </div>
            ${story.url ? `
              <button class="btn-primary" style="padding: 6px 12px; font-size: 11px;" onclick="window.BrowserEngine.navigateTo('${tabId}', '${story.url}')">Open ↗</button>
            ` : ''}
          </div>
        `).join('');

      } catch (e) {
        // Fallback curated feed if offline/rate-limited
        const curated = [
          { title: "Next-Gen Web Architecture: WebAssembly and WebGPU Revolution", score: 482, by: "dan_abramov", url: "https://developer.mozilla.org" },
          { title: "Quantum Computing Breakthrough in Fault-Tolerant Qubits", score: 395, by: "quant_phys", url: "https://nature.com" },
          { title: "Building Lightweight High-Performance Browsers in 2026", score: 310, by: "aura_dev", url: "browser://codelab" },
          { title: "The State of Modern JavaScript: Native Modules & Decorators", score: 240, by: "tc39_fan", url: "https://github.com" },
          { title: "OpenAI Announces Open Weights for Advanced Reasoning Models", score: 620, by: "ai_insider", url: "https://openai.com" }
        ];

        feedList.innerHTML = curated.map((story, idx) => `
          <div class="search-result-card" style="display: flex; align-items: flex-start; gap: 14px;">
            <div style="font-size: 16px; font-weight: 800; color: var(--accent); min-width: 28px; text-align: center;">#${idx + 1}</div>
            <div style="flex: 1;">
              <div class="result-title" onclick="window.BrowserEngine.navigateTo('${tabId}', '${story.url}')">${story.title}</div>
              <div style="display: flex; gap: 12px; font-size: 11.5px; color: var(--text-dim); margin-top: 4px;">
                <span>🔺 ${story.score} points</span>
                <span>👤 by ${story.by}</span>
              </div>
            </div>
            <button class="btn-primary" style="padding: 6px 12px; font-size: 11px;" onclick="window.BrowserEngine.navigateTo('${tabId}', '${story.url}')">Open ↗</button>
          </div>
        `).join('');
      }
    };

    refreshBtn.addEventListener('click', loadNews);
    loadNews();
  },

  /* -------------------------------------------------------------
     5. CODELAB IDE (Interactive Web Playground)
     ------------------------------------------------------------- */
  renderCodeLab(container, tabId) {
    const defaultHtml = `<div class="card">
  <h1>🚀 Welcome to CodeLab</h1>
  <p>Edit HTML, CSS, and JS live inside Aura Browser!</p>
  <button id="magic-btn">Click For Magic ✨</button>
  <div id="counter">Clicks: 0</div>
</div>`;

    const defaultCss = `body {
  margin: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #1a1c2e, #0c0e17);
  font-family: 'Segoe UI', Tahoma, sans-serif;
  color: #fff;
}
.card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  max-width: 380px;
}
h1 {
  font-size: 22px;
  margin-bottom: 8px;
  color: #60a5fa;
}
p {
  color: #94a3b8;
  font-size: 14px;
}
button {
  margin-top: 16px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: #fff;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
}
#counter {
  margin-top: 12px;
  font-size: 13px;
  color: #38bdf8;
}`;

    const defaultJs = `let count = 0;
const btn = document.getElementById('magic-btn');
const counter = document.getElementById('counter');

btn.addEventListener('click', () => {
  count++;
  counter.textContent = \`Clicks: \${count} 🌟\`;
  btn.style.transform = \`rotate(\${count * 15}deg) scale(1.1)\`;
  setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
});`;

    container.innerHTML = `
      <div class="codelab-container">
        <div class="codelab-toolbar">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 18px;">💻</span>
            <span style="font-weight: 800; font-family: var(--font-display); font-size: 14px;">CodeLab Web Studio</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <select id="codelab-preset-select" style="background: var(--bg-card-solid); border: 1px solid var(--border-color); color: #fff; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 12px;">
              <option value="magic">Preset: Magic Card</option>
              <option value="particles">Preset: Glowing Canvas</option>
              <option value="clock">Preset: Neon Digital Clock</option>
            </select>
            <button class="btn-primary" id="codelab-run-btn" style="padding: 4px 14px; font-size: 12px;">▶ Run Code</button>
          </div>
        </div>

        <div class="codelab-workspace">
          <div class="codelab-editor-side">
            <div class="codelab-editor-tabs">
              <button class="code-tab-btn active" data-lang="html">HTML</button>
              <button class="code-tab-btn" data-lang="css">CSS</button>
              <button class="code-tab-btn" data-lang="js">JS</button>
            </div>
            <textarea class="code-textarea" id="codelab-html-editor" spellcheck="false">${defaultHtml}</textarea>
            <textarea class="code-textarea" id="codelab-css-editor" spellcheck="false" style="display: none;">${defaultCss}</textarea>
            <textarea class="code-textarea" id="codelab-js-editor" spellcheck="false" style="display: none;">${defaultJs}</textarea>
          </div>
          <div class="codelab-preview-side">
            <iframe id="codelab-preview-frame" sandbox="allow-scripts allow-modals"></iframe>
          </div>
        </div>
      </div>
    `;

    const htmlEd = container.querySelector('#codelab-html-editor');
    const cssEd = container.querySelector('#codelab-css-editor');
    const jsEd = container.querySelector('#codelab-js-editor');
    const preview = container.querySelector('#codelab-preview-frame');
    const runBtn = container.querySelector('#codelab-run-btn');

    // Tab switching
    container.querySelectorAll('.code-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        htmlEd.style.display = btn.dataset.lang === 'html' ? 'block' : 'none';
        cssEd.style.display = btn.dataset.lang === 'css' ? 'block' : 'none';
        jsEd.style.display = btn.dataset.lang === 'js' ? 'block' : 'none';
      });
    });

    const updatePreview = () => {
      const combined = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${cssEd.value}</style>
          </head>
          <body>
            ${htmlEd.value}
            <script>${jsEd.value}<\/script>
          </body>
        </html>
      `;
      preview.srcdoc = combined;
    };

    runBtn.addEventListener('click', updatePreview);
    updatePreview();

    // Preset selector
    const presetSelect = container.querySelector('#codelab-preset-select');
    presetSelect.addEventListener('change', () => {
      if (presetSelect.value === 'clock') {
        htmlEd.value = `<div id="clock">00:00:00</div>`;
        cssEd.value = `body { margin:0; height:100vh; display:flex; align-items:center; justify-content:center; background:#000; font-family:monospace; }
#clock { font-size: 54px; color: #00ff88; text-shadow: 0 0 20px #00ff88; border: 2px solid #00ff88; padding: 20px 40px; border-radius: 12px; }`;
        jsEd.value = `setInterval(() => {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString();
}, 1000);`;
      } else if (presetSelect.value === 'particles') {
        htmlEd.value = `<canvas id="canvas"></canvas>`;
        cssEd.value = `body { margin: 0; overflow: hidden; background: #0b0f19; } canvas { display: block; }`;
        jsEd.value = `const c = document.getElementById('canvas');
const ctx = c.getContext('2d');
c.width = window.innerWidth; c.height = window.innerHeight;
const pts = Array.from({length: 60}, () => ({
  x: Math.random()*c.width, y: Math.random()*c.height,
  vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, r: Math.random()*3+1
}));
function draw() {
  ctx.fillStyle = 'rgba(11, 15, 25, 0.2)';
  ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle = '#38bdf8';
  pts.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if(p.x<0||p.x>c.width) p.vx*=-1;
    if(p.y<0||p.y>c.height) p.vy*=-1;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();`;
      }
      updatePreview();
    });
  },

  /* -------------------------------------------------------------
     6. ARCADE STATION (Playable 2048 & Snake)
     ------------------------------------------------------------- */
  renderArcade(container, tabId) {
    container.innerHTML = `
      <div class="native-page-container">
        <div class="arcade-container">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 480px;">
            <div style="font-size: 24px; font-weight: 800; font-family: var(--font-display); background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              🎮 Aura Arcade
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn-primary" id="arcade-game-2048" style="padding: 6px 12px; font-size: 12px;">Play 2048</button>
              <button class="btn-secondary" id="arcade-game-snake" style="padding: 6px 12px; font-size: 12px;">Play Snake</button>
            </div>
          </div>

          <div id="arcade-viewport" style="width: 100%; display: flex; justify-content: center;"></div>
        </div>
      </div>
    `;

    const viewport = container.querySelector('#arcade-viewport');
    const btn2048 = container.querySelector('#arcade-game-2048');
    const btnSnake = container.querySelector('#arcade-game-snake');

    const start2048 = () => {
      btn2048.classList.replace('btn-secondary', 'btn-primary');
      btnSnake.classList.replace('btn-primary', 'btn-secondary');

      viewport.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <div style="display: flex; justify-content: space-between; width: 340px; align-items: center;">
            <div style="font-size: 20px; font-weight: 800; color: #fff;">Score: <span id="game-2048-score" style="color: var(--accent);">0</span></div>
            <button class="btn-secondary" id="btn-restart-2048" style="font-size: 12px; padding: 4px 10px;">Restart</button>
          </div>
          <div class="arcade-board-2048" id="board-2048"></div>
          <div style="font-size: 12px; color: var(--text-muted);">Use ⬆️ ⬇️ ⬅️ ➡️ arrow keys or W A S D to slide tiles.</div>
        </div>
      `;

      let board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ];
      let score = 0;

      const addRandomTile = () => {
        let empty = [];
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (board[r][c] === 0) empty.push({ r, c });
          }
        }
        if (empty.length > 0) {
          let spot = empty[Math.floor(Math.random() * empty.length)];
          board[spot.r][spot.c] = Math.random() > 0.1 ? 2 : 4;
        }
      };

      const tileColors = {
        0: 'rgba(238, 228, 218, 0.2)',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
      };

      const renderBoard = () => {
        const boardEl = viewport.querySelector('#board-2048');
        const scoreEl = viewport.querySelector('#game-2048-score');
        if (!boardEl) return;
        scoreEl.textContent = score;
        boardEl.innerHTML = '';
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const val = board[r][c];
            const tile = document.createElement('div');
            tile.className = 'tile-2048';
            tile.textContent = val > 0 ? val : '';
            tile.style.background = tileColors[val] || '#3c3a32';
            tile.style.color = val <= 4 ? '#776e65' : '#f9f6f2';
            boardEl.appendChild(tile);
          }
        }
      };

      const slide = (row) => {
        let arr = row.filter(val => val !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
          }
        }
        arr = arr.filter(val => val !== 0);
        while (arr.length < 4) arr.push(0);
        return arr;
      };

      const moveLeft = () => {
        let changed = false;
        for (let r = 0; r < 4; r++) {
          let newRow = slide(board[r]);
          if (newRow.join(',') !== board[r].join(',')) changed = true;
          board[r] = newRow;
        }
        if (changed) { addRandomTile(); renderBoard(); }
      };

      const moveRight = () => {
        let changed = false;
        for (let r = 0; r < 4; r++) {
          let reversed = [...board[r]].reverse();
          let newRow = slide(reversed).reverse();
          if (newRow.join(',') !== board[r].join(',')) changed = true;
          board[r] = newRow;
        }
        if (changed) { addRandomTile(); renderBoard(); }
      };

      const moveUp = () => {
        let changed = false;
        for (let c = 0; c < 4; c++) {
          let col = [board[0][c], board[1][c], board[2][c], board[3][c]];
          let newCol = slide(col);
          for (let r = 0; r < 4; r++) {
            if (board[r][c] !== newCol[r]) changed = true;
            board[r][c] = newCol[r];
          }
        }
        if (changed) { addRandomTile(); renderBoard(); }
      };

      const moveDown = () => {
        let changed = false;
        for (let c = 0; c < 4; c++) {
          let col = [board[0][c], board[1][c], board[2][c], board[3][c]].reverse();
          let newCol = slide(col).reverse();
          for (let r = 0; r < 4; r++) {
            if (board[r][c] !== newCol[r]) changed = true;
            board[r][c] = newCol[r];
          }
        }
        if (changed) { addRandomTile(); renderBoard(); }
      };

      const handleKey = (e) => {
        if (['ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); moveUp(); }
        else if (['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); moveDown(); }
        else if (['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); moveLeft(); }
        else if (['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); moveRight(); }
      };

      window.addEventListener('keydown', handleKey);
      viewport.querySelector('#btn-restart-2048').addEventListener('click', () => {
        board = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        score = 0;
        addRandomTile(); addRandomTile(); renderBoard();
      });

      addRandomTile(); addRandomTile(); renderBoard();
    };

    const startSnake = () => {
      btnSnake.classList.replace('btn-secondary', 'btn-primary');
      btn2048.classList.replace('btn-primary', 'btn-secondary');

      viewport.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <div style="display: flex; justify-content: space-between; width: 340px; align-items: center;">
            <div style="font-size: 20px; font-weight: 800; color: #fff;">Score: <span id="snake-score" style="color: var(--accent);">0</span></div>
            <button class="btn-secondary" id="btn-restart-snake" style="font-size: 12px; padding: 4px 10px;">Restart</button>
          </div>
          <canvas id="snake-canvas" width="340" height="340" style="background: #111827; border: 2px solid var(--border-color); border-radius: 8px;"></canvas>
          <div style="font-size: 12px; color: var(--text-muted);">Control with Arrow keys. Don't hit the walls!</div>
        </div>
      `;

      const canvas = viewport.querySelector('#snake-canvas');
      const ctx = canvas.getContext('2d');
      const scoreEl = viewport.querySelector('#snake-score');
      const gridSize = 17;
      const tileCount = 20;

      let snake = [{ x: 10, y: 10 }];
      let food = { x: 15, y: 15 };
      let dx = 1, dy = 0;
      let score = 0;
      let gameInterval = null;

      const placeFood = () => {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
      };

      const gameStep = () => {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(s => s.x === head.x && s.y === head.y)) {
          clearInterval(gameInterval);
          alert(`Game Over! Final Score: ${score}`);
          return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score += 10;
          scoreEl.textContent = score;
          placeFood();
        } else {
          snake.pop();
        }

        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw food
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI*2);
        ctx.fill();

        // Draw snake
        snake.forEach((segment, idx) => {
          ctx.fillStyle = idx === 0 ? '#38bdf8' : '#10b981';
          ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });
      };

      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
        else if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
        else if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
        else if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
      });

      viewport.querySelector('#btn-restart-snake').addEventListener('click', () => {
        clearInterval(gameInterval);
        snake = [{ x: 10, y: 10 }];
        dx = 1; dy = 0; score = 0; scoreEl.textContent = 0;
        placeFood();
        gameInterval = setInterval(gameStep, 100);
      });

      gameInterval = setInterval(gameStep, 100);
    };

    btn2048.addEventListener('click', start2048);
    btnSnake.addEventListener('click', startSnake);
    start2048();
  },

  /* -------------------------------------------------------------
     7. COPILOT AI BROWSER ASSISTANT
     ------------------------------------------------------------- */
  renderAIAssistant(container, tabId) {
    container.innerHTML = `
      <div class="native-page-container" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div class="avatar-wrapper" style="width: 42px; height: 42px; background: var(--accent-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🤖</div>
          <div>
            <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Aura AI Copilot</div>
            <div style="font-size: 12px; color: var(--text-muted);">Your intelligent browser companion for research, summarization, and coding</div>
          </div>
        </div>

        <div id="ai-chat-messages" style="flex: 1; min-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; margin-bottom: 16px;">
          <div class="search-result-card" style="border-left: 3px solid var(--accent); background: var(--bg-card);">
            <div style="font-weight: 700; color: var(--accent); margin-bottom: 4px;">🤖 Aura AI</div>
            <div style="font-size: 13.5px; line-height: 1.6;">Hello! I am your Aura Browser AI assistant. How can I help you browse, research, or write code today?</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
          <button class="btn-secondary ai-prompt-chip" style="font-size: 11px; padding: 4px 10px;">📄 Summarize current page</button>
          <button class="btn-secondary ai-prompt-chip" style="font-size: 11px; padding: 4px 10px;">💡 Explain quantum computing</button>
          <button class="btn-secondary ai-prompt-chip" style="font-size: 11px; padding: 4px 10px;">⚡ Write JavaScript debounce function</button>
        </div>

        <div style="display: flex; gap: 8px;">
          <input type="text" id="ai-user-input" placeholder="Ask AI anything..." style="flex: 1; background: var(--bg-input); border: 1.5px solid var(--border-color); border-radius: var(--radius-full); padding: 10px 18px; color: #fff; font-size: 13.5px;" />
          <button class="btn-primary" id="ai-send-btn" style="padding: 10px 20px; font-size: 13px;">Send</button>
        </div>
      </div>
    `;

    const chatBox = container.querySelector('#ai-chat-messages');
    const input = container.querySelector('#ai-user-input');
    const sendBtn = container.querySelector('#ai-send-btn');

    const appendMessage = (sender, text) => {
      const msg = document.createElement('div');
      msg.className = 'search-result-card';
      msg.style.borderLeft = sender === 'You' ? '3px solid #10b981' : '3px solid var(--accent)';
      msg.innerHTML = `
        <div style="font-weight: 700; color: ${sender === 'You' ? '#10b981' : 'var(--accent)'}; margin-bottom: 4px;">${sender === 'You' ? '👤 You' : '🤖 Aura AI'}</div>
        <div style="font-size: 13.5px; line-height: 1.6; white-space: pre-wrap;">${text}</div>
      `;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    const handleSend = () => {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      appendMessage('You', q);

      // Smart AI reply simulation with technical competence
      setTimeout(() => {
        let reply = `Here is what I found regarding "${q}":\n\n`;
        if (q.toLowerCase().includes('debounce')) {
          reply += `\`\`\`javascript\nfunction debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(this, args), wait);\n  };\n}\n\`\`\`\nThis implementation captures context and arguments, delaying execution until the user stops typing for \`wait\` ms.`;
        } else if (q.toLowerCase().includes('quantum')) {
          reply += `Quantum computing harnesses the phenomena of quantum mechanics (superposition and entanglement) to perform calculations exponentially faster than classical computers for specific cryptographic and optimization workloads.`;
        } else if (q.toLowerCase().includes('summarize')) {
          reply += `Currently active page summary: You are exploring the Aura Browser environment, featuring multi-tab sandbox sandboxing, developer tools, built-in offline apps, and instant search engines.`;
        } else {
          reply += `I've analyzed your query. To explore this deeper, you can also search via NeoSearch or read comprehensive documentation in Wikipedia Explorer.`;
        }
        appendMessage('Aura AI', reply);
      }, 600);
    };

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    container.querySelectorAll('.ai-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        input.value = chip.textContent.replace(/^[^\w]+/, '');
        handleSend();
      });
    });
  },

  /* -------------------------------------------------------------
     8. NOTES & SCRATCHPAD
     ------------------------------------------------------------- */
  renderNotes(container, tabId) {
    const savedNotes = JSON.parse(localStorage.getItem('aura_notes_list') || JSON.stringify([
      { id: 1, title: 'Project Ideas', content: '1. Build 3D WebGL Metaverse\n2. Integrate WebRTC Video Chat\n3. Export Aura Browser as Desktop App', date: 'Today' },
      { id: 2, title: 'Helpful Shortcuts', content: 'Ctrl+T: New Tab\nCtrl+W: Close Tab\nF12: Developer Tools\nCtrl+L: Focus Omnibox', date: 'Yesterday' }
    ]));

    container.innerHTML = `
      <div class="native-page-container" style="max-width: 900px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px;">📝</span>
            <div>
              <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Web Scratchpad & Notes</div>
              <div style="font-size: 12px; color: var(--text-muted);">Per-browser auto-saving notepad with export support</div>
            </div>
          </div>
          <button class="btn-primary" id="btn-new-note" style="font-size: 12px; padding: 6px 14px;">➕ New Note</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;" id="notes-grid">
          ${savedNotes.map(n => `
            <div class="widget-card" style="position: relative;">
              <div class="widget-card-header">
                <input type="text" class="note-title-input" data-id="${n.id}" value="${n.title}" style="font-weight: 700; color: #fff; width: 75%; background: transparent;" />
                <span class="note-del-btn" data-id="${n.id}" style="color: var(--danger); cursor: pointer; font-size: 14px;">🗑️</span>
              </div>
              <textarea class="note-content-input" data-id="${n.id}" style="width: 100%; height: 120px; background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: var(--radius-sm); color: var(--text-main); padding: 8px; font-size: 12.5px; resize: none;">${n.content}</textarea>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const saveAndRefresh = () => {
      localStorage.setItem('aura_notes_list', JSON.stringify(savedNotes));
    };

    container.querySelectorAll('.note-title-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const item = savedNotes.find(x => x.id == inp.dataset.id);
        if (item) item.title = inp.value;
        saveAndRefresh();
      });
    });

    container.querySelectorAll('.note-content-input').forEach(ta => {
      ta.addEventListener('input', () => {
        const item = savedNotes.find(x => x.id == ta.dataset.id);
        if (item) item.content = ta.value;
        saveAndRefresh();
      });
    });

    container.querySelectorAll('.note-del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = savedNotes.findIndex(x => x.id == btn.dataset.id);
        if (idx > -1) {
          savedNotes.splice(idx, 1);
          saveAndRefresh();
          this.renderNotes(container, tabId);
        }
      });
    });

    container.querySelector('#btn-new-note').addEventListener('click', () => {
      savedNotes.unshift({
        id: Date.now(),
        title: 'Untitled Note',
        content: '',
        date: 'Just now'
      });
      saveAndRefresh();
      this.renderNotes(container, tabId);
    });
  },

  /* -------------------------------------------------------------
     9. BROWSING HISTORY
     ------------------------------------------------------------- */
  renderHistory(container, tabId) {
    const history = JSON.parse(localStorage.getItem('aura_history') || '[]');

    container.innerHTML = `
      <div class="native-page-container" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px;">🕒</span>
            <div>
              <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Browsing History</div>
              <div style="font-size: 12px; color: var(--text-muted);">${history.length} visited pages recorded</div>
            </div>
          </div>
          <button class="btn-secondary" id="btn-clear-history" style="font-size: 12px; color: var(--danger); padding: 6px 14px;">🗑️ Clear Browsing Data</button>
        </div>

        <div id="history-items-list">
          ${history.length === 0 ? `
            <div style="text-align: center; padding: 60px; color: var(--text-muted);">
              <div style="font-size: 40px; margin-bottom: 10px;">🕸️</div>
              <div>No browsing history yet. Explore websites to build your history log!</div>
            </div>
          ` : history.map((item, idx) => `
            <div class="search-result-card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 16px;">
              <div style="display: flex; align-items: center; gap: 12px; flex: 1; overflow: hidden;">
                <span style="font-size: 16px;">🌐</span>
                <div style="overflow: hidden;">
                  <div class="result-title" style="font-size: 13.5px; margin: 0;" onclick="window.BrowserEngine.navigateTo('${tabId}', '${item.url}')">${item.title || item.url}</div>
                  <div class="result-url" style="margin: 0;">${item.url} • <span style="color: var(--text-dim);">${item.time}</span></div>
                </div>
              </div>
              <button class="top-mini-btn btn-del-hist" data-idx="${idx}" style="color: var(--text-dim);" title="Remove entry">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelector('#btn-clear-history').addEventListener('click', () => {
      if (confirm('Clear all browsing history?')) {
        localStorage.removeItem('aura_history');
        this.renderHistory(container, tabId);
      }
    });

    container.querySelectorAll('.btn-del-hist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        history.splice(Number(btn.dataset.idx), 1);
        localStorage.setItem('aura_history', JSON.stringify(history));
        this.renderHistory(container, tabId);
      });
    });
  },

  /* -------------------------------------------------------------
     10. BOOKMARKS MANAGER
     ------------------------------------------------------------- */
  renderBookmarks(container, tabId) {
    const bookmarks = JSON.parse(localStorage.getItem('aura_bookmarks') || JSON.stringify([
      { title: 'Google', url: 'https://www.google.com', icon: '🔍' },
      { title: 'Wikipedia', url: 'https://www.wikipedia.org', icon: '📚' },
      { title: 'GitHub', url: 'https://github.com', icon: '🐙' },
      { title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
      { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: '📰' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '📖' }
    ]));

    container.innerHTML = `
      <div class="native-page-container" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px;">⭐</span>
            <div>
              <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Bookmarks Manager</div>
              <div style="font-size: 12px; color: var(--text-muted);">${bookmarks.length} saved bookmarks</div>
            </div>
          </div>
          <button class="btn-primary" id="btn-add-bm-page" style="font-size: 12px; padding: 6px 14px;">➕ Add Bookmark</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;">
          ${bookmarks.map((bm, idx) => `
            <div class="widget-card" style="cursor: pointer;" onclick="window.BrowserEngine.navigateTo('${tabId}', '${bm.url}')">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 20px;">${bm.icon || '🔖'}</span>
                  <div style="font-weight: 700; font-size: 13px;">${bm.title}</div>
                </div>
                <span class="btn-del-bm" data-idx="${idx}" style="color: var(--danger); font-size: 13px;" onclick="event.stopPropagation();">✕</span>
              </div>
              <div style="font-size: 11px; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${bm.url}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-del-bm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        bookmarks.splice(Number(btn.dataset.idx), 1);
        localStorage.setItem('aura_bookmarks', JSON.stringify(bookmarks));
        window.BrowserEngine.loadBookmarksBar();
        this.renderBookmarks(container, tabId);
      });
    });

    container.querySelector('#btn-add-bm-page').addEventListener('click', () => {
      const title = prompt('Bookmark Title:');
      if (!title) return;
      const url = prompt('URL:');
      if (!url) return;
      bookmarks.push({ title, url, icon: '🔖' });
      localStorage.setItem('aura_bookmarks', JSON.stringify(bookmarks));
      window.BrowserEngine.loadBookmarksBar();
      this.renderBookmarks(container, tabId);
    });
  },

  /* -------------------------------------------------------------
     11. DOWNLOADS MANAGER
     ------------------------------------------------------------- */
  renderDownloads(container, tabId) {
    const downloads = JSON.parse(localStorage.getItem('aura_downloads') || JSON.stringify([
      { filename: 'Aura_Web_Setup.zip', size: '24.5 MB', status: 'Completed', date: 'Today', icon: '📦' },
      { filename: 'Web_Development_Cheatsheet.pdf', size: '2.1 MB', status: 'Completed', date: 'Yesterday', icon: '📄' },
      { filename: 'Wallpaper_Cyberpunk_4K.png', size: '6.8 MB', status: 'Completed', date: 'Sep 27', icon: '🖼️' }
    ]));

    container.innerHTML = `
      <div class="native-page-container" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 28px;">📥</span>
            <div>
              <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Downloads Manager</div>
              <div style="font-size: 12px; color: var(--text-muted);">${downloads.length} files saved</div>
            </div>
          </div>
          <button class="btn-primary" id="btn-sim-dl" style="font-size: 12px; padding: 6px 14px;">⬇️ Download Sample File</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;" id="dl-list">
          ${downloads.map((item, idx) => `
            <div class="search-result-card" style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-size: 28px;">${item.icon}</span>
                <div>
                  <div style="font-weight: 700; font-size: 14px; color: #fff;">${item.filename}</div>
                  <div style="font-size: 12px; color: var(--text-dim);">${item.size} • <span style="color: var(--success);">${item.status}</span> • ${item.date}</div>
                </div>
              </div>
              <button class="btn-secondary btn-del-dl" data-idx="${idx}" style="font-size: 12px; padding: 4px 10px;">Remove</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelector('#btn-sim-dl').addEventListener('click', () => {
      const filename = `Report_${Date.now().toString().slice(-4)}.pdf`;
      downloads.unshift({
        filename,
        size: '1.4 MB',
        status: 'Completed',
        date: 'Just now',
        icon: '📄'
      });
      localStorage.setItem('aura_downloads', JSON.stringify(downloads));
      window.BrowserEngine.showToast(`📥 Downloaded ${filename}`);
      this.renderDownloads(container, tabId);
    });

    container.querySelectorAll('.btn-del-dl').forEach(btn => {
      btn.addEventListener('click', () => {
        downloads.splice(Number(btn.dataset.idx), 1);
        localStorage.setItem('aura_downloads', JSON.stringify(downloads));
        this.renderDownloads(container, tabId);
      });
    });
  },

  /* -------------------------------------------------------------
     12. BROWSER SETTINGS & THEMES
     ------------------------------------------------------------- */
  renderSettings(container, tabId) {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
    const currentSearchEngine = localStorage.getItem('aura_search_engine') || 'NeoSearch';

    container.innerHTML = `
      <div class="native-page-container" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 24px;">
          <span style="font-size: 28px;">⚙️</span>
          <div>
            <div style="font-size: 20px; font-weight: 800; font-family: var(--font-display);">Browser Settings & Customization</div>
            <div style="font-size: 12px; color: var(--text-muted);">Personalize appearance, privacy, search engine, and keyboard shortcuts</div>
          </div>
        </div>

        <!-- Themes Section -->
        <div class="widget-card" style="margin-bottom: 20px;">
          <div class="widget-card-header" style="margin-bottom: 12px;">
            <span>🎨 Appearance & Themes</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
            ${[
              { id: 'default', name: 'Cyber Dark', color: '#3b82f6', bg: '#0c0f17' },
              { id: 'arc-titanium', name: 'Arc Titanium', color: '#00d2ff', bg: '#191b22' },
              { id: 'midnight-amoled', name: 'Midnight AMOLED', color: '#8b5cf6', bg: '#000000' },
              { id: 'synthwave', name: 'Synthwave Neon', color: '#ff2a85', bg: '#130924' },
              { id: 'nord-frost', name: 'Nord Frost', color: '#88c0d0', bg: '#242933' },
              { id: 'solarized-light', name: 'Solarized Light', color: '#268bd2', bg: '#fdf6e3' },
              { id: 'emerald-forest', name: 'Emerald Forest', color: '#10b981', bg: '#091714' },
              { id: 'sunset-rose', name: 'Sunset Rosé', color: '#f43f5e', bg: '#1e1018' }
            ].map(th => `
              <div class="theme-picker-card" data-theme="${th.id}" style="background: ${th.bg}; border: 2px solid ${currentTheme === th.id ? th.color : 'rgba(255,255,255,0.1)'}; border-radius: var(--radius-md); padding: 12px; cursor: pointer; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-weight: 700; font-size: 12px; color: #fff;">${th.name}</span>
                  <span style="width: 12px; height: 12px; border-radius: 50%; background: ${th.color}; display: inline-block;"></span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Search Engine Section -->
        <div class="widget-card" style="margin-bottom: 20px;">
          <div class="widget-card-header" style="margin-bottom: 12px;">
            <span>🔍 Default Search Engine</span>
          </div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            ${['NeoSearch', 'DuckDuckGo', 'Google', 'Bing', 'Wikipedia'].map(eng => `
              <button class="btn-secondary btn-engine-opt ${currentSearchEngine === eng ? 'active' : ''}" data-engine="${eng}" style="font-size: 12px; padding: 8px 16px;">
                ${eng === currentSearchEngine ? '✓ ' : ''}${eng}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Keyboard Shortcuts Table -->
        <div class="widget-card">
          <div class="widget-card-header" style="margin-bottom: 12px;">
            <span>⌨️ Keyboard Shortcuts Reference</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; font-size: 12px;">
            <div><kbd class="key-badge">Ctrl + T</kbd> New Tab</div>
            <div><kbd class="key-badge">Ctrl + W</kbd> Close Active Tab</div>
            <div><kbd class="key-badge">Ctrl + L</kbd> Focus Omnibox</div>
            <div><kbd class="key-badge">Ctrl + R</kbd> Reload Current Tab</div>
            <div><kbd class="key-badge">F12</kbd> Toggle Developer Tools</div>
            <div><kbd class="key-badge">Ctrl + H</kbd> Open History</div>
            <div><kbd class="key-badge">Ctrl + J</kbd> Open Downloads</div>
            <div><kbd class="key-badge">Ctrl + Shift + N</kbd> Incognito Mode</div>
          </div>
        </div>
      </div>
    `;

    // Theme changer
    container.querySelectorAll('.theme-picker-card').forEach(card => {
      card.addEventListener('click', () => {
        const selectedTheme = card.dataset.theme;
        window.BrowserEngine.setTheme(selectedTheme);
        this.renderSettings(container, tabId);
      });
    });

    // Search engine changer
    container.querySelectorAll('.btn-engine-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const eng = btn.dataset.engine;
        localStorage.setItem('aura_search_engine', eng);
        window.BrowserEngine.showToast(`Search engine set to ${eng}`);
        this.renderSettings(container, tabId);
      });
    });
  },

  /* 404 Fallback */
  render404(container, url) {
    container.innerHTML = `
      <div class="native-page-container" style="align-items: center; justify-content: center; text-align: center;">
        <div style="font-size: 64px; margin-bottom: 16px;">🌌</div>
        <h1 style="font-size: 28px; font-weight: 800; font-family: var(--font-display);">Page Not Found</h1>
        <p style="color: var(--text-muted); max-width: 420px; margin: 10px 0 24px;">The internal URL <code>${url}</code> is not recognized by the Aura Browser engine.</p>
        <button class="btn-primary" onclick="window.BrowserEngine.navigateTo(window.BrowserEngine.activeTabId, 'browser://newtab')">Return to Home</button>
      </div>
    `;
  }
};
