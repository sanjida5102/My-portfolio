// =========================================================================
// Sanjida Maisha — Shaded Studio Portfolio & Animation Controller
// =========================================================================

(function () {
    const STORAGE_KEY = 'sanjida_maisha_portfolio_v4';

    let portfolioData = loadData();
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

    // =====================================================================
    // 1. DATA LOADING
    // =====================================================================
    function loadData() {
        return structuredClone(DEFAULT_PORTFOLIO_DATA);
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
        if (text.length < 3) return escapeHtml(text);
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
            <span class="section-eyebrow">01 • STUDENT INFO</span>
            <h2 class="section-display-title">${escapeHtml(s.heading || 'Student Info')}</h2>
            <p class="section-subtitle">${escapeHtml(s.subtitle)}</p>

            <div class="intro-bio-paragraphs stagger-item" style="margin-bottom: 36px;">
                <p>${escapeHtml(s.bioParagraph1)}</p>
                <p>${escapeHtml(s.bioParagraph2)}</p>

                <div class="intro-stats-row">
                    ${(s.stats || []).map(st => `
                        <div class="stat-glass-pill">
                            <div class="stat-val">${escapeHtml(st.value)}</div>
                            <div class="stat-lbl">${escapeHtml(st.label)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="studio-grid-2x2">
                ${(s.credentialsGrid || []).map((cred, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(cred.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag">${escapeHtml(cred.period)}</span>
                        </div>
                        <h3 class="card-heading">${escapeHtml(cred.title)}</h3>
                        <p class="card-description">${escapeHtml(cred.description)}</p>
                    </article>
                `).join('')}
            </div>
        `;

        // 02: Achievement
        const a = portfolioData.achievements;
        document.getElementById('sec-achievements').innerHTML = `
            <div class="section-watermark-num">${escapeHtml(a.sectionNumber)}</div>
            <span class="section-eyebrow">02 • ${escapeHtml(a.tag)}</span>
            <h2 class="section-display-title">${escapeHtml(a.heading || 'Achievement')}</h2>
            <p class="section-subtitle">${escapeHtml(a.subtitle)}</p>

            <div class="studio-grid-2x2">
                ${(a.items || []).map((item, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(item.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag">${escapeHtml(item.organization)} • ${escapeHtml(item.year)}</span>
                        </div>
                        <h3 class="card-heading">${escapeHtml(item.title)}</h3>
                        <p class="card-description">${escapeHtml(item.description)}</p>
                    </article>
                `).join('')}
            </div>
        `;

        // 03: Passions
        const p = portfolioData.passions;
        document.getElementById('sec-passions').innerHTML = `
            <div class="section-watermark-num">${escapeHtml(p.sectionNumber)}</div>
            <span class="section-eyebrow">03 • ${escapeHtml(p.tag)}</span>
            <h2 class="section-display-title">${escapeHtml(p.heading || 'Passions')}</h2>
            <p class="section-subtitle">${escapeHtml(p.subtitle)}</p>

            <div class="studio-grid-2x2">
                ${(p.cards || []).map((card, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="visual-card-media">
                            <img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.title)}" onerror="this.src='https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80'" />
                        </div>
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(card.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag">${escapeHtml(card.tag)}</span>
                        </div>
                        <h3 class="card-heading">${escapeHtml(card.title)}</h3>
                        <p class="card-description">${escapeHtml(card.description)}</p>
                    </article>
                `).join('')}
            </div>
        `;

        // 04: Works
        const pr = portfolioData.projects;
        document.getElementById('sec-projects').innerHTML = `
            <div class="section-watermark-num">${escapeHtml(pr.sectionNumber)}</div>
            <span class="section-eyebrow">04 • ${escapeHtml(pr.tag)}</span>
            <h2 class="section-display-title">${escapeHtml(pr.heading || 'Works')}</h2>
            <p class="section-subtitle">${escapeHtml(pr.subtitle)}</p>

            <div class="studio-grid-3">
                ${(pr.items || []).map((item, idx) => `
                    <article class="studio-item-card stagger-item">
                        <div class="visual-card-media">
                            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80'" />
                        </div>
                        <div class="card-top-meta">
                            <span class="card-index-pill">${escapeHtml(item.number || '0' + (idx + 1))}</span>
                            <span class="card-period-tag">${escapeHtml(item.date)} • ${escapeHtml(item.category)}</span>
                        </div>
                        <h3 class="card-heading">${escapeHtml(item.title)}</h3>
                        <p class="card-description">${escapeHtml(item.description)}</p>
                        ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener" class="card-action-link">Explore Project ↗</a>` : ''}
                    </article>
                `).join('')}
            </div>
        `;

        // 05: Contact details
        document.getElementById('sec-contact').innerHTML = `
            <div class="section-watermark-num">05</div>
            <span class="section-eyebrow">05 • GET IN TOUCH</span>
            <h2 class="section-display-title">Contact Details</h2>
            <p class="section-subtitle">Feel free to reach out for academic collaborations, student initiatives, or creative projects.</p>

            <div class="contact-studio-grid">
                <div class="stagger-item">
                    <div class="contact-info-list">
                        <div class="contact-info-row">
                            <span>Student Name</span>
                            <strong>${escapeHtml(w.fullName)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Academic Department</span>
                            <strong>${escapeHtml(w.department)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Email Address</span>
                            <strong>${escapeHtml(w.email)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Phone Number</span>
                            <strong>${escapeHtml(w.phone)}</strong>
                        </div>
                        <div class="contact-info-row">
                            <span>Location</span>
                            <strong>${escapeHtml(w.location)}</strong>
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
    }

    // =====================================================================
    // 3. OPTION BAR & CINEMATIC PAGE TRANSITIONS
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
    // 4. SUBTLE 3D MOUSE PARALLAX ON FRONT PAGE
    // =====================================================================
    if (heroStage) {
        window.addEventListener('mousemove', (e) => {
            if (welcomeScreen.classList.contains('hidden-cover')) return;
            const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
            const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;

            heroFirstName.style.transform = `translate3d(${xNorm * -16}px, ${yNorm * -9}px, 0)`;
            heroLastName.style.transform = `translate3d(${xNorm * 16}px, ${yNorm * 9}px, 0)`;
            heroRoleBox.style.transform = `translate3d(${xNorm * -6}px, ${yNorm * -5}px, 0)`;
        });
    }

    // =====================================================================
    // 5. SCROLL-TRIGGERED SECTION REVEAL ANIMATIONS
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
