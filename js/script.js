// =========================================================================
// Aesthetic Sketch Diary Portfolio — Main Application Logic
// =========================================================================

(function () {
    const STORAGE_KEY = 'aesthetic_sketch_diary_portfolio_v1';
    const THEMES = ['default', 'theme-cream', 'theme-rose', 'theme-PureSketch'];

    // Application State
    let portfolioData = loadPortfolioData();
    let currentSpread = 'about'; // 'cover' | 'about' | 'skills' | 'projects' | 'journey' | 'contact'
    let isBookOpen = false;
    let isInlineEdit = false;
    let soundEnabled = true;
    let currentThemeIndex = 0;
    let currentModalTab = 'personal';

    // DOM Elements
    const coverView = document.getElementById('cover-view');
    const openView = document.getElementById('open-view');
    const closedNotebookCard = document.getElementById('closed-notebook-card');
    const openBookSpread = document.getElementById('open-book-spread');
    const leftPageBody = document.getElementById('left-page-body');
    const rightPageBody = document.getElementById('right-page-body');
    const leftPageNum = document.getElementById('left-page-number');
    const rightPageNum = document.getElementById('right-page-number');
    const indexTabsRail = document.getElementById('index-tabs-rail');
    const btnToggleBook = document.getElementById('btn-toggle-book');
    const toggleBookLabel = document.getElementById('toggle-book-label');
    const btnInlineEdit = document.getElementById('btn-inline-edit');
    const inlineEditLabel = document.getElementById('inline-edit-label');
    const btnFinishInlineEdit = document.getElementById('btn-finish-inline-edit');
    const btnPrevSpread = document.getElementById('btn-prev-spread');
    const btnNextSpread = document.getElementById('btn-next-spread');
    const photoUploadInput = document.getElementById('photo-upload-input');

    // =====================================================================
    // 1. DATA LOADING & PERSISTENCE
    // =====================================================================
    function loadPortfolioData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return deepMerge(structuredClone(DEFAULT_PORTFOLIO_DATA), parsed);
            }
        } catch (err) {
            console.warn('Could not read saved diary data, using default:', err);
        }
        return structuredClone(DEFAULT_PORTFOLIO_DATA);
    }

    function savePortfolioData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
        } catch (err) {
            console.warn('Could not save diary data to localStorage:', err);
        }
    }

    function deepMerge(target, source) {
        if (!source || typeof source !== 'object') return target;
        for (const key of Object.keys(source)) {
            if (Array.isArray(source[key])) {
                target[key] = source[key];
            } else if (source[key] && typeof source[key] === 'object' && target[key] && typeof target[key] === 'object') {
                deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    function setByPath(obj, path, value) {
        const parts = path.split('.');
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in cur)) cur[part] = {};
            cur = cur[part];
        }
        cur[parts[parts.length - 1]] = value;
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // =====================================================================
    // 2. SYNTHESIZED PAPER FLIP SOUND (Web Audio API)
    // =====================================================================
    let audioCtx = null;
    function playPaperFlipSound() {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return;
                audioCtx = new AudioContextClass();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            const duration = 0.14;
            const bufferSize = audioCtx.sampleRate * duration;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                // Soft shaped white noise resembling crisp notebook paper rustle
                const env = Math.sin((i / bufferSize) * Math.PI);
                data[i] = (Math.random() * 2 - 1) * env * 0.12;
            }

            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
            filter.Q.setValueAtTime(1.2, audioCtx.currentTime);

            noise.connect(filter);
            filter.connect(audioCtx.destination);
            noise.start();
        } catch (e) {
            // Ignore audio errors if blocked by browser autoplay policy
        }
    }

    // =====================================================================
    // 3. BUILD HARDWARE: SPIRAL RINGS & INDEX TABS
    // =====================================================================
    function buildNotebookHardware() {
        // Closed cover spiral rings (9 rings)
        const closedRingsEl = document.getElementById('closed-spiral-rings');
        closedRingsEl.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const ring = document.createElement('div');
            ring.className = 'closed-ring-item';
            closedRingsEl.appendChild(ring);
        }

        // Peeking tabs on closed cover
        const peekingEl = document.getElementById('cover-peeking-tabs');
        peekingEl.innerHTML = '';
        portfolioData.tabs.slice(1).forEach(t => {
            const div = document.createElement('div');
            div.className = 'peeking-tab';
            div.style.setProperty('--tab-clr', t.color);
            peekingEl.appendChild(div);
        });

        // Open notebook center spiral rings (13 double rings like Reference Image 3)
        const centerSpine = document.getElementById('center-spiral-column');
        centerSpine.innerHTML = '';
        for (let i = 0; i < 13; i++) {
            const row = document.createElement('div');
            row.className = 'open-ring-row';
            row.innerHTML = `
                <div class="ring-hole"></div>
                <div class="ring-metal-bar"></div>
                <div class="ring-hole"></div>
            `;
            centerSpine.appendChild(row);
        }

        // Right-hand index tabs rail
        renderIndexTabs();
    }

    function renderIndexTabs() {
        indexTabsRail.innerHTML = '';
        portfolioData.tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.className = 'diary-tab-btn' + (currentSpread === tab.id && isBookOpen ? ' active' : '');
            btn.style.setProperty('--tab-color', tab.color);
            btn.innerHTML = `<span>${escapeHtml(tab.label)}</span>`;
            btn.addEventListener('click', () => {
                if (tab.id === 'cover') {
                    closeDiary();
                } else {
                    switchToSpread(tab.id);
                }
            });
            indexTabsRail.appendChild(btn);
        });
    }

    // =====================================================================
    // 4. RENDER COVER & OPEN SPREADS
    // =====================================================================
    function renderCover() {
        document.getElementById('cover-word-top').textContent = portfolioData.diaryMeta.coverLabelTop || 'NOTE';
        document.getElementById('cover-word-bottom').textContent = portfolioData.diaryMeta.coverLabelBottom || 'BOOK';
        document.getElementById('cover-owner-text').textContent = `Belongs to: ${portfolioData.profile.name} ✨`;
        document.getElementById('cover-role-title').textContent = portfolioData.profile.title;
        document.getElementById('cover-tagline-text').textContent = portfolioData.profile.tagline;
    }

    function openDiary(targetSpread = 'about') {
        isBookOpen = true;
        currentSpread = targetSpread;
        playPaperFlipSound();
        coverView.classList.remove('active');
        openView.classList.add('active');
        toggleBookLabel.textContent = 'Close Diary';
        renderIndexTabs();
        renderCurrentSpread();
    }

    function closeDiary() {
        isBookOpen = false;
        playPaperFlipSound();
        openView.classList.remove('active');
        coverView.classList.add('active');
        toggleBookLabel.textContent = 'Open Diary';
        renderCover();
    }

    function switchToSpread(spreadId, direction = 'next') {
        if (!isBookOpen) {
            openDiary(spreadId);
            return;
        }
        if (currentSpread === spreadId) return;
        currentSpread = spreadId;
        playPaperFlipSound();

        // Trigger page turn animation
        openBookSpread.classList.remove('flipping-next', 'flipping-prev');
        void openBookSpread.offsetWidth; // Force reflow
        openBookSpread.classList.add(direction === 'prev' ? 'flipping-prev' : 'flipping-next');

        renderIndexTabs();
        renderCurrentSpread();
    }

    function renderCurrentSpread() {
        const spreadsOrder = ['about', 'skills', 'projects', 'journey', 'contact'];
        const idx = spreadsOrder.indexOf(currentSpread);
        const leftNum = idx * 2 + 1;
        const rightNum = idx * 2 + 2;

        leftPageNum.textContent = `Page 0${leftNum}`;
        rightPageNum.textContent = rightNum < 10 ? `Page 0${rightNum}` : `Page ${rightNum}`;

        if (currentSpread === 'about') {
            renderAboutSpread();
        } else if (currentSpread === 'skills') {
            renderSkillsSpread();
        } else if (currentSpread === 'projects') {
            renderProjectsSpread();
        } else if (currentSpread === 'journey') {
            renderJourneySpread();
        } else if (currentSpread === 'contact') {
            renderContactSpread();
        }

        applyInlineEditListeners();
    }

    // ---------------------------------------------------------------------
    // SPREAD 1: ABOUT ME & PERSONAL INFOS (Pages 01 - 02)
    // ---------------------------------------------------------------------
    function renderAboutSpread() {
        const p = portfolioData.profile;

        // LEFT PAGE: Polaroid + Personal Biodata ("This Diary Belongs To")
        leftPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>📓 Personal Identification</span>
                <span data-editable="diaryMeta.diaryYear">${escapeHtml(portfolioData.diaryMeta.diaryYear)}</span>
            </div>

            <div class="profile-intro-flex">
                <div class="polaroid-card">
                    <div class="washi-strip"></div>
                    <div class="polaroid-photo-box">
                        <img src="${escapeHtml(p.avatar)}" alt="${escapeHtml(p.name)}" id="polaroid-avatar-img" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'" />
                        <button class="change-photo-btn" id="btn-change-photo" title="Upload your own photo">📷 Photo</button>
                    </div>
                    <div class="polaroid-caption-text" data-editable="profile.polaroidCaption">${escapeHtml(p.polaroidCaption)}</div>
                </div>

                <div class="profile-quick-id">
                    <h1 class="owner-big-name" data-editable="profile.name">${escapeHtml(p.name)}</h1>
                    <div class="owner-role-badge" data-editable="profile.title">${escapeHtml(p.title)}</div>
                    <p class="owner-tagline" data-editable="profile.tagline">${escapeHtml(p.tagline)}</p>
                    <div style="margin-top:10px; font-family:var(--font-note); font-size:0.98rem; color:var(--ink-green); font-weight:700;">
                        <span data-editable="profile.status">${escapeHtml(p.status)}</span>
                    </div>
                </div>
            </div>

            <div class="biodata-box">
                <div class="biodata-box-title">📌 Personal Infos & Biodata</div>
                <div class="biodata-grid">
                    <div class="bio-line">
                        <span class="bio-key">✨ Nickname:</span>
                        <span class="bio-val" data-editable="profile.nickname">${escapeHtml(p.nickname)}</span>
                    </div>
                    <div class="bio-line">
                        <span class="bio-key">🎂 Birthday:</span>
                        <span class="bio-val" data-editable="profile.birthday">${escapeHtml(p.birthday)}</span>
                    </div>
                    <div class="bio-line">
                        <span class="bio-key">📍 Location:</span>
                        <span class="bio-val" data-editable="profile.location">${escapeHtml(p.location)}</span>
                    </div>
                    <div class="bio-line">
                        <span class="bio-key">🎓 Education:</span>
                        <span class="bio-val" data-editable="profile.educationShort">${escapeHtml(p.educationShort)}</span>
                    </div>
                    <div class="bio-line">
                        <span class="bio-key">🗣️ Languages:</span>
                        <span class="bio-val" data-editable="profile.languages">${escapeHtml(p.languages)}</span>
                    </div>
                    <div class="bio-line">
                        <span class="bio-key">💫 Vibe / MBTI:</span>
                        <span class="bio-val" data-editable="profile.mbtiOrVibe">${escapeHtml(p.mbtiOrVibe)}</span>
                    </div>
                </div>
            </div>

            <div class="biodata-box" style="background:rgba(255, 243, 161, 0.45); margin-bottom:0;">
                <div class="biodata-box-title">💖 Little Things I Love</div>
                <div class="biodata-grid">
                    ${(p.favorites || []).map((fav, idx) => `
                        <div class="bio-line">
                            <span class="bio-key" data-editable="profile.favorites.${idx}.label">${escapeHtml(fav.label)}:</span>
                            <span class="bio-val" data-editable="profile.favorites.${idx}.value">${escapeHtml(fav.value)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // RIGHT PAGE: Dear Diary Entry + Hobbies + Sticky Note Quote
        rightPageBody.innerHTML = `
            <div class="page-top-meta">
                <span data-editable="profile.dearDiaryDate">${escapeHtml(p.dearDiaryDate)}</span>
                <span data-editable="profile.weatherMood">${escapeHtml(p.weatherMood)}</span>
            </div>

            <h2 class="sketch-heading">Dear Diary, Who Am I? ✍️</h2>

            <div class="diary-entry-text" data-editable="profile.bio">${escapeHtml(p.bio)}</div>
            <div class="diary-entry-text" data-editable="profile.bioSecondParagraph">${escapeHtml(p.bioSecondParagraph)}</div>

            <div class="sketch-sticky-note">
                <p data-editable="profile.stickyNoteQuote">${escapeHtml(p.stickyNoteQuote)}</p>
            </div>

            <div style="margin-top:12px;">
                <div class="biodata-box-title">🎨 My Hobbies & Pastimes</div>
                <div class="doodle-tags-wrap">
                    ${(p.hobbies || []).map((hobby, idx) => `
                        <span class="doodle-pill" data-editable="profile.hobbies.${idx}">${escapeHtml(hobby)}</span>
                    `).join('')}
                </div>
            </div>
        `;

        // Bind photo upload button
        const btnChangePhoto = document.getElementById('btn-change-photo');
        if (btnChangePhoto) {
            btnChangePhoto.addEventListener('click', (e) => {
                e.stopPropagation();
                photoUploadInput.click();
            });
        }
    }

    // ---------------------------------------------------------------------
    // SPREAD 2: SKILLS & CREATIVE TOOLKIT (Pages 03 - 04)
    // ---------------------------------------------------------------------
    function renderSkillsSpread() {
        const s = portfolioData.skills;
        const cat0 = s.categories[0] || { name: 'Technical Skills', items: [] };
        const cat1 = s.categories[1] || { name: 'Design & Workflow', items: [] };

        leftPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>🛠️ My Craft & Capabilities</span>
                <span>Skill Log</span>
            </div>

            <h2 class="sketch-heading" data-editable="skills.leftPageTitle">${escapeHtml(s.leftPageTitle)}</h2>

            <div class="sketch-skill-group">
                <div class="biodata-box-title" data-editable="skills.categories.0.name">${escapeHtml(cat0.name)}</div>
                ${cat0.items.map((item, i) => `
                    <div class="sketch-skill-item">
                        <div class="sketch-skill-top">
                            <span data-editable="skills.categories.0.items.${i}.name">${escapeHtml(item.name)}</span>
                            <span>${item.level}% • <em data-editable="skills.categories.0.items.${i}.note">${escapeHtml(item.note || '')}</em></span>
                        </div>
                        <div class="sketch-bar-track">
                            <div class="sketch-bar-fill" style="width:${Math.min(100, Math.max(0, item.level))}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="sketch-skill-group" style="margin-bottom:0;">
                <div class="biodata-box-title" data-editable="skills.categories.1.name">${escapeHtml(cat1.name)}</div>
                ${cat1.items.map((item, i) => `
                    <div class="sketch-skill-item">
                        <div class="sketch-skill-top">
                            <span data-editable="skills.categories.1.items.${i}.name">${escapeHtml(item.name)}</span>
                            <span>${item.level}% • <em data-editable="skills.categories.1.items.${i}.note">${escapeHtml(item.note || '')}</em></span>
                        </div>
                        <div class="sketch-bar-track">
                            <div class="sketch-bar-fill" style="width:${Math.min(100, Math.max(0, item.level))}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        rightPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>✨ Stickers & Toolkit</span>
                <span>Always Growing</span>
            </div>

            <h2 class="sketch-heading" data-editable="skills.rightPageTitle">${escapeHtml(s.rightPageTitle)}</h2>

            <div class="biodata-box">
                <div class="biodata-box-title">🏷️ Tech & Tool Stickers</div>
                <div class="doodle-tags-wrap">
                    ${(s.stickers || []).map((st, idx) => `
                        <span class="doodle-pill" data-editable="skills.stickers.${idx}">${escapeHtml(st)}</span>
                    `).join('')}
                </div>
            </div>

            <div class="sketch-sticky-note" style="background:var(--sticky-mint); transform:rotate(-1deg);">
                <div class="biodata-box-title" style="color:var(--ink-green);">🌱 Currently Learning & Exploring</div>
                <p data-editable="skills.currentlyLearning">${escapeHtml(s.currentlyLearning)}</p>
            </div>

            <div class="biodata-box" style="margin-top:16px;">
                <div class="biodata-box-title">📝 How I Like to Work</div>
                <p style="font-family:var(--font-hand); font-size:1.35rem; line-height:1.35; color:var(--ink-body);">
                    1. Sketch out ideas on paper first ✏️<br/>
                    2. Build clean, accessible & responsive layouts 💻<br/>
                    3. Sprinkle delightful details & micro-interactions ✨
                </p>
            </div>
        `;
    }

    // ---------------------------------------------------------------------
    // SPREAD 3: PROJECTS SCRAPBOOK (Pages 05 - 06)
    // ---------------------------------------------------------------------
    function renderProjectsSpread() {
        const projects = portfolioData.projects || [];
        const half = Math.ceil(projects.length / 2);
        const leftProjects = projects.slice(0, half);
        const rightProjects = projects.slice(half);

        const renderProjectCard = (proj, actualIndex) => `
            <div class="scrapbook-card">
                <div class="scrapbook-card-top">
                    <img class="scrapbook-thumb" src="${escapeHtml(proj.image)}" alt="${escapeHtml(proj.title)}" onerror="this.src='https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80'" />
                    <div>
                        <div class="scrapbook-meta">
                            <span data-editable="projects.${actualIndex}.category">${escapeHtml(proj.category)}</span> • 
                            <span data-editable="projects.${actualIndex}.date">${escapeHtml(proj.date)}</span>
                        </div>
                        <h3 class="scrapbook-title" data-editable="projects.${actualIndex}.title">${escapeHtml(proj.title)}</h3>
                    </div>
                </div>
                <p class="scrapbook-desc" data-editable="projects.${actualIndex}.description">${escapeHtml(proj.description)}</p>
                <div class="scrapbook-footer">
                    <div class="doodle-tags-wrap" style="margin-top:0;">
                        ${(proj.tags || []).map(t => `<span class="doodle-pill" style="font-size:0.82rem; padding:1px 8px;">${escapeHtml(t)}</span>`).join('')}
                    </div>
                    <div style="display:flex; gap:6px;">
                        ${proj.demoLink ? `<a class="sketch-btn-sm" href="${escapeHtml(proj.demoLink)}" target="_blank" rel="noopener">🔗 View</a>` : ''}
                        ${proj.githubLink ? `<a class="sketch-btn-sm" href="${escapeHtml(proj.githubLink)}" target="_blank" rel="noopener" style="background:#fff;">🐙 Code</a>` : ''}
                    </div>
                </div>
            </div>
        `;

        leftPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>🚀 Creative Scrapbook</span>
                <span>Selected Works (Part 1)</span>
            </div>
            <h2 class="sketch-heading">My Sketchbook Projects 📂</h2>
            <div>
                ${leftProjects.map((p, idx) => renderProjectCard(p, idx)).join('')}
            </div>
        `;

        rightPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>🌟 Built with Love</span>
                <span>Selected Works (Part 2)</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h2 class="sketch-heading" style="margin-bottom:0;">More Creations ✨</h2>
                <button class="sketch-btn-sm" id="btn-quick-add-project">+ Add Project</button>
            </div>
            <div>
                ${rightProjects.map((p, idx) => renderProjectCard(p, half + idx)).join('')}
            </div>
        `;

        const quickAddBtn = document.getElementById('btn-quick-add-project');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                openModal('projects');
            });
        }
    }

    // ---------------------------------------------------------------------
    // SPREAD 4: JOURNEY & TIMELINE (Pages 07 - 08)
    // ---------------------------------------------------------------------
    function renderJourneySpread() {
        const items = portfolioData.journey || [];
        const half = Math.ceil(items.length / 2);
        const leftItems = items.slice(0, half);
        const rightItems = items.slice(half);

        const renderTimelineItem = (item, realIdx) => `
            <div class="diary-timeline-card">
                <div style="font-family:var(--font-hand); font-size:1.2rem; font-weight:700; color:var(--ink-accent);" data-editable="journey.${realIdx}.period">
                    ${escapeHtml(item.period)}
                </div>
                <div style="font-family:var(--font-title); font-size:1.22rem; font-weight:700; color:var(--sketch-black);" data-editable="journey.${realIdx}.title">
                    ${escapeHtml(item.title)}
                </div>
                <div style="font-family:var(--font-note); font-size:1rem; color:var(--ink-muted); margin-bottom:4px;" data-editable="journey.${realIdx}.place">
                    📍 ${escapeHtml(item.place)}
                </div>
                <p style="font-family:var(--font-note); font-size:1.02rem; color:var(--ink-body); line-height:1.35;" data-editable="journey.${realIdx}.description">
                    ${escapeHtml(item.description)}
                </p>
            </div>
        `;

        leftPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>🎓 My Story So Far</span>
                <span>Chapters & Milestones</span>
            </div>
            <h2 class="sketch-heading">Education & Experience 📜</h2>
            <div class="diary-timeline">
                ${leftItems.map((it, idx) => renderTimelineItem(it, idx)).join('')}
            </div>
        `;

        rightPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>🌱 Footprints</span>
                <span>Memories & Goals</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h2 class="sketch-heading" style="margin-bottom:0;">Milestones & Chapters 🌟</h2>
                <button class="sketch-btn-sm" id="btn-quick-add-journey">+ Add Milestone</button>
            </div>
            <div class="diary-timeline">
                ${rightItems.map((it, idx) => renderTimelineItem(it, half + idx)).join('')}
            </div>
            <div class="sketch-sticky-note" style="margin-top:16px;">
                <p>✨ "Every big journey begins with a single scribbled page in a notebook."</p>
            </div>
        `;

        const quickAddJourney = document.getElementById('btn-quick-add-journey');
        if (quickAddJourney) {
            quickAddJourney.addEventListener('click', () => {
                openModal('journey');
            });
        }
    }

    // ---------------------------------------------------------------------
    // SPREAD 5: CONTACT & DIARY GUESTBOOK (Pages 09 - 10)
    // ---------------------------------------------------------------------
    function renderContactSpread() {
        const c = portfolioData.contact;

        leftPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>💌 Pen-Pal & Contact</span>
                <span>Say Hello!</span>
            </div>

            <h2 class="sketch-heading">Where to Find Me 📬</h2>

            <div class="postal-card">
                <div class="postage-stamp">
                    <span>AIR</span>
                    <span>MAIL</span>
                    <span>✈️</span>
                </div>
                <div class="biodata-box-title">📇 Direct Contact Card</div>
                <p style="font-family:var(--font-hand); font-size:1.3rem; margin-bottom:12px; padding-right:55px;" data-editable="contact.note">
                    ${escapeHtml(c.note)}
                </p>
                <div class="biodata-grid">
                    <div class="bio-line">
                        <span class="bio-key">📧 Email:</span>
                        <span class="bio-val" data-editable="contact.email">${escapeHtml(c.email)}</span>
                    </div>
                    <div class="bio-line">
                        <span class="bio-key">📱 Phone:</span>
                        <span class="bio-val" data-editable="contact.phone">${escapeHtml(c.phone)}</span>
                    </div>
                    <div class="bio-line">
                        <span class="bio-key">📍 City:</span>
                        <span class="bio-val" data-editable="contact.location">${escapeHtml(c.location)}</span>
                    </div>
                </div>

                <div style="margin-top:14px;">
                    <div class="biodata-box-title">🌐 My Social Corners</div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        ${c.github ? `<a class="sketch-btn-sm" href="${escapeHtml(c.github)}" target="_blank" rel="noopener">🐙 GitHub</a>` : ''}
                        ${c.linkedin ? `<a class="sketch-btn-sm" href="${escapeHtml(c.linkedin)}" target="_blank" rel="noopener">💼 LinkedIn</a>` : ''}
                        ${c.instagram ? `<a class="sketch-btn-sm" href="${escapeHtml(c.instagram)}" target="_blank" rel="noopener">📸 Instagram</a>` : ''}
                        ${c.facebook ? `<a class="sketch-btn-sm" href="${escapeHtml(c.facebook)}" target="_blank" rel="noopener">📘 Facebook</a>` : ''}
                        <a class="sketch-btn-sm" href="mailto:${escapeHtml(c.email)}" style="background:var(--tape-mint);">✉️ Send Email</a>
                    </div>
                </div>
            </div>
        `;

        rightPageBody.innerHTML = `
            <div class="page-top-meta">
                <span>🖊️ Scribble a Note</span>
                <span>Diary Guestbook</span>
            </div>

            <h2 class="sketch-heading">Leave a Note in My Diary 📌</h2>

            <form id="guestbook-form" class="biodata-box" style="background:#fff;">
                <div class="sketch-field">
                    <label for="gb-name">Your Name / Pen Name:</label>
                    <input type="text" id="gb-name" class="sketch-input" placeholder="e.g., Alex ✨" required />
                </div>
                <div class="sketch-field">
                    <label for="gb-msg">Your Message or Note:</label>
                    <textarea id="gb-msg" class="sketch-textarea" rows="2" placeholder="Write something sweet or drop your contact..." required></textarea>
                </div>
                <button type="submit" class="sketch-btn-sm" style="background:var(--cover-green); color:#fff; padding:6px 16px;">
                    📌 Pin Note to Diary
                </button>
            </form>

            <div id="guestbook-notes-list" style="max-height:240px; overflow-y:auto; padding-right:4px;">
                ${(c.guestbookEntries || []).map((entry, idx) => `
                    <div class="sketch-sticky-note" style="margin:8px 0; padding:10px 14px; background:${idx % 2 === 0 ? 'var(--sticky-yellow)' : 'var(--sticky-pink)'};">
                        <div style="display:flex; justify-content:space-between; font-family:var(--font-title); font-size:0.95rem; font-weight:700;">
                            <span>From: ${escapeHtml(entry.name)}</span>
                            <span style="color:var(--ink-muted);">${escapeHtml(entry.date)}</span>
                        </div>
                        <p style="font-size:1.2rem; margin-top:3px;">${escapeHtml(entry.message)}</p>
                    </div>
                `).join('')}
            </div>
        `;

        const gbForm = document.getElementById('guestbook-form');
        if (gbForm) {
            gbForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('gb-name');
                const msgInput = document.getElementById('gb-msg');
                const nameVal = nameInput.value.trim();
                const msgVal = msgInput.value.trim();
                if (!nameVal || !msgVal) return;

                if (!portfolioData.contact.guestbookEntries) {
                    portfolioData.contact.guestbookEntries = [];
                }
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                portfolioData.contact.guestbookEntries.unshift({
                    name: nameVal,
                    date: dateStr,
                    message: msgVal
                });
                savePortfolioData();
                playPaperFlipSound();
                renderContactSpread();
            });
        }
    }

    // =====================================================================
    // 5. INLINE ON-PAGE EDITING MODE
    // =====================================================================
    function toggleInlineEditMode(forceState) {
        isInlineEdit = typeof forceState === 'boolean' ? forceState : !isInlineEdit;
        document.body.classList.toggle('is-editing', isInlineEdit);
        btnInlineEdit.classList.toggle('edit-active', isInlineEdit);
        inlineEditLabel.textContent = isInlineEdit ? 'Edit On-Page: ON' : 'Edit On-Page: OFF';

        if (isInlineEdit && !isBookOpen) {
            openDiary('about');
        } else {
            applyInlineEditListeners();
        }
    }

    function applyInlineEditListeners() {
        const editables = document.querySelectorAll('[data-editable]');
        editables.forEach(el => {
            if (isInlineEdit) {
                el.setAttribute('contenteditable', 'true');
                el.setAttribute('spellcheck', 'false');
            } else {
                el.removeAttribute('contenteditable');
            }

            if (!el.dataset.boundEdit) {
                el.dataset.boundEdit = 'true';
                el.addEventListener('blur', () => {
                    const path = el.getAttribute('data-editable');
                    const newVal = el.innerText.trim();
                    setByPath(portfolioData, path, newVal);
                    savePortfolioData();
                    renderCover();
                });
            }
        });
    }

    // =====================================================================
    // 6. POLAROID PHOTO UPLOAD HANDLER
    // =====================================================================
    photoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            const img = new Image();
            img.onload = function () {
                // Resize image to max 500x500 so it saves cleanly in localStorage
                const canvas = document.createElement('canvas');
                const maxDim = 500;
                let w = img.width;
                let height = img.height;
                if (w > height && w > maxDim) {
                    height = Math.round((height * maxDim) / w);
                    w = maxDim;
                } else if (height > maxDim) {
                    w = Math.round((w * maxDim) / height);
                    height = maxDim;
                }
                canvas.width = w;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                portfolioData.profile.avatar = dataUrl;
                savePortfolioData();
                if (currentSpread === 'about') {
                    renderAboutSpread();
                }
                if (document.getElementById('customizer-modal').classList.contains('active')) {
                    renderModalTabContent();
                }
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });

    // =====================================================================
    // 7. INTERACTIVE SKETCH PEN & DOODLE CANVAS
    // =====================================================================
    const doodleCanvas = document.getElementById('doodle-canvas');
    const doodleCtx = doodleCanvas.getContext('2d');
    const doodlePalette = document.getElementById('doodle-palette');
    const btnDoodleMode = document.getElementById('btn-doodle-mode');
    const restingPen = document.getElementById('resting-pen');

    let isDoodleActive = false;
    let isDrawing = false;
    let penColor = '#1e1b18';
    let penSize = 2.8;
    let lastX = 0;
    let lastY = 0;

    function resizeDoodleCanvas() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = doodleCanvas.width;
        tempCanvas.height = doodleCanvas.height;
        if (doodleCanvas.width > 0 && doodleCanvas.height > 0) {
            tempCanvas.getContext('2d').drawImage(doodleCanvas, 0, 0);
        }
        doodleCanvas.width = window.innerWidth;
        doodleCanvas.height = window.innerHeight;
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
            doodleCtx.drawImage(tempCanvas, 0, 0);
        }
    }
    window.addEventListener('resize', resizeDoodleCanvas);
    resizeDoodleCanvas();

    function toggleDoodleMode(force) {
        isDoodleActive = typeof force === 'boolean' ? force : !isDoodleActive;
        doodleCanvas.classList.toggle('drawing-enabled', isDoodleActive);
        doodlePalette.classList.toggle('show', isDoodleActive);
        btnDoodleMode.classList.toggle('active', isDoodleActive);
        if (restingPen) {
            restingPen.classList.toggle('pen-in-hand', isDoodleActive);
        }
    }

    btnDoodleMode.addEventListener('click', () => toggleDoodleMode());
    if (restingPen) {
        restingPen.addEventListener('click', () => toggleDoodleMode());
    }
    document.getElementById('btn-close-doodle').addEventListener('click', () => toggleDoodleMode(false));
    document.getElementById('btn-clear-doodles').addEventListener('click', () => {
        doodleCtx.clearRect(0, 0, doodleCanvas.width, doodleCanvas.height);
    });

    document.querySelectorAll('.ink-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            document.querySelectorAll('.ink-swatch').forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
            penColor = swatch.dataset.color;
            penSize = parseFloat(swatch.dataset.size || '2.8');
        });
    });

    doodleCanvas.addEventListener('pointerdown', (e) => {
        if (!isDoodleActive) return;
        isDrawing = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    doodleCanvas.addEventListener('pointermove', (e) => {
        if (!isDrawing || !isDoodleActive) return;
        doodleCtx.beginPath();
        doodleCtx.moveTo(lastX, lastY);
        doodleCtx.lineTo(e.clientX, e.clientY);
        doodleCtx.strokeStyle = penColor;
        doodleCtx.lineWidth = penSize;
        doodleCtx.lineCap = 'round';
        doodleCtx.lineJoin = 'round';
        doodleCtx.stroke();
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
        isDrawing = false;
    });

    // =====================================================================
    // 8. FULL DETAILS MANAGER MODAL
    // =====================================================================
    const customizerModal = document.getElementById('customizer-modal');
    const modalTabContent = document.getElementById('modal-tab-content');

    function openModal(tabName = 'personal') {
        currentModalTab = tabName;
        customizerModal.classList.add('active');
        updateModalTabButtons();
        renderModalTabContent();
    }

    function closeModal() {
        customizerModal.classList.remove('active');
        renderCover();
        if (isBookOpen) renderCurrentSpread();
    }

    function updateModalTabButtons() {
        document.querySelectorAll('.modal-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mtab === currentModalTab);
        });
    }

    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            collectCurrentModalTabInputs();
            currentModalTab = btn.dataset.mtab;
            updateModalTabButtons();
            renderModalTabContent();
        });
    });

    function renderModalTabContent() {
        const p = portfolioData.profile;
        const c = portfolioData.contact;

        if (currentModalTab === 'personal') {
            modalTabContent.innerHTML = `
                <div class="form-grid-2">
                    <div class="sketch-field">
                        <label>Full Name:</label>
                        <input type="text" class="sketch-input" id="m-name" value="${escapeHtml(p.name)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Nickname:</label>
                        <input type="text" class="sketch-input" id="m-nickname" value="${escapeHtml(p.nickname)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Role / Headline:</label>
                        <input type="text" class="sketch-input" id="m-title" value="${escapeHtml(p.title)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Birthday:</label>
                        <input type="text" class="sketch-input" id="m-birthday" value="${escapeHtml(p.birthday)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Location / City:</label>
                        <input type="text" class="sketch-input" id="m-location" value="${escapeHtml(p.location)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Education (Short):</label>
                        <input type="text" class="sketch-input" id="m-edu" value="${escapeHtml(p.educationShort)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Languages:</label>
                        <input type="text" class="sketch-input" id="m-lang" value="${escapeHtml(p.languages)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Vibe / MBTI / Personality:</label>
                        <input type="text" class="sketch-input" id="m-mbti" value="${escapeHtml(p.mbtiOrVibe)}" />
                    </div>
                </div>

                <div class="sketch-field">
                    <label>Tagline:</label>
                    <input type="text" class="sketch-input" id="m-tagline" value="${escapeHtml(p.tagline)}" />
                </div>

                <div class="sketch-field">
                    <label>Profile Photo (Upload from PC or Paste Image URL):</label>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="text" class="sketch-input" id="m-avatar" value="${escapeHtml(p.avatar)}" />
                        <button type="button" class="sketch-btn-sm" id="m-btn-upload-photo" style="white-space:nowrap; padding:8px 14px;">📷 Upload File</button>
                    </div>
                </div>

                <div class="sketch-field">
                    <label>Dear Diary — Bio Paragraph 1:</label>
                    <textarea class="sketch-textarea" id="m-bio1" rows="3">${escapeHtml(p.bio)}</textarea>
                </div>

                <div class="sketch-field">
                    <label>Dear Diary — Bio Paragraph 2:</label>
                    <textarea class="sketch-textarea" id="m-bio2" rows="2">${escapeHtml(p.bioSecondParagraph)}</textarea>
                </div>

                <div class="sketch-field">
                    <label>Favorite Quote (Sticky Note):</label>
                    <input type="text" class="sketch-input" id="m-quote" value="${escapeHtml(p.stickyNoteQuote)}" />
                </div>
            `;

            document.getElementById('m-btn-upload-photo').addEventListener('click', () => {
                photoUploadInput.click();
            });

        } else if (currentModalTab === 'favorites') {
            modalTabContent.innerHTML = `
                <h3 style="font-family:var(--font-title); margin-bottom:10px;">💖 Favorite Things</h3>
                ${(p.favorites || []).map((fav, i) => `
                    <div class="form-grid-2" style="margin-bottom:8px;">
                        <input type="text" class="sketch-input m-fav-label" data-idx="${i}" value="${escapeHtml(fav.label)}" placeholder="Category (e.g. ☕ Drink)" />
                        <input type="text" class="sketch-input m-fav-val" data-idx="${i}" value="${escapeHtml(fav.value)}" placeholder="Your favorite..." />
                    </div>
                `).join('')}

                <h3 style="font-family:var(--font-title); margin:18px 0 8px 0;">🎨 Hobbies (Comma separated)</h3>
                <textarea class="sketch-textarea" id="m-hobbies-csv" rows="3">${escapeHtml((p.hobbies || []).join(', '))}</textarea>
            `;

        } else if (currentModalTab === 'skills') {
            const s = portfolioData.skills;
            modalTabContent.innerHTML = `
                <h3 style="font-family:var(--font-title); margin-bottom:10px;">🛠️ Skill Stickers (Comma separated)</h3>
                <textarea class="sketch-textarea" id="m-stickers-csv" rows="3">${escapeHtml((s.stickers || []).join(', '))}</textarea>

                <div class="sketch-field" style="margin-top:14px;">
                    <label>🌱 Currently Learning Note:</label>
                    <input type="text" class="sketch-input" id="m-learning" value="${escapeHtml(s.currentlyLearning)}" />
                </div>
                <p style="font-family:var(--font-note); color:var(--ink-muted); margin-top:8px;">
                    💡 Tip: You can also turn on <strong>"✏️ Edit On-Page"</strong> in the top bar to click and edit any skill name directly on the notebook page!
                </p>
            `;

        } else if (currentModalTab === 'projects') {
            const projects = portfolioData.projects || [];
            modalTabContent.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <h3 style="font-family:var(--font-title);">🚀 Manage Scrapbook Projects</h3>
                    <button type="button" class="sketch-btn-sm" id="m-add-proj-btn">+ Add New Project</button>
                </div>
                <div id="m-projects-list">
                    ${projects.map((proj, idx) => `
                        <div class="dynamic-item-card" data-proj-idx="${idx}">
                            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                <strong>Project #${idx + 1}</strong>
                                <button type="button" class="sketch-btn-sm m-del-proj" data-idx="${idx}" style="background:#ffd8be;">🗑️ Remove</button>
                            </div>
                            <div class="form-grid-2">
                                <div class="sketch-field">
                                    <label>Title:</label>
                                    <input type="text" class="sketch-input m-p-title" value="${escapeHtml(proj.title)}" />
                                </div>
                                <div class="sketch-field">
                                    <label>Category & Date:</label>
                                    <div style="display:flex; gap:6px;">
                                        <input type="text" class="sketch-input m-p-cat" value="${escapeHtml(proj.category)}" placeholder="Web App" />
                                        <input type="text" class="sketch-input m-p-date" value="${escapeHtml(proj.date)}" placeholder="Nov 2026" />
                                    </div>
                                </div>
                            </div>
                            <div class="sketch-field">
                                <label>Description:</label>
                                <textarea class="sketch-textarea m-p-desc" rows="2">${escapeHtml(proj.description)}</textarea>
                            </div>
                            <div class="form-grid-2">
                                <div class="sketch-field">
                                    <label>Live Demo Link:</label>
                                    <input type="text" class="sketch-input m-p-demo" value="${escapeHtml(proj.demoLink)}" />
                                </div>
                                <div class="sketch-field">
                                    <label>GitHub Link:</label>
                                    <input type="text" class="sketch-input m-p-git" value="${escapeHtml(proj.githubLink)}" />
                                </div>
                            </div>
                            <div class="form-grid-2">
                                <div class="sketch-field">
                                    <label>Tags (comma separated):</label>
                                    <input type="text" class="sketch-input m-p-tags" value="${escapeHtml((proj.tags || []).join(', '))}" />
                                </div>
                                <div class="sketch-field">
                                    <label>Image URL:</label>
                                    <input type="text" class="sketch-input m-p-img" value="${escapeHtml(proj.image)}" />
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            document.getElementById('m-add-proj-btn').addEventListener('click', () => {
                collectCurrentModalTabInputs();
                portfolioData.projects.unshift({
                    id: Date.now(),
                    title: 'New Sketchbook Project',
                    category: 'Creative Web',
                    date: '2026',
                    description: 'Describe what this project does and why you loved building it!',
                    tags: ['HTML', 'CSS', 'JavaScript'],
                    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80',
                    demoLink: '#',
                    githubLink: 'https://github.com/sanjida5102'
                });
                renderModalTabContent();
            });

            document.querySelectorAll('.m-del-proj').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectCurrentModalTabInputs();
                    const idx = parseInt(btn.dataset.idx, 10);
                    portfolioData.projects.splice(idx, 1);
                    renderModalTabContent();
                });
            });

        } else if (currentModalTab === 'journey') {
            const journey = portfolioData.journey || [];
            modalTabContent.innerHTML = `
                <h3 style="font-family:var(--font-title); margin-bottom:10px;">📬 Contact Details & Social Links</h3>
                <div class="form-grid-2">
                    <div class="sketch-field">
                        <label>Email Address:</label>
                        <input type="text" class="sketch-input" id="m-c-email" value="${escapeHtml(c.email)}" />
                    </div>
                    <div class="sketch-field">
                        <label>Phone Number:</label>
                        <input type="text" class="sketch-input" id="m-c-phone" value="${escapeHtml(c.phone)}" />
                    </div>
                    <div class="sketch-field">
                        <label>GitHub URL:</label>
                        <input type="text" class="sketch-input" id="m-c-github" value="${escapeHtml(c.github)}" />
                    </div>
                    <div class="sketch-field">
                        <label>LinkedIn URL:</label>
                        <input type="text" class="sketch-input" id="m-c-linkedin" value="${escapeHtml(c.linkedin)}" />
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin:18px 0 10px 0;">
                    <h3 style="font-family:var(--font-title);">🎓 Journey & Timeline Milestones</h3>
                    <button type="button" class="sketch-btn-sm" id="m-add-journey-btn">+ Add Milestone</button>
                </div>
                ${journey.map((j, idx) => `
                    <div class="dynamic-item-card" data-journey-idx="${idx}">
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                            <strong>Milestone #${idx + 1}</strong>
                            <button type="button" class="sketch-btn-sm m-del-journey" data-idx="${idx}" style="background:#ffd8be;">🗑️ Remove</button>
                        </div>
                        <div class="form-grid-2">
                            <input type="text" class="sketch-input m-j-period" value="${escapeHtml(j.period)}" placeholder="Year / Period" />
                            <input type="text" class="sketch-input m-j-title" value="${escapeHtml(j.title)}" placeholder="Title / Degree / Role" />
                        </div>
                        <div class="sketch-field" style="margin-top:6px;">
                            <input type="text" class="sketch-input m-j-place" value="${escapeHtml(j.place)}" placeholder="Institution / Company / Place" />
                        </div>
                        <div class="sketch-field" style="margin-top:6px;">
                            <textarea class="sketch-textarea m-j-desc" rows="2">${escapeHtml(j.description)}</textarea>
                        </div>
                    </div>
                `).join('')}
            `;

            document.getElementById('m-add-journey-btn').addEventListener('click', () => {
                collectCurrentModalTabInputs();
                portfolioData.journey.unshift({
                    period: '2026',
                    title: 'New Chapter or Achievement',
                    place: 'Location / Institution',
                    type: 'milestone',
                    description: 'Details about this milestone in your journey.'
                });
                renderModalTabContent();
            });

            document.querySelectorAll('.m-del-journey').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectCurrentModalTabInputs();
                    const idx = parseInt(btn.dataset.idx, 10);
                    portfolioData.journey.splice(idx, 1);
                    renderModalTabContent();
                });
            });
        }
    }

    function collectCurrentModalTabInputs() {
        const p = portfolioData.profile;
        if (currentModalTab === 'personal') {
            const val = id => {
                const el = document.getElementById(id);
                return el ? el.value : null;
            };
            if (val('m-name') !== null) p.name = val('m-name');
            if (val('m-nickname') !== null) p.nickname = val('m-nickname');
            if (val('m-title') !== null) p.title = val('m-title');
            if (val('m-birthday') !== null) p.birthday = val('m-birthday');
            if (val('m-location') !== null) p.location = val('m-location');
            if (val('m-edu') !== null) p.educationShort = val('m-edu');
            if (val('m-lang') !== null) p.languages = val('m-lang');
            if (val('m-mbti') !== null) p.mbtiOrVibe = val('m-mbti');
            if (val('m-tagline') !== null) p.tagline = val('m-tagline');
            if (val('m-avatar') !== null) p.avatar = val('m-avatar');
            if (val('m-bio1') !== null) p.bio = val('m-bio1');
            if (val('m-bio2') !== null) p.bioSecondParagraph = val('m-bio2');
            if (val('m-quote') !== null) p.stickyNoteQuote = val('m-quote');

        } else if (currentModalTab === 'favorites') {
            const labels = document.querySelectorAll('.m-fav-label');
            const vals = document.querySelectorAll('.m-fav-val');
            if (labels.length) {
                p.favorites = Array.from(labels).map((lblEl, i) => ({
                    label: lblEl.value,
                    value: vals[i] ? vals[i].value : ''
                }));
            }
            const hobbiesCsv = document.getElementById('m-hobbies-csv');
            if (hobbiesCsv) {
                p.hobbies = hobbiesCsv.value.split(',').map(s => s.trim()).filter(Boolean);
            }

        } else if (currentModalTab === 'skills') {
            const stickersCsv = document.getElementById('m-stickers-csv');
            if (stickersCsv) {
                portfolioData.skills.stickers = stickersCsv.value.split(',').map(s => s.trim()).filter(Boolean);
            }
            const learningEl = document.getElementById('m-learning');
            if (learningEl) {
                portfolioData.skills.currentlyLearning = learningEl.value;
            }

        } else if (currentModalTab === 'projects') {
            const cards = document.querySelectorAll('[data-proj-idx]');
            if (cards.length) {
                portfolioData.projects = Array.from(cards).map(card => ({
                    id: Date.now() + Math.random(),
                    title: card.querySelector('.m-p-title').value,
                    category: card.querySelector('.m-p-cat').value,
                    date: card.querySelector('.m-p-date').value,
                    description: card.querySelector('.m-p-desc').value,
                    demoLink: card.querySelector('.m-p-demo').value,
                    githubLink: card.querySelector('.m-p-git').value,
                    tags: card.querySelector('.m-p-tags').value.split(',').map(s => s.trim()).filter(Boolean),
                    image: card.querySelector('.m-p-img').value
                }));
            }

        } else if (currentModalTab === 'journey') {
            const c = portfolioData.contact;
            const emailEl = document.getElementById('m-c-email');
            if (emailEl) {
                c.email = emailEl.value;
                c.phone = document.getElementById('m-c-phone').value;
                c.github = document.getElementById('m-c-github').value;
                c.linkedin = document.getElementById('m-c-linkedin').value;
            }
            const jCards = document.querySelectorAll('[data-journey-idx]');
            if (jCards.length) {
                portfolioData.journey = Array.from(jCards).map(card => ({
                    period: card.querySelector('.m-j-period').value,
                    title: card.querySelector('.m-j-title').value,
                    place: card.querySelector('.m-j-place').value,
                    description: card.querySelector('.m-j-desc').value,
                    type: 'milestone'
                }));
            }
        }
    }

    // =====================================================================
    // 9. EVENT LISTENERS & NAVIGATION
    // =====================================================================
    closedNotebookCard.addEventListener('click', () => openDiary('about'));

    btnToggleBook.addEventListener('click', () => {
        if (isBookOpen) {
            closeDiary();
        } else {
            openDiary(currentSpread === 'cover' ? 'about' : currentSpread);
        }
    });

    btnInlineEdit.addEventListener('click', () => toggleInlineEditMode());
    btnFinishInlineEdit.addEventListener('click', () => toggleInlineEditMode(false));

    document.getElementById('btn-open-modal').addEventListener('click', () => openModal('personal'));
    document.getElementById('btn-close-modal').addEventListener('click', () => closeModal());

    document.getElementById('btn-save-modal').addEventListener('click', () => {
        collectCurrentModalTabInputs();
        savePortfolioData();
        closeModal();
    });

    document.getElementById('btn-export-json').addEventListener('click', () => {
        collectCurrentModalTabInputs();
        const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-diary-portfolio-data.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('btn-reset-data').addEventListener('click', () => {
        if (confirm('Reset all diary details back to the initial template?')) {
            localStorage.removeItem(STORAGE_KEY);
            portfolioData = structuredClone(DEFAULT_PORTFOLIO_DATA);
            renderModalTabContent();
            renderCover();
            if (isBookOpen) renderCurrentSpread();
        }
    });

    // Prev / Next Page Corner Buttons
    const spreadsList = ['about', 'skills', 'projects', 'journey', 'contact'];
    btnPrevSpread.addEventListener('click', () => {
        const idx = spreadsList.indexOf(currentSpread);
        if (idx <= 0) {
            closeDiary();
        } else {
            switchToSpread(spreadsList[idx - 1], 'prev');
        }
    });

    btnNextSpread.addEventListener('click', () => {
        const idx = spreadsList.indexOf(currentSpread);
        if (idx < spreadsList.length - 1) {
            switchToSpread(spreadsList[idx + 1], 'next');
        } else {
            switchToSpread(spreadsList[0], 'next');
        }
    });

    // Theme switcher
    document.getElementById('btn-theme-switch').addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
        document.body.classList.remove('theme-cream', 'theme-rose', 'theme-PureSketch');
        const nextTheme = THEMES[currentThemeIndex];
        if (nextTheme !== 'default') {
            document.body.classList.add(nextTheme);
        }
    });

    // Sound toggle
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    btnSoundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        btnSoundToggle.classList.toggle('active', soundEnabled);
        btnSoundToggle.innerHTML = soundEnabled ? '🔊 Sound' : '🔇 Muted';
    });

    // Initialize Application
    buildNotebookHardware();
    renderCover();
})();
