// =========================================================================
// Default Aesthetic Diary Portfolio Data
// You can edit your personal details directly inside the Diary UI ("Edit Diary" button)
// or modify this file directly!
// =========================================================================

const DEFAULT_PORTFOLIO_DATA = {
    diaryMeta: {
        coverLabelTop: "NOTE",
        coverLabelBottom: "BOOK",
        coverOwnerText: "Belongs to: Sanjida Islam ✨",
        diaryYear: "2026 Edition",
        theme: "classic-sketch"
    },
    profile: {
        name: "Sanjida Islam",
        nickname: "Sanjida",
        title: "Frontend Developer & Creative Designer",
        tagline: "Sketching ideas & turning coffee into cozy web experiences ✨",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        polaroidCaption: "me & my little world ♡",
        birthday: "October 18",
        location: "Dhaka, Bangladesh",
        educationShort: "B.Sc. in Computer Science",
        languages: "Bengali, English",
        mbtiOrVibe: "INFJ • Creative Dreamer",
        status: "Open to opportunities & collaborations 🌱",
        dearDiaryDate: "Nov 11, 2026 — Wednesday",
        weatherMood: "☀️ Sunny & Inspired",
        bio: "Dear Visitor,\nWelcome to my personal sketch diary! I'm Sanjida, a passionate developer and creative soul who loves building warm, human-centered digital spaces. Instead of a boring resume, I wanted to share my world the way I plan my life — inside a scribbled notebook filled with snapshots, sticky notes, and dreams.",
        bioSecondParagraph: "When I'm not coding or designing interfaces, you'll probably find me doodling in margins, collecting cute stationery, brewing iced coffee, or exploring new tech ideas late at night.",
        favorites: [
            { label: "☕ Drink", value: "Iced Caramel Latte & Masala Tea" },
            { label: "🎨 Aesthetic", value: "Vintage Sketchbooks, Warm Minimal" },
            { label: "🎵 Music", value: "Lo-Fi Beats, Indie Acoustic, Rain Sounds" },
            { label: "📚 Pastime", value: "Journaling, UI Sketching, Photography" }
        ],
        hobbies: [
            "✏️ Sketching & Doodling",
            "💻 Creative Coding",
            "📸 Photography",
            "☕ Cafe Hopping",
            "📖 Reading Fiction",
            "🎨 UI/UX Design"
        ],
        stickyNoteQuote: "\"Create things that make the internet feel like a cozy, handmade place again.\""
    },
    tabs: [
        { id: "cover", label: "Cover", color: "#52796f" },
        { id: "about", label: "My Info", color: "#f4a261" },
        { id: "skills", label: "Skills", color: "#e76f51" },
        { id: "projects", label: "Works", color: "#81b29a" },
        { id: "journey", label: "Journey", color: "#457b9d" },
        { id: "contact", label: "Notes", color: "#e9c46a" }
    ],
    skills: {
        leftPageTitle: "Technical Sketchbook 🛠️",
        rightPageTitle: "Tools & Superpowers ✨",
        categories: [
            {
                name: "Code & Development",
                items: [
                    { name: "HTML5 & Semantic Structure", level: 95, note: "Daily driver" },
                    { name: "CSS3 / Animations / Grid", level: 92, note: "Love styling!" },
                    { name: "JavaScript (ES6+)", level: 88, note: "Interactive magic" },
                    { name: "React & Modern UI", level: 84, note: "Component craft" },
                    { name: "Tailwind & Responsive Design", level: 90, note: "Pixel-perfect" }
                ]
            },
            {
                name: "Design & Workflow",
                items: [
                    { name: "Figma & Wireframe Sketching", level: 88, note: "Visualizing" },
                    { name: "Git & GitHub Workflow", level: 85, note: "Version control" },
                    { name: "Problem Solving & Logic", level: 86, note: "Clean code" }
                ]
            }
        ],
        stickers: [
            "JavaScript", "HTML5", "CSS3", "React", "Figma",
            "Git & GitHub", "UI/UX", "Responsive Web", "REST APIs",
            "Creative Coding", "Canva", "VS Code"
        ],
        currentlyLearning: "Exploring interactive 3D web animations, micro-interactions, and full-stack architecture!"
    },
    projects: [
        {
            id: 1,
            title: "Aesthetic Sketch Diary Portfolio",
            category: "Interactive Web App",
            date: "Nov 2026",
            description: "A hand-drawn spiral notebook portfolio with realistic page turns, editable personal biodata, custom doodle pen, and paper textures.",
            tags: ["HTML5", "CSS3", "JavaScript", "SVG Sketch"],
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80",
            demoLink: "#about",
            githubLink: "https://github.com/sanjida5102/My-portfolio"
        },
        {
            id: 2,
            title: "Cozy Study & Focus Space",
            category: "Productivity Tool",
            date: "Sep 2026",
            description: "A virtual desk companion with a Pomodoro timer, ambient rain/cafe audio mixer, and sticky-note task tracker.",
            tags: ["React", "Tailwind", "Web Audio", "LocalStorage"],
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80",
            demoLink: "https://github.com/sanjida5102",
            githubLink: "https://github.com/sanjida5102"
        },
        {
            id: 3,
            title: "Artisan Coffee & Bookshop UI",
            category: "E-Commerce Concept",
            date: "Jul 2026",
            description: "Warm editorial storefront designed for an independent bookstore and cafe, featuring smooth menu filters and book previews.",
            tags: ["JavaScript", "CSS Grid", "UI Design"],
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
            demoLink: "https://github.com/sanjida5102",
            githubLink: "https://github.com/sanjida5102"
        },
        {
            id: 4,
            title: "Personal Weather & Mood Log",
            category: "Web Experiment",
            date: "May 2026",
            description: "Minimalist daily logger that pairs live local weather forecasts with custom hand-drawn weather icons and journal prompts.",
            tags: ["REST API", "JavaScript", "SVG Art"],
            image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
            demoLink: "https://github.com/sanjida5102",
            githubLink: "https://github.com/sanjida5102"
        }
    ],
    journey: [
        {
            period: "2025 - Present",
            title: "Frontend Developer & Designer",
            place: "Freelance & Personal Studio",
            type: "work",
            description: "Crafting bespoke portfolios, interactive web experiences, and clean user interfaces with a personal artistic touch."
        },
        {
            period: "2022 - 2026",
            title: "Bachelor of Science in CSE",
            place: "University Studies",
            type: "education",
            description: "Deepened my foundation in software engineering, algorithms, database systems, and human-computer interaction."
        },
        {
            period: "2023",
            title: "UI/UX & Web Design Exploration",
            place: "Design Communities & Hackathons",
            type: "milestone",
            description: "Started blending hand-drawn illustrations and paper metaphors into modern responsive websites."
        },
        {
            period: "2021",
            title: "Wrote My First 'Hello World'",
            place: "Home Desk",
            type: "milestone",
            description: "Discovered the joy of turning blank screens into living, breathing creations with HTML, CSS & JS."
        }
    ],
    contact: {
        email: "sanjida@example.com",
        phone: "+880 1XXX-XXXXXX",
        location: "Dhaka, Bangladesh",
        github: "https://github.com/sanjida5102",
        linkedin: "https://linkedin.com",
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        note: "Feel free to tear off a note or send me a letter! I'd love to hear from you about projects, internships, or creative ideas.",
        guestbookEntries: [
            {
                name: "A Fellow Traveler",
                date: "Nov 2026",
                message: "Such a cozy and creative diary portfolio! Feels just like flipping through a real sketchbook. ✨"
            }
        ]
    }
};
