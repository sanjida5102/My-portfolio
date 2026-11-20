// =========================================================================
// Editorial Student Portfolio — Application Controller
// =========================================================================

(function () {
    const STORAGE_KEY = 'editorial_student_portfolio_v2';

    let portfolioData = loadData();
    let isInlineEditing = false;
    let activeModalTab = 'welcome';

    // DOM Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const btnEnterMain = document.getElementById('btn-enter-main');
    const btnShowWelcome = document.getElementById('btn-show-welcome');
    const btnWelcomeEdit = document.getElementById('btn-welcome-edit');
    const btnToggleInlineEdit = document.getElementById('btn-toggle-inline-edit');
    const btnDoneEditing = document.getElementById('btn-done-editing');
    const btnOpenCustomizer = document.getElementById('btn-open-customizer');
    const customizerModal = document.getElementById('customizer-modal');
    const modalContentArea = document.getElementById('modal-content-area');
    const portraitUploadInput = document.getElementById('portrait-upload-input');

    // =====================================================================
    // 1. DATA STORAGE & HELPERS
    // =====================================================================
    function loadData() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
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

    // =====================================================================
    // 2. RENDER ALL TEMPLATES
    // =====================================================================
    function renderAll() {
        renderWelcomePage();
        renderStudentIntroSlide();
        renderAchievementsSlide();
        renderPassionsSlide();
        renderProjectsAndContactSlide();
        bindInlineEditableElements();
    }

    // ---------------------------------------------------------------------
    // A. GREEN WELCOME SCREEN
    // ---------------------------------------------------------------------
    function renderWelcomePage() {
        const w = portfolioData.welcome;
        document.getElementById('w-name').textContent = w.name;
        document.getElementById('w-email').textContent = w.email;
        document.getElementById('w-phone').textContent = w.phone;
        document.getElementById('w-addr1').textContent = w.addressLine1;
        document.getElementById('w-addr2').textContent = w.addressLine2;
        document.getElementById('w-soc1').textContent = w.socialLine1;
        document.getElementById('w-soc2').textContent = w.socialLine2;
        document.getElementById('w-year').textContent = w.yearRange;
        document.getElementById('w-outline').textContent = w.outlineTitle;
        document.getElementById('w-solid').textContent = w.solidTitle;
        document.getElementById('w-subtitle').textContent = w.welcomeSubtitle;
        document.getElementById('w-enter-text').textContent = w.enterBtnText || 'Enter Main Page';
        document.getElementById('nav-student-name').textContent = w.name;
    }

    // ---------------------------------------------------------------------
    // B. TEMPLATE SLIDE 2: STUDENT INTRO / ABOUT (Top-Right Template)
    // ---------------------------------------------------------------------
    function renderStudentIntroSlide() {
        const s = portfolioData.studentIntro;

        // Left Deep Green Panel
        const greenPanel = document.getElementById('about-green-panel');
        greenPanel.innerHTML = `
            <div>
                <h2 class="about-serif-title" data-editable="studentIntro.heading">${escapeHtml(s.heading)}</h2>
                <p class="about-bio-text" data-editable="studentIntro.bioParagraph1">${escapeHtml(s.bioParagraph1)}</p>
                <p class="about-bio-text" data-editable="studentIntro.bioParagraph2">${escapeHtml(s.bioParagraph2)}</p>
            </div>

            <div class="about-contact-mini">
                <strong data-editable="studentIntro.quickContactLabel">${escapeHtml(s.quickContactLabel)}</strong>
                <div data-editable="studentIntro.quickInfoLine1">${escapeHtml(s.quickInfoLine1)}</div>
                <div data-editable="studentIntro.quickInfoLine2">${escapeHtml(s.quickInfoLine2)}</div>
            </div>
        `;

        // Center Portrait Photo
        const portraitImg = document.getElementById('student-portrait-img');
        portraitImg.src = s.avatar;
        portraitImg.onerror = function () {
            this.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
        };

        // Right Apricot 2x2 Academic & Student Profile Panel
        const apricotPanel = document.getElementById('about-apricot-panel');
        apricotPanel.innerHTML = `
            <div class="credentials-2x2-grid">
                ${(s.credentialsGrid || []).map((cred, idx) => `
                    <div>
                        <div class="cred-item-title" data-editable="studentIntro.credentialsGrid.${idx}.title">${escapeHtml(cred.title)}</div>
                        <div class="cred-item-period" data-editable="studentIntro.credentialsGrid.${idx}.period">${escapeHtml(cred.period)}</div>
                        <p class="cred-item-desc" data-editable="studentIntro.credentialsGrid.${idx}.description">${escapeHtml(cred.description)}</p>
                    </div>
                `).join('')}
            </div>

            <div class="about-apricot-footer">
                <span style="font-size:0.76rem; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:var(--forest-green);">
                    STUDENT INTRODUCTION
                </span>
                <div class="hollow-number green-stroke">${escapeHtml(s.sectionNumber || '01')}</div>
            </div>
        `;
    }

    // ---------------------------------------------------------------------
    // C. TEMPLATE SLIDE 3: ACHIEVEMENTS (Bottom-Right Apricot & Geometric Template)
    // ---------------------------------------------------------------------
    function renderAchievementsSlide() {
        const a = portfolioData.achievements;
        const container = document.getElementById('achievements-main-area');

        container.innerHTML = `
            <div>
                <div class="achievements-header-row">
                    <div>
                        <div style="font-size:0.76rem; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:var(--terracotta-dark); margin-bottom:6px;">
                            CHAPTER ${escapeHtml(a.sectionNumber || '02')} • PROUD MOMENTS
                        </div>
                        <h2 class="achievements-serif-heading" data-editable="achievements.heading">${escapeHtml(a.heading)}</h2>
                    </div>
                    <div style="display:flex; align-items:center; gap:14px;">
                        <button class="btn-back-welcome" id="btn-quick-add-achievement" style="background:var(--forest-green);">
                            + Add Achievement
                        </button>
                        <div class="hollow-number">${escapeHtml(a.sectionNumber || '02')}</div>
                    </div>
                </div>

                <div class="achievements-intro-cols">
                    <p data-editable="achievements.introLeft">${escapeHtml(a.introLeft)}</p>
                    <p data-editable="achievements.introRight">${escapeHtml(a.introRight)}</p>
                </div>

                <div class="achievements-cards-grid">
                    ${(a.items || []).map((item, idx) => `
                        <div class="achievement-card">
                            <div class="ach-top-meta">
                                <span data-editable="achievements.items.${idx}.organization">${escapeHtml(item.organization)}</span>
                                <span data-editable="achievements.items.${idx}.year">${escapeHtml(item.year)}</span>
                            </div>
                            <h3 class="ach-title" data-editable="achievements.items.${idx}.title">${escapeHtml(item.title)}</h3>
                            <p class="ach-desc" data-editable="achievements.items.${idx}.description">${escapeHtml(item.description)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const quickAddAch = document.getElementById('btn-quick-add-achievement');
        if (quickAddAch) {
            quickAddAch.addEventListener('click', () => openModal('achievements'));
        }
    }

    // ---------------------------------------------------------------------
    // D. TEMPLATE SLIDE 4: MY PASSIONS (Bottom-Left Pistachio + 2x2 Photo Grid)
    // ---------------------------------------------------------------------
    function renderPassionsSlide() {
        const p = portfolioData.passions;
        const sidebar = document.getElementById('passions-pistachio-sidebar');
        const collage = document.getElementById('passions-white-collage');

        sidebar.innerHTML = `
            <div>
                <div style="font-size:0.75rem; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:var(--terracotta-dark); margin-bottom:8px;">
                    CHAPTER ${escapeHtml(p.sectionNumber || '03')} • WHAT DRIVES ME
                </div>
                <h2 class="passions-serif-title" data-editable="passions.heading">${escapeHtml(p.heading)}</h2>
                <p class="passions-sidebar-text" data-editable="passions.sidebarDesc">${escapeHtml(p.sidebarDesc)}</p>

                <div class="passions-meta-box">
                    <strong data-editable="passions.metaLabel">${escapeHtml(p.metaLabel)}</strong>
                    <div data-editable="passions.metaLine1">${escapeHtml(p.metaLine1)}</div>
                    <div data-editable="passions.metaLine2">${escapeHtml(p.metaLine2)}</div>
                </div>
            </div>

            <div class="passions-bottom-num">
                <button class="btn-back-welcome" id="btn-quick-edit-passions" style="background:var(--forest-green);">
                    + Edit Passions
                </button>
                <div class="hollow-number white-stroke">${escapeHtml(p.sectionNumber || '03')}</div>
            </div>
        `;

        collage.innerHTML = (p.cards || []).map((card, idx) => `
            <article class="passion-grid-card">
                <div class="passion-img-frame">
                    <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}" onerror="this.src='https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80'" />
                </div>
                <div class="passion-card-body">
                    <span class="passion-tag" data-editable="passions.cards.${idx}.tag">${escapeHtml(card.tag)}</span>
                    <h3 class="passion-card-title" data-editable="passions.cards.${idx}.title">${escapeHtml(card.title)}</h3>
                    <p class="passion-card-desc" data-editable="passions.cards.${idx}.description">${escapeHtml(card.description)}</p>
                </div>
            </article>
        `).join('');

        const btnEditPassions = document.getElementById('btn-quick-edit-passions');
        if (btnEditPassions) {
            btnEditPassions.addEventListener('click', () => openModal('passions'));
        }
    }

    // ---------------------------------------------------------------------
    // E. TEMPLATE SLIDE 5: STUDENT WORKS & CONTACT
    // ---------------------------------------------------------------------
    function renderProjectsAndContactSlide() {
        const pr = portfolioData.projects;
        const w = portfolioData.welcome;

        const projectsPanel = document.getElementById('projects-white-panel');
        projectsPanel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                <div>
                    <div style="font-size:0.75rem; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:var(--terracotta); margin-bottom:6px;">
                        CHAPTER ${escapeHtml(pr.sectionNumber || '04')} • PORTFOLIO
                    </div>
                    <h2 class="achievements-serif-heading" data-editable="projects.heading">${escapeHtml(pr.heading)}</h2>
                </div>
                <div class="hollow-number green-stroke">${escapeHtml(pr.sectionNumber || '04')}</div>
            </div>

            <div class="projects-grid-2">
                ${(pr.items || []).map((item, idx) => `
                    <div class="editorial-project-card">
                        <div class="proj-green-frame">
                            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'" />
                        </div>
                        <h3 class="proj-headline" data-editable="projects.items.${idx}.title">${escapeHtml(item.title)}</h3>
                        <p class="proj-body-text" data-editable="projects.items.${idx}.description">${escapeHtml(item.description)}</p>
                        <div class="proj-meta-footer">
                            <span><span data-editable="projects.items.${idx}.date">${escapeHtml(item.date)}</span> • <span data-editable="projects.items.${idx}.location">${escapeHtml(item.location)}</span></span>
                            ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" style="color:var(--forest-green); text-decoration:none; font-weight:800;">VIEW ↗</a>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const contactPanel = document.getElementById('contact-green-panel');
        contactPanel.innerHTML = `
            <div>
                <div style="font-size:0.75rem; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:var(--apricot); margin-bottom:8px;">
                    GET IN TOUCH
                </div>
                <h2 class="about-serif-title" style="font-size:2.4rem; margin-bottom:14px;">Let's Connect</h2>
                <p class="about-bio-text">
                    Thank you for exploring my student portfolio! Feel free to reach out for academic collaborations, projects, or a friendly conversation.
                </p>

                <form class="contact-form-editorial" id="contact-form-editorial">
                    <input type="text" class="editorial-input" placeholder="Your Name" required />
                    <input type="email" class="editorial-input" placeholder="Your Email" required />
                    <textarea class="editorial-input" rows="3" placeholder="Write a message..." required></textarea>
                    <button type="submit" class="btn-terracotta-submit">Send Message ↗</button>
                </form>
            </div>

            <div class="about-contact-mini">
                <strong>DIRECT CONTACT</strong>
                <div>${escapeHtml(w.email)} • ${escapeHtml(w.phone)}</div>
                <div>${escapeHtml(w.addressLine1)} • ${escapeHtml(w.addressLine2)}</div>
            </div>
        `;

        const contactForm = document.getElementById('contact-form-editorial');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you for your message! Your note has been received.');
                contactForm.reset();
            });
        }
    }

    // =====================================================================
    // 3. WELCOME SCREEN <-> MAIN PAGE NAVIGATION
    // =====================================================================
    btnEnterMain.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden-cover');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnShowWelcome.addEventListener('click', () => {
        welcomeScreen.classList.remove('hidden-cover');
    });

    // =====================================================================
    // 4. INLINE ON-PAGE EDITING
    // =====================================================================
    function setInlineEditing(state) {
        isInlineEditing = state;
        document.body.classList.toggle('is-editing', isInlineEditing);
        btnToggleInlineEdit.classList.toggle('active', isInlineEditing);
        btnToggleInlineEdit.textContent = isInlineEditing ? '✏️ Edit On-Page: ON' : '✏️ Edit On-Page: OFF';
        bindInlineEditableElements();
    }

    btnToggleInlineEdit.addEventListener('click', () => setInlineEditing(!isInlineEditing));
    btnDoneEditing.addEventListener('click', () => setInlineEditing(false));

    function bindInlineEditableElements() {
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
                    renderWelcomePage();
                });
            }
        });
    }

    // =====================================================================
    // 5. STUDENT PORTRAIT PHOTO UPLOAD
    // =====================================================================
    document.getElementById('btn-change-portrait').addEventListener('click', () => {
        portraitUploadInput.click();
    });

    portraitUploadInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const maxDim = 650;
                let w = img.width;
                let h = img.height;
                if (w > h && w > maxDim) {
                    h = Math.round((h * maxDim) / w);
                    w = maxDim;
                } else if (h > maxDim) {
                    w = Math.round((w * maxDim) / h);
                    h = maxDim;
                }
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                portfolioData.studentIntro.avatar = canvas.toDataURL('image/jpeg', 0.86);
                saveData();
                renderStudentIntroSlide();
                if (customizerModal.classList.contains('active')) {
                    renderModalTab();
                }
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });

    // =====================================================================
    // 6. FULL DETAILS CUSTOMIZER MODAL
    // =====================================================================
    function openModal(tab = 'welcome') {
        activeModalTab = tab;
        customizerModal.classList.add('active');
        updateModalTabButtons();
        renderModalTab();
    }

    function closeModal() {
        customizerModal.classList.remove('active');
        renderAll();
    }

    function updateModalTabButtons() {
        document.querySelectorAll('.m-tab-btn[data-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === activeModalTab);
        });
    }

    document.querySelectorAll('.m-tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            collectModalInputs();
            activeModalTab = btn.dataset.tab;
            updateModalTabButtons();
            renderModalTab();
        });
    });

    btnOpenCustomizer.addEventListener('click', () => openModal('intro'));
    btnWelcomeEdit.addEventListener('click', () => openModal('welcome'));
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);

    document.getElementById('btn-save-modal').addEventListener('click', () => {
        collectModalInputs();
        saveData();
        closeModal();
    });

    function renderModalTab() {
        const w = portfolioData.welcome;
        const s = portfolioData.studentIntro;
        const a = portfolioData.achievements;
        const p = portfolioData.passions;
        const pr = portfolioData.projects;

        if (activeModalTab === 'welcome') {
            modalContentArea.innerHTML = `
                <div class="f-grid-2">
                    <div class="f-group">
                        <label>Your Full Name:</label>
                        <input type="text" class="f-input" id="m-w-name" value="${escapeHtml(w.name)}" />
                    </div>
                    <div class="f-group">
                        <label>Academic Year / Timeline:</label>
                        <input type="text" class="f-input" id="m-w-year" value="${escapeHtml(w.yearRange)}" />
                    </div>
                    <div class="f-group">
                        <label>Outlined Big Word (e.g. Student / Design):</label>
                        <input type="text" class="f-input" id="m-w-outline" value="${escapeHtml(w.outlineTitle)}" />
                    </div>
                    <div class="f-group">
                        <label>Solid Big Word (e.g. Portfolio):</label>
                        <input type="text" class="f-input" id="m-w-solid" value="${escapeHtml(w.solidTitle)}" />
                    </div>
                    <div class="f-group">
                        <label>Email:</label>
                        <input type="text" class="f-input" id="m-w-email" value="${escapeHtml(w.email)}" />
                    </div>
                    <div class="f-group">
                        <label>Phone:</label>
                        <input type="text" class="f-input" id="m-w-phone" value="${escapeHtml(w.phone)}" />
                    </div>
                    <div class="f-group">
                        <label>Address / Department Line 1:</label>
                        <input type="text" class="f-input" id="m-w-addr1" value="${escapeHtml(w.addressLine1)}" />
                    </div>
                    <div class="f-group">
                        <label>City / University Line 2:</label>
                        <input type="text" class="f-input" id="m-w-addr2" value="${escapeHtml(w.addressLine2)}" />
                    </div>
                    <div class="f-group">
                        <label>Social Handle 1:</label>
                        <input type="text" class="f-input" id="m-w-soc1" value="${escapeHtml(w.socialLine1)}" />
                    </div>
                    <div class="f-group">
                        <label>Social Link 2:</label>
                        <input type="text" class="f-input" id="m-w-soc2" value="${escapeHtml(w.socialLine2)}" />
                    </div>
                </div>
                <div class="f-group">
                    <label>Welcome Greeting Message:</label>
                    <textarea class="f-textarea" id="m-w-sub" rows="2">${escapeHtml(w.welcomeSubtitle)}</textarea>
                </div>
            `;

        } else if (activeModalTab === 'intro') {
            modalContentArea.innerHTML = `
                <div class="f-group">
                    <label>Student Portrait Photo (Upload File or Paste URL):</label>
                    <div style="display:flex; gap:10px;">
                        <input type="text" class="f-input" id="m-s-avatar" value="${escapeHtml(s.avatar)}" />
                        <button type="button" class="m-tab-btn" id="m-btn-upload" style="white-space:nowrap;">📷 Upload File</button>
                    </div>
                </div>
                <div class="f-group">
                    <label>Student Intro — Paragraph 1:</label>
                    <textarea class="f-textarea" id="m-s-bio1" rows="3">${escapeHtml(s.bioParagraph1)}</textarea>
                </div>
                <div class="f-group">
                    <label>Student Intro — Paragraph 2:</label>
                    <textarea class="f-textarea" id="m-s-bio2" rows="2">${escapeHtml(s.bioParagraph2)}</textarea>
                </div>
                <div class="f-grid-2">
                    <div class="f-group">
                        <label>Academic Summary Line 1:</label>
                        <input type="text" class="f-input" id="m-s-q1" value="${escapeHtml(s.quickInfoLine1)}" />
                    </div>
                    <div class="f-group">
                        <label>Academic Summary Line 2:</label>
                        <input type="text" class="f-input" id="m-s-q2" value="${escapeHtml(s.quickInfoLine2)}" />
                    </div>
                </div>

                <h3 style="margin:16px 0 10px; font-family:var(--font-serif); color:var(--forest-green);">4 Academic & Student Profile Blocks (Apricot Panel)</h3>
                ${(s.credentialsGrid || []).map((c, idx) => `
                    <div class="item-editor-box" data-cred-idx="${idx}">
                        <div class="f-grid-2">
                            <input type="text" class="f-input m-cred-title" value="${escapeHtml(c.title)}" placeholder="Degree / Focus Title" />
                            <input type="text" class="f-input m-cred-period" value="${escapeHtml(c.period)}" placeholder="Years / Subtitle" />
                        </div>
                        <textarea class="f-textarea m-cred-desc" rows="2" style="margin-top:8px;">${escapeHtml(c.description)}</textarea>
                    </div>
                `).join('')}
            `;

            document.getElementById('m-btn-upload').addEventListener('click', () => portraitUploadInput.click());

        } else if (activeModalTab === 'achievements') {
            modalContentArea.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <h3 style="font-family:var(--font-serif); color:var(--forest-green);">Manage Your Student Achievements</h3>
                    <button type="button" class="btn-terracotta-submit" id="m-add-ach" style="padding:8px 16px;">+ Add Achievement</button>
                </div>
                <div class="f-grid-2">
                    <div class="f-group">
                        <label>Intro Column 1:</label>
                        <textarea class="f-textarea" id="m-a-intro1" rows="2">${escapeHtml(a.introLeft)}</textarea>
                    </div>
                    <div class="f-group">
                        <label>Intro Column 2:</label>
                        <textarea class="f-textarea" id="m-a-intro2" rows="2">${escapeHtml(a.introRight)}</textarea>
                    </div>
                </div>
                ${(a.items || []).map((item, idx) => `
                    <div class="item-editor-box" data-ach-idx="${idx}">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <strong>Achievement #${idx + 1}</strong>
                            <button type="button" class="m-tab-btn m-del-ach" data-idx="${idx}" style="color:#c06044;">Remove</button>
                        </div>
                        <div class="f-grid-2">
                            <input type="text" class="f-input m-ach-title" value="${escapeHtml(item.title)}" placeholder="Achievement / Honor Title" />
                            <div style="display:flex; gap:8px;">
                                <input type="text" class="f-input m-ach-org" value="${escapeHtml(item.organization)}" placeholder="Institution / Event" />
                                <input type="text" class="f-input m-ach-year" value="${escapeHtml(item.year)}" placeholder="Year" />
                            </div>
                        </div>
                        <textarea class="f-textarea m-ach-desc" rows="2" style="margin-top:8px;">${escapeHtml(item.description)}</textarea>
                    </div>
                `).join('')}
            `;

            document.getElementById('m-add-ach').addEventListener('click', () => {
                collectModalInputs();
                portfolioData.achievements.items.unshift({
                    number: '0' + (portfolioData.achievements.items.length + 1),
                    title: 'New Student Achievement',
                    year: '2026',
                    organization: 'University / Competition',
                    description: 'Describe what you achieved and what it meant to your student journey.'
                });
                renderModalTab();
            });

            document.querySelectorAll('.m-del-ach').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectModalInputs();
                    portfolioData.achievements.items.splice(parseInt(btn.dataset.idx, 10), 1);
                    renderModalTab();
                });
            });

        } else if (activeModalTab === 'passions') {
            modalContentArea.innerHTML = `
                <div class="f-group">
                    <label>Passions Sidebar Intro (Pistachio Green Column):</label>
                    <textarea class="f-textarea" id="m-p-desc" rows="2">${escapeHtml(p.sidebarDesc)}</textarea>
                </div>
                <h3 style="margin:14px 0 10px; font-family:var(--font-serif); color:var(--forest-green);">Your 4 Passion Cards</h3>
                ${(p.cards || []).map((card, idx) => `
                    <div class="item-editor-box" data-passion-idx="${idx}">
                        <div class="f-grid-2">
                            <input type="text" class="f-input m-pas-title" value="${escapeHtml(card.title)}" placeholder="Passion Title" />
                            <input type="text" class="f-input m-pas-tag" value="${escapeHtml(card.tag)}" placeholder="Category Tag" />
                        </div>
                        <div class="f-group" style="margin-top:8px; margin-bottom:8px;">
                            <input type="text" class="f-input m-pas-img" value="${escapeHtml(card.image)}" placeholder="Image URL" />
                        </div>
                        <textarea class="f-textarea m-pas-desc" rows="2">${escapeHtml(card.description)}</textarea>
                    </div>
                `).join('')}
            `;

        } else if (activeModalTab === 'projects') {
            modalContentArea.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <h3 style="font-family:var(--font-serif); color:var(--forest-green);">Student Projects & Academic Works</h3>
                    <button type="button" class="btn-terracotta-submit" id="m-add-proj" style="padding:8px 16px;">+ Add Project</button>
                </div>
                ${(pr.items || []).map((item, idx) => `
                    <div class="item-editor-box" data-proj-idx="${idx}">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <strong>Work #${idx + 1}</strong>
                            <button type="button" class="m-tab-btn m-del-proj" data-idx="${idx}" style="color:#c06044;">Remove</button>
                        </div>
                        <div class="f-grid-2">
                            <input type="text" class="f-input m-pr-title" value="${escapeHtml(item.title)}" placeholder="Project Title" />
                            <div style="display:flex; gap:8px;">
                                <input type="text" class="f-input m-pr-date" value="${escapeHtml(item.date)}" placeholder="Year" />
                                <input type="text" class="f-input m-pr-loc" value="${escapeHtml(item.location)}" placeholder="Category" />
                            </div>
                        </div>
                        <div class="f-grid-2" style="margin-top:8px;">
                            <input type="text" class="f-input m-pr-img" value="${escapeHtml(item.image)}" placeholder="Image URL" />
                            <input type="text" class="f-input m-pr-link" value="${escapeHtml(item.link)}" placeholder="Project Link" />
                        </div>
                        <textarea class="f-textarea m-pr-desc" rows="2" style="margin-top:8px;">${escapeHtml(item.description)}</textarea>
                    </div>
                `).join('')}
            `;

            document.getElementById('m-add-proj').addEventListener('click', () => {
                collectModalInputs();
                portfolioData.projects.items.unshift({
                    title: 'New Student Project',
                    date: '2026',
                    location: 'Academic / Personal',
                    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
                    description: 'Short description of your project.',
                    link: 'https://github.com/sanjida5102'
                });
                renderModalTab();
            });

            document.querySelectorAll('.m-del-proj').forEach(btn => {
                btn.addEventListener('click', () => {
                    collectModalInputs();
                    portfolioData.projects.items.splice(parseInt(btn.dataset.idx, 10), 1);
                    renderModalTab();
                });
            });
        }
    }

    function collectModalInputs() {
        const val = id => {
            const el = document.getElementById(id);
            return el ? el.value : null;
        };

        if (activeModalTab === 'welcome') {
            const w = portfolioData.welcome;
            if (val('m-w-name') !== null) w.name = val('m-w-name');
            if (val('m-w-year') !== null) w.yearRange = val('m-w-year');
            if (val('m-w-outline') !== null) w.outlineTitle = val('m-w-outline');
            if (val('m-w-solid') !== null) w.solidTitle = val('m-w-solid');
            if (val('m-w-email') !== null) w.email = val('m-w-email');
            if (val('m-w-phone') !== null) w.phone = val('m-w-phone');
            if (val('m-w-addr1') !== null) w.addressLine1 = val('m-w-addr1');
            if (val('m-w-addr2') !== null) w.addressLine2 = val('m-w-addr2');
            if (val('m-w-soc1') !== null) w.socialLine1 = val('m-w-soc1');
            if (val('m-w-soc2') !== null) w.socialLine2 = val('m-w-soc2');
            if (val('m-w-sub') !== null) w.welcomeSubtitle = val('m-w-sub');

        } else if (activeModalTab === 'intro') {
            const s = portfolioData.studentIntro;
            if (val('m-s-avatar') !== null) s.avatar = val('m-s-avatar');
            if (val('m-s-bio1') !== null) s.bioParagraph1 = val('m-s-bio1');
            if (val('m-s-bio2') !== null) s.bioParagraph2 = val('m-s-bio2');
            if (val('m-s-q1') !== null) s.quickInfoLine1 = val('m-s-q1');
            if (val('m-s-q2') !== null) s.quickInfoLine2 = val('m-s-q2');

            const credBoxes = document.querySelectorAll('[data-cred-idx]');
            if (credBoxes.length) {
                s.credentialsGrid = Array.from(credBoxes).map(box => ({
                    title: box.querySelector('.m-cred-title').value,
                    period: box.querySelector('.m-cred-period').value,
                    description: box.querySelector('.m-cred-desc').value
                }));
            }

        } else if (activeModalTab === 'achievements') {
            const a = portfolioData.achievements;
            if (val('m-a-intro1') !== null) a.introLeft = val('m-a-intro1');
            if (val('m-a-intro2') !== null) a.introRight = val('m-a-intro2');

            const achBoxes = document.querySelectorAll('[data-ach-idx]');
            if (achBoxes.length) {
                a.items = Array.from(achBoxes).map((box, i) => ({
                    number: '0' + (i + 1),
                    title: box.querySelector('.m-ach-title').value,
                    organization: box.querySelector('.m-ach-org').value,
                    year: box.querySelector('.m-ach-year').value,
                    description: box.querySelector('.m-ach-desc').value
                }));
            }

        } else if (activeModalTab === 'passions') {
            const p = portfolioData.passions;
            if (val('m-p-desc') !== null) p.sidebarDesc = val('m-p-desc');
            const pasBoxes = document.querySelectorAll('[data-passion-idx]');
            if (pasBoxes.length) {
                p.cards = Array.from(pasBoxes).map(box => ({
                    title: box.querySelector('.m-pas-title').value,
                    tag: box.querySelector('.m-pas-tag').value,
                    image: box.querySelector('.m-pas-img').value,
                    description: box.querySelector('.m-pas-desc').value
                }));
            }

        } else if (activeModalTab === 'projects') {
            const prBoxes = document.querySelectorAll('[data-proj-idx]');
            if (prBoxes.length) {
                portfolioData.projects.items = Array.from(prBoxes).map(box => ({
                    title: box.querySelector('.m-pr-title').value,
                    date: box.querySelector('.m-pr-date').value,
                    location: box.querySelector('.m-pr-loc').value,
                    image: box.querySelector('.m-pr-img').value,
                    link: box.querySelector('.m-pr-link').value,
                    description: box.querySelector('.m-pr-desc').value
                }));
            }
        }
    }

    // Export JSON & Reset Defaults
    document.getElementById('btn-export-json').addEventListener('click', () => {
        collectModalInputs();
        const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student-portfolio-data.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('btn-reset-defaults').addEventListener('click', () => {
        if (confirm('Reset all portfolio sections back to the default template?')) {
            localStorage.removeItem(STORAGE_KEY);
            portfolioData = structuredClone(DEFAULT_PORTFOLIO_DATA);
            renderModalTab();
            renderAll();
        }
    });

    // Initialize
    renderAll();
})();
