// =========================================================================
// Portfolio Data — Sanjida Maisha
// Shaded Green-Ash Studio Hero + Animated Shaded Studio Pages
// =========================================================================

const DEFAULT_PORTFOLIO_DATA = {
    welcome: {
        firstName: "SANJIDA",
        lastName: "MAISHA",
        fullName: "Sanjida Maisha",
        roleLine1: "Student Leader,",
        roleLine2: "Holy Cross College '27 • Debater • Anchor",
        email: "sanjida.maisha@example.com",
        phone: "+880 1XXX-XXXXXX",
        location: "Dhaka, Bangladesh",
        department: "Holy Cross College (HSC 2027) • Ex-Sena Public School and College, Dhaka",
        github: "https://github.com/sanjida5102",
        linkedin: "https://linkedin.com"
    },
    studentIntro: {
        sectionNumber: "01",
        tag: "STUDENT INTRODUCTION & ACADEMICS",
        heading: "Student Info",
        subtitle: "Holy Cross College (Class of 2027) • SSC GPA 5.00/5.00 from Sena Public School and College, Dhaka.",
        bioParagraph1: "Hello! I am Sanjida Maisha — a dedicated Science student at Holy Cross College (Graduation Year: 2027), where I am studying Physics, Chemistry, Mathematics, Biology, English, and ICT. Previously, I completed my SSC from Sena Public School and College, Dhaka, achieving a perfect GPA of 5.00 out of 5.00.",
        bioParagraph2: "Alongside my academic pursuits, I am a national-level debater, public speaking champion, stage anchor, and student leader. From serving as School House Leader and leading the girls' handball team to hosting a Women Empowerment seminar for 7,000 women and mentoring junior students, I strive for excellence both inside and outside the classroom.",
        stats: [
            { value: "5.00 / 5.00", label: "SSC GPA • Sena Public School & College" },
            { value: "HSC 2027", label: "Holy Cross College" },
            { value: "6 Subjects", label: "Physics, Chem, Math, Bio, Eng, ICT" },
            { value: "7,000+", label: "Seminar Audience Hosted" }
        ],
        credentialsGrid: [
            {
                number: "01",
                title: "Higher Secondary Certificate (HSC) — Holy Cross College",
                period: "Holy Cross College • Graduation Year: 2027",
                description: "Currently pursuing Higher Secondary studies at Holy Cross College. Subjects in College: Physics, Chemistry, Math, Biology, English, and ICT."
            },
            {
                number: "02",
                title: "Secondary School Certificate (SSC) — GPA 5.00 out of 5.00",
                period: "Sena Public School and College, Dhaka",
                description: "Graduated from Sena Public School and College, Dhaka, achieving a perfect SSC GPA of 5.00 out of 5.00 alongside active leadership as House Leader and Handball Team Leader."
            },
            {
                number: "03",
                title: "College Curriculum & Core Subjects",
                period: "Science Group • Class of 2027",
                description: "Studying Physics, Chemistry, Mathematics, Biology, English, and Information & Communication Technology (ICT) at Holy Cross College."
            },
            {
                number: "04",
                title: "Leadership, Oratory & Mentorship Profile",
                period: "Debate • Anchoring • Student Governance",
                description: "Champion public speaker and debater, 2 years of anchoring experience (including college Orientation & Farewell events and a 7,000-attendee seminar), and mentor to students from Classes 5 to 10."
            }
        ]
    },
    achievements: {
        sectionNumber: "02",
        tag: "HONORS & CO-CURRICULAR AWARDS",
        heading: "Achievement",
        subtitle: "National and regional distinctions in debate, public speaking, persuasive essay writing, and student leadership.",
        items: [
            {
                number: "01",
                title: "Champion in Public Speaking Competition",
                year: "National Honor",
                organization: "Cultural Ministry • National Library of Bangladesh",
                description: "Crowned Champion in the Public Speaking Competition organized by the Cultural Ministry, held at the National Library of Bangladesh."
            },
            {
                number: "02",
                title: "Regional Champion & Best Speaker",
                year: "2024",
                organization: "Inter Cantonment Debate Competition",
                description: "Won the Regional Championship title and was honored as the Best Speaker in the Inter Cantonment Debate Competition (2024)."
            },
            {
                number: "03",
                title: "2nd Runner-Up in National TV Debate",
                year: "2024",
                organization: "Bangladesh Television (BTV) School & College Debate",
                description: "Achieved 2nd Runner-up in the Bangladesh Television School & College Debate Competition (2024)."
            },
            {
                number: "04",
                title: "Best Speaker (Language Skill Category)",
                year: "2023",
                organization: "JUDO National Debate Fest",
                description: "Awarded the Best Speaker title in the Language Skill Category at the JUDO National Debate Fest (2023)."
            },
            {
                number: "05",
                title: "3rd Place in Inter Cantonment Essay Writing",
                year: "Essay Honor",
                organization: "Inter Cantonment Essay Writing Competition",
                description: "Secured 3rd place in the Inter Cantonment Essay Writing Competition for research depth, structured argumentation, and persuasive style."
            },
            {
                number: "06",
                title: "School House Leader & Girls’ Handball Team Leader",
                year: "1 Year Tenure",
                organization: "School Leadership & Athletics",
                description: "Entrusted to serve as the House Leader of my school for one year and led the school girls’ handball team for one year."
            }
        ]
    },
    passions: {
        sectionNumber: "03",
        tag: "WHAT DRIVES ME",
        heading: "Passions",
        subtitle: "The co-curricular pursuits and creative disciplines that define my voice and leadership.",
        cards: [
            {
                number: "01",
                title: "Debate & Public Speaking",
                tag: "Oratory & Logic",
                image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=700&q=80",
                description: "Crafting compelling arguments, speaking with clarity and conviction, and engaging audiences on national and regional stages."
            },
            {
                number: "02",
                title: "Stage Anchoring & Event Hosting",
                tag: "7,000+ Audience Reach",
                image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=700&q=80",
                description: "Bringing energy, poise, and warmth to large-scale seminars, women empowerment conventions, and college ceremonies."
            },
            {
                number: "03",
                title: "Mentoring & Persuasive Writing",
                tag: "Empowering Juniors",
                image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",
                description: "Guiding younger students in essay structuring, research, and debate techniques so they can shine in competitive programmes."
            },
            {
                number: "04",
                title: "Team Sports & Student Leadership",
                tag: "Handball & House Leader",
                image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=700&q=80",
                description: "Fostering teamwork, discipline, and resilience through leading the school girls' handball team and serving as House Leader."
            }
        ]
    },
    projects: {
        sectionNumber: "04",
        tag: "CO-CURRICULAR ACTIVITIES & ROLES",
        heading: "Works",
        subtitle: "Leadership roles, student mentorship programmes, anchoring highlights, and athletic captaincy.",
        items: [
            {
                number: "01",
                title: "Anchoring & Hosting (7,000-Attendee Women Empowerment Seminar)",
                date: "2 Years Exp.",
                category: "Anchoring & Public Hosting",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=700&q=80",
                description: "2 years of anchoring experience. Hosted a landmark Seminar on Women Empowerment where 7,000 women were present, and hosted the Orientation and Farewell events in College."
            },
            {
                number: "02",
                title: "Debate & Public Speaking Mentorship (Classes 5 to 10)",
                date: "Mentorship",
                category: "Competitive Debate Coaching",
                image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=700&q=80",
                description: "Mentored students from Classes 5 to 10 on debate frameworks, rebuttal strategy, and public speaking techniques for competitive programmes."
            },
            {
                number: "03",
                title: "Essay Structuring & Persuasive Writing Guidance (Classes 7 to 9)",
                date: "Mentorship",
                category: "Research & Writing Workshop",
                image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=700&q=80",
                description: "Guided students from Classes 7 to 9 in essay structuring, research methodology, and persuasive writing styles to improve their writing performance in various competitions."
            },
            {
                number: "04",
                title: "School House Leader",
                date: "1 Year Tenure",
                category: "Student Governance",
                image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80",
                description: "Served as the House Leader of my school for one year, leading house members, organizing co-curricular initiatives, and upholding school spirit."
            },
            {
                number: "05",
                title: "School Girls’ Handball Team Leader",
                date: "1 Year Tenure",
                category: "Athletics & Team Captaincy",
                image: "https://images.unsplash.com/photo-1517649763962-0c623266013b?auto=format&fit=crop&w=700&q=80",
                description: "Led the school girls’ handball team for one year, coordinating team practice, match strategy, and sportsmanship across competitions."
            }
        ]
    }
};
