// =========================================================================
// Sanjida Maisha — Shaded Studio Portfolio, Editor & Animation Controller
// =========================================================================

(function () {
    const STORAGE_KEY = 'sanjida_maisha_portfolio_v4';

    let portfolioData = loadData();
    let isInlineEditing = false;
    let activeEditorTab = 'home';
    let isTransitioning = false;

    // DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const curtain = document.getElementById('page-transition-curtain');
    const innerOptionDropdown = document.getElementById('inner-option-dropdown');
    const btnToggleOptionBar = document.getElementById('btn-toggle-option-bar');
    const heroStage = document.getElementById('hero-stage');
    const heroFirstName = document.getElementById('hero-first-name');
    const heroLastName = document.getElementById('hero-last-name');
    const heroRoleBox = document.getElementById('hero-role-box');
    const heroRole2 = document.getElementById('hero-role-2');
    const heroBrandFullname = document.getElementById('hero-brand-fullname');
    const innerBrandFullname = document.getElementById('inner-brand-fullname');

    // Editor Elements
    const editorBackdrop = document.getElementById('editor-modal-backdrop');
    const editorBody = document.getElementById('editor-modal-body');
    const btnHeroEdit = document.getElementById('btn-hero-edit');
    const btnInnerEditModal = document.getElementById('btn-inner-edit-modal');
    const btnToggleInlineEdit = document.getElementById('btn-toggle-inline-edit');
    const btnBannerOpenModal = document.getElementById('btn-banner-open-modal');
    const btnBannerDone = document.getElementById('btn-banner-done');
    const btnCloseEditor = document.getElementById('btn-close-editor');
    const btnSaveEditor = document.getElementById('btn-save-editor');
    const btnExportData = document.getElementById('btn-export-data');
    const btnResetData = document.getElementById('btn-reset-data');

    // =====================================================================
    // 1. DATA LOADING & PERSISTENCE
    // =====================================================================
    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return deepMerge(structuredClone(DEFAULT_PORTFOLIO_DATA), parsed);
            }
        } catch (err) {
            console.warn('Could not load saved portfolio data:', err);
        }
        return structuredClone(DEFAULT_PORTFOLIO_DATA);
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
        } catch (err) {
            console.warn('Could not save portfolio data:', err);
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
            const p = parts[i];
            if (!(p in cur)) cur[p] = {};
            cur = cur[p];
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

    function formatStylizedLastName(word) {
        const text = (word || 'MAISHA').trim();
        if (text.length < 3 || isInlineEditing) return escapeHtml(text);
        return `${escapeHtml(text[0])}<span class="stylized-letter">${escapeHtml(text[1])}</span>${escapeHtml(text.slice(2))}`;
    }

    // =====================================================================
    // 2. RENDER FRONT PAGE & SHADED STUDIO INNER SECTIONS
    // =====================================================================
    function renderPortfolio() {
        const w = portfolioData.welcome;
        heroFirstName.textContent = w.firstName || 'SANJIDA';
        heroLastName.innerHTML = formatStylizedLastName(w.lastName || 'MAISHA');
        if (heroRole2) heroRole2.textContent = w.roleLine2 || 'CSE Student • Achiever • Creator';
        const displayFull = (w.fullName || `${w.firstName} ${w.lastName}`).toUpperCase();
        if (heroBrandFullname) heroBrandFullname.textContent = displayFull;
        if (innerBrandFullname) innerBrandFullname.textContent = displayFull;

        // 01: Student info
        const s = portfolioData.studentIntro;
        document.getElementById('sec-student-intro').innerHTML = `
            <div class="section-watermark-num">${escapeHtml(s.sectionNumber)}</div>
            <div class="section-header-flex">
                <div>
                    <span class="section-eyebrow">01 • STUDENT INFO</span>
                    <h2 class="section-display-title" data-editable="studentIntro.heading">${escapeHtml(s.heading || 'Student Info')}</h2>
                    <p class="section-subtitle" data-editable="studentIntro.subtitle">${escapeHtml(s.subtitle)}</p>
                </div>
                <button class="edit-trigger-btn ghost" data-open-editor="student">✏️ Edit Student Info</button>
            </div>

            <div class="intro-bio-paragraphs stagger-item" style="margin-bottom: 36px;">
                <p data-editable="studentIntro.bioParagraph1">${escapeHtml(s.bioParagraph1)}</p>
                <p data-editable="studentIntro.bioParagraph2">${escapeHtml(s.bioParagraph2)}</p>

                <div class="intro-stats-row">
                    ${(s.stats || []).map((st, idx) => `
                        <div class="stat-glass-pill">
                            <div class="stat-val" data-editable="studentIntro.stats.${idx}.value">${escapeHtml(st.value)}</div>
                            <div class="stat-lbl" data-editable="studentIntro.stats.${idx}.label">${escapeHtml(st.label)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="studio-grid-2x2">
                ${(s.credentialsGrid || []).map((cred, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(cred.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag" data-editable="studentIntro.credentialsGrid.${idx}.period">${escapeHtml(cred.period)}</span>
                        </div>
                        <h3 class="card-heading" data-editable="studentIntro.credentialsGrid.${idx}.title">${escapeHtml(cred.title)}</h3>
                        <p class="card-description" data-editable="studentIntro.credentialsGrid.${idx}.description">${escapeHtml(cred.description)}</p>
                    </article>
                `).join('')}
            </div>
        `;

        // 02: Achievement
        const a = portfolioData.achievements;
        document.getElementById('sec-achievements').innerHTML = `
            <div class="section-watermark-num">${escapeHtml(a.sectionNumber)}</div>
            <div class="section-header-flex">
                <div>
                    <span class="section-eyebrow">02 • ${escapeHtml(a.tag)}</span>
                    <h2 class="section-display-title" data-editable="achievements.heading">${escapeHtml(a.heading || 'Achievement')}</h2>
                    <p class="section-subtitle" data-editable="achievements.subtitle">${escapeHtml(a.subtitle)}</p>
                </div>
                <button class="edit-trigger-btn ghost" data-open-editor="achievements">✏️ Edit Achievements</button>
            </div>

            <div class="studio-grid-2x2">
                ${(a.items || []).map((item, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(item.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag">
                                <span data-editable="achievements.items.${idx}.organization">${escapeHtml(item.organization)}</span> • 
                                <span data-editable="achievements.items.${idx}.year">${escapeHtml(item.year)}</span>
                            </span>
                        </div>
                        <h3 class="card-heading" data-editable="achievements.items.${idx}.title">${escapeHtml(item.title)}</h3>
                        <p class="card-description" data-editable="achievements.items.${idx}.description">${escapeHtml(item.description)}</p>
                    </article>
                `).join('')}
            </div>
        `;

        // 03: Passions
        const p = portfolioData.passions;
        document.getElementById('sec-passions').innerHTML = `
            <div class="section-watermark-num">${escapeHtml(p.sectionNumber)}</div>
            <div class="section-header-flex">
                <div>
                    <span class="section-eyebrow">03 • ${escapeHtml(p.tag)}</span>
                    <h2 class="section-display-title" data-editable="passions.heading">${escapeHtml(p.heading || 'Passions')}</h2>
                    <p class="section-subtitle" data-editable="passions.subtitle">${escapeHtml(p.subtitle)}</p>
                </div>
                <button class="edit-trigger-btn ghost" data-open-editor="passions">✏️ Edit Passions</button>
            </div>

            <div class="studio-grid-2x2">
                ${(p.cards || []).map((card, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="visual-card-media">
                            <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}" onerror="this.src='https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80'" />
                        </div>
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(card.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag" data-editable="passions.cards.${idx}.tag">${escapeHtml(card.tag)}</span>
                        </div>
                        <h3 class="card-heading" data-editable="passions.cards.${idx}.title">${escapeHtml(card.title)}</h3>
                        <p class="card-description" data-editable="passions.cards.${idx}.description">${escapeHtml(card.description)}</p>
                    </article>
                `).join('')}
            </div>
        `;

        // 04: Works
        const pr = portfolioData.projects;
        document.getElementById('sec-projects').innerHTML = `
            <div class="section-watermark-num">${escapeHtml(pr.sectionNumber)}</div>
            <div class="section-header-flex">
                <div>
                    <span class="section-eyebrow">04 • ${escapeHtml(pr.tag)}</span>
                    <h2 class="section-display-title" data-editable="projects.heading">${escapeHtml(pr.heading || 'Works')}</h2>
                    <p class="section-subtitle" data-editable="projects.subtitle">${escapeHtml(pr.subtitle)}</p>
                </div>
                <button class="edit-trigger-btn ghost" data-open-editor="works">✏️ Edit Works</button>
            </div>

            <div class="studio-grid-3">
                ${(pr.items || []).map((item, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="visual-card-media">
                            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80'" />
                        </div>
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(item.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag">
                                <span data-editable="projects.items.${idx}.date">${escapeHtml(item.date)}</span> • 
                                <span data-editable="projects.items.${idx}.category">${escapeHtml(item.category)}</span>
                            </span>
                        </div>
                        <h3 class="card-heading" data-editable="projects.items.${idx}.title">${escapeHtml(item.title)}</h3>
                        <p class="card-description" data-editable="projects.items.${idx}.description">${escapeHtml(item.description)}</p>
                        ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" class="card-action-link">Explore Project ↗</a>` : ''}
                    </article>
                `).join('')}
            </div>
        `;

        // 05: Contact details
        document.getElementById('sec-contact').innerHTML = `
            <div class="section-watermark-num">05</div>
            <div class="section-header-flex">
                <div>
                    <span class="section-eyebrow">05 • GET IN TOUCH</span>
                    <h2 class="section-display-title">Contact Details</h2>
                    <p class="section-subtitle">Feel free to reach out for academic collaborations, student initiatives, or creative projects.</p>
                </div>
                <button class="edit-trigger-btn ghost" data-open-editor="contact">✏️ Edit Contact Info</button>
            </div>

            <div class="contact-studio-grid">
                <div class="stagger-item">
                    <div class="contact-info-list">
                        <div class="contact-info-row">
                            <span>Student Name</span>
                            <strong data-editable="welcome.fullName">${escapeHtml(w.fullName)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Academic Department</span>
                            <strong data-editable="welcome.department">${escapeHtml(w.department)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Email Address</span>
                            <strong data-editable="welcome.email">${escapeHtml(w.email)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Phone Number</span>
                            <strong data-editable="welcome.phone">${escapeHtml(w.phone)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Location</span>
                            <strong data-editable="welcome.location">${escapeHtml(w.location)}</strong>
                        </div>
                    </div>
                </div>

                <form class="studio-form stagger-item" id="studio-contact-form">
                    <input type="text" class="studio-input" placeholder="Your Name" required />
                    <input type="email" class="studio-input" placeholder="Your Email Address" required />
                    <input type="text" class="studio-input" placeholder="Subject" />
                    <textarea class="studio-input" rows="4" placeholder="Write your message..." required></textarea>
                    <button type="submit" class="studio-submit-btn">Send Message ↗</button>
                </form>
            </div>
        `;

        const form = document.getElementById('studio-contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you for reaching out! Your message has been sent.');
                form.reset();
            });
        }

        // Bind section-level Edit buttons
        document.querySelectorAll('[data-open-editor]').forEach(btn => {
            btn.addEventListener('click', () => {
                openEditorModal(btn.getAttribute('data-open-editor'));
            });
        });

        bindInlineEditables();
    }

    // =====================================================================
    // 3. ON-PAGE CLICK-TO-EDIT MODE
    // =====================================================================
    function setInlineEditMode(enabled) {
        isInlineEditing = enabled;
        document.body.classList.toggle('is-editing', isInlineEditing);
        if (btnToggleInlineEdit) {
            btnToggleInlineEdit.classList.toggle('active', isInlineEditing);
            btnToggleInlineEdit.textContent = isInlineEditing ? '🖊️ Edit On-Page: ON' : '🖊️ Edit On-Page: OFF';
        }
        renderPortfolio();
    }

    if (btnToggleInlineEdit) {
        btnToggleInlineEdit.addEventListener('click', () => setInlineEditMode(!isInlineEditing));
    }
    if (btnBannerDone) {
        btnBannerDone.addEventListener('click', () => setInlineEditMode(false));
    }
    if (btnBannerOpenModal) {
        btnBannerOpenModal.addEventListener('click', () => openEditorModal('student'));
    }

    function bindInlineEditables() {
        document.querySelectorAll('[data-editable]').forEach(el => {
            if (isInlineEditing) {
                el.setAttribute('contenteditable', 'true');
                el.setAttribute('spellcheck', 'false');
            } else {
                el.removeAttribute('contenteditable');
            }

            if (!el.dataset.boundInline) {
                el.dataset.boundInline = 'true';
                el.addEventListener('blur', () => {
                    const path = el.getAttribute('data-editable');
                    const val = el.innerText.trim();
                    setByPath(portfolioData, path, val);
                    saveData();
                    if (!isInlineEditing) {
                        renderPortfolio();
                    }
                });
            }
        });
    }

    // =====================================================================
    // 4. FULL INFORMATION EDITOR MODAL (ALL 6 SECTIONS)
    // =====================================================================
    function openEditorModal(tab = 'home') {
        activeEditorTab = tab;
        editorBackdrop.classList.add('active');
        updateEditorTabButtons();
        renderEditorTabContent();
    }

    function closeEditorModal() {
        editorBackdrop.classList.remove('active');
        renderPortfolio();
    }

    function updateEditorTabButtons() {
        document.querySelectorAll('.editor-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-etab') === activeEditorTab);
        });
    }

    document.querySelectorAll('.editor-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            collectEditorInputs();
            activeEditorTab = btn.getAttribute('data-etab');
            updateEditorTabButtons();
            renderEditorTabContent();
        });
    });

    if (btnHeroEdit) btnHeroEdit.addEventListener('click', () => openEditorModal('home'));
    if (btnInnerEditModal) btnInnerEditModal.addEventListener('click', () => openEditorModal('student'));
    if (btnCloseEditor) btnCloseEditor.addEventListener('click', closeEditorModal);

    if (btnSaveEditor) {
        btnSaveEditor.addEventListener('click', () => {
            collectEditorInputs();
            saveData();
            closeEditorModal();
        });
    }

    function renderEditorTabContent() {
        const w = portfolioData.welcome;
        const s = portfolioData.studentIntro;
        const a = portfolioData.achievements;
        const p = portfolioData.passions;
        const pr = portfolioData.projects;

        if (activeEditorTab === 'home') {
            editorBody.innerHTML = `
                <div class="editor-grid-2">
                    <div class="editor-field">
                        <label>Left Giant First Name:</label>
                        <input type="text" class="editor-input" id="ed-w-first" value="${escapeHtml(w.firstName)}" />
                    </div>
                    <div class="editor-field">
                        <label>Right Giant Last Name:</label>
                        <input type="text" class="editor-input" id="ed-w-last" value="${escapeHtml(w.lastName)}" />
                    </div>
                </div>
                <div class="editor-grid-2">
                    <div class="editor-field">
                        <label>Header Full Name:</label>
                        <input type="text" class="editor-input" id="ed-w-full" value="${escapeHtml(w.fullName)}" />
                    </div>
                    <div class="editor-field">
                        <label>Portfolio Subtitle Line:</label>
                        <input type="text" class="editor-input" id="ed-w-role2" value="${escapeHtml(w.roleLine2)}" />
                    </div>
                </div>
            `;

        } else if (activeEditorTab === 'student') {
            editorBody.innerHTML = `
                <div class="editor-grid-2">
                    <div class="editor-field">
                        <label>Section Heading:</label>
                        <input type="text" class="editor-input" id="ed-s-heading" value="${escapeHtml(s.heading)}" />
                    </div>
                    <div class="editor-field">
                        <label>Section Subtitle:</label>
                        <input type="text" class="editor-input" id="ed-s-subtitle" value="${escapeHtml(s.subtitle)}" />
                    </div>
                </div>
                <div class="editor-field">
                    <label>Student Introduction — Paragraph 1:</label>
                    <textarea class="editor-textarea" id="ed-s-bio1" rows="3">${escapeHtml(s.bioParagraph1)}</textarea>
                </div>
                <div class="editor-field">
                    <label>Student Introduction — Paragraph 2:</label>
                    <textarea class="editor-textarea" id="ed-s-bio2" rows="2">${escapeHtml(s.bioParagraph2)}</textarea>
                </div>

                <h3 style="margin: 18px 0 10px; color: var(--sage-ash); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.08em;">4 Quick Highlight Stats</h3>
                <div class="editor-grid-2">
                    ${(s.stats || []).map((st, idx) => `
                        <div class="editor-item-card" data-stat-idx="${idx}" style="margin-bottom:4px; padding:12px;">
                            <div class="editor-grid-2">
                                <input type="text" class="editor-input ed-st-val" value="${escapeHtml(st.value)}" placeholder="Value (e.g. B.Sc.)" />
                                <input type="text" class="editor-input ed-st-lbl" value="${escapeHtml(st.label)}" placeholder="Label" />
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin: 22px 0 12px;">
                    <h3 style="color: var(--sage-ash); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.08em;">Academic & Student Profile Cards</h3>
                    <button type="button" class="editor-secondary-btn" id="ed-add-cred">+ Add Card</button>
                </div>
                ${(s.credentialsGrid || []).map((cred, idx) => `
                    <div class="editor-item-card" data-cred-idx="${idx}">
                        <div class="editor-item-header">
                            <strong>Card #${idx + 1}</strong>
                            <button type="button" class="editor-secondary-btn danger ed-del-cred" data-idx="${idx}">Remove</button>
                        </div>
                        <div class="editor-grid-2">
                            <div class="editor-field">
                                <label>Title / Degree:</label>
                                <input type="text" class="editor-input ed-cred-title" value="${escapeHtml(cred.title)}" />
                            </div>
                            <div class="editor-field">
                                <label>Timeline / Subtitle:</label>
                                <input type="text" class="editor-input ed-cred-period" value="${escapeHtml(cred.period)}" />
                            </div>
                        </div>
                        <div class="editor-field" style="margin-bottom:0;">
                            <label>Description:</label>
                            <textarea class="editor-textarea ed-cred-desc" rows="2">${escapeHtml(cred.description)}</textarea>
                        </div>
                    </div>
                `).join('')}
            `;

            document.getElementById('ed-add-cred').addEventListener('click', () => {
                collectEditorInputs();
                portfolioData.studentIntro.credentialsGrid.push({
                    number: '0' + (portfolioData.studentIntro.credentialsGrid.length + 1),
                    title: 'New Academic / Student Card',
                    period: '2026',
                    description: 'Write details about your education, focus area, or campus involvement.'
                });
                renderEditorTabContent();
            });

            document.querySelectorAll('.ed-del-cred').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectEditorInputs();
                    portfolioData.studentIntro.credentialsGrid.splice(parseInt(btn.dataset.idx, 10), 1);
                    renderEditorTabContent();
                });
            });

        } else if (activeEditorTab === 'achievements') {
            editorBody.innerHTML = `
                <div class="editor-field">
                    <label>Section Subtitle:</label>
                    <input type="text" class="editor-input" id="ed-a-subtitle" value="${escapeHtml(a.subtitle)}" />
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin: 18px 0 12px;">
                    <h3 style="color: var(--sage-ash); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.08em;">Your Achievements</h3>
                    <button type="button" class="editor-save-btn" id="ed-add-ach" style="padding:7px 18px; font-size:0.82rem;">+ Add Achievement</button>
                </div>
                ${(a.items || []).map((item, idx) => `
                    <div class="editor-item-card" data-ach-idx="${idx}">
                        <div class="editor-item-header">
                            <strong>Achievement #${idx + 1}</strong>
                            <button type="button" class="editor-secondary-btn danger ed-del-ach" data-idx="${idx}">Remove</button>
                        </div>
                        <div class="editor-field">
                            <label>Achievement / Award Title:</label>
                            <input type="text" class="editor-input ed-ach-title" value="${escapeHtml(item.title)}" />
                        </div>
                        <div class="editor-grid-2">
                            <div class="editor-field">
                                <label>Organization / Institution:</label>
                                <input type="text" class="editor-input ed-ach-org" value="${escapeHtml(item.organization)}" />
                            </div>
                            <div class="editor-field">
                                <label>Year:</label>
                                <input type="text" class="editor-input ed-ach-year" value="${escapeHtml(item.year)}" />
                            </div>
                        </div>
                        <div class="editor-field" style="margin-bottom:0;">
                            <label>Description:</label>
                            <textarea class="editor-textarea ed-ach-desc" rows="2">${escapeHtml(item.description)}</textarea>
                        </div>
                    </div>
                `).join('')}
            `;

            document.getElementById('ed-add-ach').addEventListener('click', () => {
                collectEditorInputs();
                portfolioData.achievements.items.unshift({
                    number: '01',
                    title: 'New Achievement or Honor',
                    organization: 'University / Competition',
                    year: '2026',
                    description: 'Describe your achievement here.'
                });
                renderEditorTabContent();
            });

            document.querySelectorAll('.ed-del-ach').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectEditorInputs();
                    portfolioData.achievements.items.splice(parseInt(btn.dataset.idx, 10), 1);
                    renderEditorTabContent();
                });
            });

        } else if (activeEditorTab === 'passions') {
            editorBody.innerHTML = `
                <div class="editor-field">
                    <label>Section Subtitle:</label>
                    <input type="text" class="editor-input" id="ed-p-subtitle" value="${escapeHtml(p.subtitle)}" />
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin: 18px 0 12px;">
                    <h3 style="color: var(--sage-ash); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.08em;">Your Passions</h3>
                    <button type="button" class="editor-save-btn" id="ed-add-pas" style="padding:7px 18px; font-size:0.82rem;">+ Add Passion</button>
                </div>
                ${(p.cards || []).map((card, idx) => `
                    <div class="editor-item-card" data-pas-idx="${idx}">
                        <div class="editor-item-header">
                            <strong>Passion #${idx + 1}</strong>
                            <button type="button" class="editor-secondary-btn danger ed-del-pas" data-idx="${idx}">Remove</button>
                        </div>
                        <div class="editor-grid-2">
                            <div class="editor-field">
                                <label>Passion Title:</label>
                                <input type="text" class="editor-input ed-pas-title" value="${escapeHtml(card.title)}" />
                            </div>
                            <div class="editor-field">
                                <label>Tag / Category:</label>
                                <input type="text" class="editor-input ed-pas-tag" value="${escapeHtml(card.tag)}" />
                            </div>
                        </div>
                        <div class="editor-field">
                            <label>Image URL:</label>
                            <input type="text" class="editor-input ed-pas-img" value="${escapeHtml(card.image)}" />
                        </div>
                        <div class="editor-field" style="margin-bottom:0;">
                            <label>Description:</label>
                            <textarea class="editor-textarea ed-pas-desc" rows="2">${escapeHtml(card.description)}</textarea>
                        </div>
                    </div>
                `).join('')}
            `;

            document.getElementById('ed-add-pas').addEventListener('click', () => {
                collectEditorInputs();
                portfolioData.passions.cards.push({
                    number: '0' + (portfolioData.passions.cards.length + 1),
                    title: 'New Passion or Interest',
                    tag: 'Personal Interest',
                    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80',
                    description: 'Describe what you love about this passion.'
                });
                renderEditorTabContent();
            });

            document.querySelectorAll('.ed-del-pas').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectEditorInputs();
                    portfolioData.passions.cards.splice(parseInt(btn.dataset.idx, 10), 1);
                    renderEditorTabContent();
                });
            });

        } else if (activeEditorTab === 'works') {
            editorBody.innerHTML = `
                <div class="editor-field">
                    <label>Section Subtitle:</label>
                    <input type="text" class="editor-input" id="ed-pr-subtitle" value="${escapeHtml(pr.subtitle)}" />
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin: 18px 0 12px;">
                    <h3 style="color: var(--sage-ash); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.08em;">Your Works & Projects</h3>
                    <button type="button" class="editor-save-btn" id="ed-add-work" style="padding:7px 18px; font-size:0.82rem;">+ Add Work</button>
                </div>
                ${(pr.items || []).map((item, idx) => `
                    <div class="editor-item-card" data-work-idx="${idx}">
                        <div class="editor-item-header">
                            <strong>Project #${idx + 1}</strong>
                            <button type="button" class="editor-secondary-btn danger ed-del-work" data-idx="${idx}">Remove</button>
                        </div>
                        <div class="editor-field">
                            <label>Project Title:</label>
                            <input type="text" class="editor-input ed-wk-title" value="${escapeHtml(item.title)}" />
                        </div>
                        <div class="editor-grid-2">
                            <div class="editor-field">
                                <label>Year / Date:</label>
                                <input type="text" class="editor-input ed-wk-date" value="${escapeHtml(item.date)}" />
                            </div>
                            <div class="editor-field">
                                <label>Category:</label>
                                <input type="text" class="editor-input ed-wk-cat" value="${escapeHtml(item.category)}" />
                            </div>
                        </div>
                        <div class="editor-grid-2">
                            <div class="editor-field">
                                <label>Image URL:</label>
                                <input type="text" class="editor-input ed-wk-img" value="${escapeHtml(item.image)}" />
                            </div>
                            <div class="editor-field">
                                <label>Project Link (GitHub / Live URL):</label>
                                <input type="text" class="editor-input ed-wk-link" value="${escapeHtml(item.link)}" />
                            </div>
                        </div>
                        <div class="editor-field" style="margin-bottom:0;">
                            <label>Description:</label>
                            <textarea class="editor-textarea ed-wk-desc" rows="2">${escapeHtml(item.description)}</textarea>
                        </div>
                    </div>
                `).join('')}
            `;

            document.getElementById('ed-add-work').addEventListener('click', () => {
                collectEditorInputs();
                portfolioData.projects.items.unshift({
                    number: '01',
                    title: 'New Student Project',
                    date: '2026',
                    category: 'Web Application',
                    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80',
                    description: 'Describe your project and technologies used.',
                    link: 'https://github.com/sanjida5102'
                });
                renderEditorTabContent();
            });

            document.querySelectorAll('.ed-del-work').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectEditorInputs();
                    portfolioData.projects.items.splice(parseInt(btn.dataset.idx, 10), 1);
                    renderEditorTabContent();
                });
            });

        } else if (activeEditorTab === 'contact') {
            editorBody.innerHTML = `
                <div class="editor-grid-2">
                    <div class="editor-field">
                        <label>Full Name:</label>
                        <input type="text" class="editor-input" id="ed-c-name" value="${escapeHtml(w.fullName)}" />
                    </div>
                    <div class="editor-field">
                        <label>Academic Department / Institution:</label>
                        <input type="text" class="editor-input" id="ed-c-dept" value="${escapeHtml(w.department)}" />
                    </div>
                    <div class="editor-field">
                        <label>Email Address:</label>
                        <input type="text" class="editor-input" id="ed-c-email" value="${escapeHtml(w.email)}" />
                    </div>
                    <div class="editor-field">
                        <label>Phone Number:</label>
                        <input type="text" class="editor-input" id="ed-c-phone" value="${escapeHtml(w.phone)}" />
                    </div>
                    <div class="editor-field">
                        <label>Location / City:</label>
                        <input type="text" class="editor-input" id="ed-c-loc" value="${escapeHtml(w.location)}" />
                    </div>
                    <div class="editor-field">
                        <label>GitHub Profile URL:</label>
                        <input type="text" class="editor-input" id="ed-c-git" value="${escapeHtml(w.github)}" />
                    </div>
                </div>
            `;
        }
    }

    function collectEditorInputs() {
        const val = id => {
            const el = document.getElementById(id);
            return el ? el.value : null;
        };

        if (activeEditorTab === 'home') {
            const w = portfolioData.welcome;
            if (val('ed-w-first') !== null) w.firstName = val('ed-w-first');
            if (val('ed-w-last') !== null) w.lastName = val('ed-w-last');
            if (val('ed-w-full') !== null) w.fullName = val('ed-w-full');
            if (val('ed-w-role2') !== null) w.roleLine2 = val('ed-w-role2');

        } else if (activeEditorTab === 'student') {
            const s = portfolioData.studentIntro;
            if (val('ed-s-heading') !== null) s.heading = val('ed-s-heading');
            if (val('ed-s-subtitle') !== null) s.subtitle = val('ed-s-subtitle');
            if (val('ed-s-bio1') !== null) s.bioParagraph1 = val('ed-s-bio1');
            if (val('ed-s-bio2') !== null) s.bioParagraph2 = val('ed-s-bio2');

            const statCards = document.querySelectorAll('[data-stat-idx]');
            if (statCards.length) {
                s.stats = Array.from(statCards).map(card => ({
                    value: card.querySelector('.ed-st-val').value,
                    label: card.querySelector('.ed-st-lbl').value
                }));
            }

            const credCards = document.querySelectorAll('[data-cred-idx]');
            if (credCards.length) {
                s.credentialsGrid = Array.from(credCards).map((card, i) => ({
                    number: '0' + (i + 1),
                    title: card.querySelector('.ed-cred-title').value,
                    period: card.querySelector('.ed-cred-period').value,
                    description: card.querySelector('.ed-cred-desc').value
                }));
            }

        } else if (activeEditorTab === 'achievements') {
            const a = portfolioData.achievements;
            if (val('ed-a-subtitle') !== null) a.subtitle = val('ed-a-subtitle');
            const achCards = document.querySelectorAll('[data-ach-idx]');
            if (achCards.length) {
                a.items = Array.from(achCards).map((card, i) => ({
                    number: '0' + (i + 1),
                    title: card.querySelector('.ed-ach-title').value,
                    organization: card.querySelector('.ed-ach-org').value,
                    year: card.querySelector('.ed-ach-year').value,
                    description: card.querySelector('.ed-ach-desc').value
                }));
            }

        } else if (activeEditorTab === 'passions') {
            const p = portfolioData.passions;
            if (val('ed-p-subtitle') !== null) p.subtitle = val('ed-p-subtitle');
            const pasCards = document.querySelectorAll('[data-pas-idx]');
            if (pasCards.length) {
                p.cards = Array.from(pasCards).map((card, i) => ({
                    number: '0' + (i + 1),
                    title: card.querySelector('.ed-pas-title').value,
                    tag: card.querySelector('.ed-pas-tag').value,
                    image: card.querySelector('.ed-pas-img').value,
                    description: card.querySelector('.ed-pas-desc').value
                }));
            }

        } else if (activeEditorTab === 'works') {
            const pr = portfolioData.projects;
            if (val('ed-pr-subtitle') !== null) pr.subtitle = val('ed-pr-subtitle');
            const workCards = document.querySelectorAll('[data-work-idx]');
            if (workCards.length) {
                pr.items = Array.from(workCards).map((card, i) => ({
                    number: '0' + (i + 1),
                    title: card.querySelector('.ed-wk-title').value,
                    date: card.querySelector('.ed-wk-date').value,
                    category: card.querySelector('.ed-wk-cat').value,
                    image: card.querySelector('.ed-wk-img').value,
                    link: card.querySelector('.ed-wk-link').value,
                    description: card.querySelector('.ed-wk-desc').value
                }));
            }

        } else if (activeEditorTab === 'contact') {
            const w = portfolioData.welcome;
            if (val('ed-c-name') !== null) w.fullName = val('ed-c-name');
            if (val('ed-c-dept') !== null) w.department = val('ed-c-dept');
            if (val('ed-c-email') !== null) w.email = val('ed-c-email');
            if (val('ed-c-phone') !== null) w.phone = val('ed-c-phone');
            if (val('ed-c-loc') !== null) w.location = val('ed-c-loc');
            if (val('ed-c-git') !== null) w.github = val('ed-c-git');
        }
    }

    if (btnExportData) {
        btnExportData.addEventListener('click', () => {
            collectEditorInputs();
            const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sanjida-maisha-portfolio-data.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    if (btnResetData) {
        btnResetData.addEventListener('click', () => {
            if (confirm('Reset all portfolio information back to the default template?')) {
                localStorage.removeItem(STORAGE_KEY);
                portfolioData = structuredClone(DEFAULT_PORTFOLIO_DATA);
                renderEditorTabContent();
                renderPortfolio();
            }
        });
    }

    // =====================================================================
    // 5. OPTION BAR & CINEMATIC PAGE TRANSITIONS
    // =====================================================================
    function highlightActiveOption(targetId) {
        document.querySelectorAll('[data-target]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
        });
    }

    function navigateToOption(targetId) {
        if (innerOptionDropdown) {
            innerOptionDropdown.classList.remove('open');
        }

        if (targetId === 'home') {
            highlightActiveOption('home');
            if (!welcomeScreen.classList.contains('hidden-cover')) return;
            transitionBackToFrontPage();
            return;
        }

        highlightActiveOption(targetId);

        if (!welcomeScreen.classList.contains('hidden-cover')) {
            if (isTransitioning) return;
            isTransitioning = true;

            curtain.classList.remove('leaving');
            curtain.classList.add('active');

            setTimeout(() => {
                welcomeScreen.classList.add('hidden-cover');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    const yOffset = -95;
                    const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
                    targetEl.classList.add('is-visible');
                }
            }, 480);

            setTimeout(() => {
                curtain.classList.remove('active');
                curtain.classList.add('leaving');
                observeSections();
            }, 680);

            setTimeout(() => {
                curtain.classList.remove('leaving');
                isTransitioning = false;
            }, 1350);
        } else {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                const yOffset = -95;
                const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
                targetEl.classList.add('is-visible');
            }
        }
    }

    function transitionBackToFrontPage() {
        if (isTransitioning) return;
        isTransitioning = true;

        curtain.classList.remove('leaving');
        curtain.classList.add('active');

        setTimeout(() => {
            welcomeScreen.classList.remove('hidden-cover');
            window.scrollTo({ top: 0, behavior: 'instant' });
            highlightActiveOption('home');
        }, 480);

        setTimeout(() => {
            curtain.classList.remove('active');
            curtain.classList.add('leaving');
        }, 680);

        setTimeout(() => {
            curtain.classList.remove('leaving');
            isTransitioning = false;
        }, 1350);
    }

    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            navigateToOption(targetId);
        });
    });

    if (btnToggleOptionBar && innerOptionDropdown) {
        btnToggleOptionBar.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = innerOptionDropdown.classList.toggle('open');
            btnToggleOptionBar.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.addEventListener('click', (e) => {
            if (!innerOptionDropdown.contains(e.target)) {
                innerOptionDropdown.classList.remove('open');
                btnToggleOptionBar.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =====================================================================
    // 6. SUBTLE 3D MOUSE PARALLAX ON FRONT PAGE
    // =====================================================================
    if (heroStage) {
        window.addEventListener('mousemove', (e) => {
            if (welcomeScreen.classList.contains('hidden-cover') || isInlineEditing) return;
            const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
            const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

            heroFirstName.style.transform = `translate3d(${xNorm * -16}px, ${yNorm * -9}px, 0)`;
            heroLastName.style.transform = `translate3d(${xNorm * 16}px, ${yNorm * 9}px, 0)`;
            heroRoleBox.style.transform = `translate3d(${xNorm * -6}px, ${yNorm * -5}px, 0)`;
        });
    }

    // =====================================================================
    // 7. SCROLL-TRIGGERED SECTION REVEAL ANIMATIONS
    // =====================================================================
    function observeSections() {
        const blocks = document.querySelectorAll('.reveal-block');
        if (!('IntersectionObserver' in window)) {
            blocks.forEach(b => b.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.14 });

        blocks.forEach(b => observer.observe(b));
    }

    // Initialize
    renderPortfolio();
    observeSections();
})();
