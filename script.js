/* ==========================================================================
   Personal Portfolio JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. Light / Dark Mode Toggle with LocalStorage
       -------------------------------------------------------------------------- */
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    // Check stored user preference or system default
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);

        if (themeIcon) {
            if (theme === 'light') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        }
    }

    /* --------------------------------------------------------------------------
       2. Mobile Hamburger Navigation
       -------------------------------------------------------------------------- */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when clicking any nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }

    /* --------------------------------------------------------------------------
       3. "Ask About Me" Chatbot with Predefined Answers
       -------------------------------------------------------------------------- */
    const chatMessages = document.getElementById('chatMessages');
    const promptChips = document.getElementById('promptChips');
    const resetChatBtn = document.getElementById('resetChatBtn');

    // Predefined questions & answers
    const botAnswers = {
        education: {
            question: "🎓 What is your education?",
            answer: "I am pursuing a Bachelor of Science in Information Technology (BSIT) focusing on Software Engineering, Web Technologies, and Database Systems."
        },
        skills: {
            question: "💻 What are your key technical skills?",
            answer: "My core stack includes HTML5, CSS3, JavaScript (ES6+), React, Git & GitHub, as well as backend API development with Node.js and RESTful services."
        },
        projects: {
            question: "🚀 What projects have you completed?",
            answer: "I've built several projects including an E-Commerce Web Storefront with cart management and an Interactive Task & Sprint Board with drag-and-drop workflows!"
        },
        contact: {
            question: "📬 How can I hire or contact you?",
            answer: "You can reach me directly via email at mathew@example.com or send a message using the Contact section form at the bottom of this page!"
        }
    };

    if (promptChips && chatMessages) {
        promptChips.addEventListener('click', (event) => {
            const chip = event.target.closest('.chip');
            if (!chip) return;

            const questionKey = chip.getAttribute('data-question');
            const data = botAnswers[questionKey];

            if (data) {
                // Add user question bubble
                appendMessage(data.question, 'user-bubble');

                // Simulate brief thinking delay for realistic feeling
                setTimeout(() => {
                    appendMessage(data.answer, 'bot-bubble');
                }, 350);
            }
        });
    }

    function appendMessage(text, className) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${className}`;
        bubble.textContent = text;
        chatMessages.appendChild(bubble);

        // Auto-scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Reset chat functionality
    if (resetChatBtn && chatMessages) {
        resetChatBtn.addEventListener('click', () => {
            chatMessages.innerHTML = `
                <div class="chat-bubble bot-bubble">
                    Hi there! 👋 I am Mathew's portfolio assistant. What would you like to know about Mathew? Pick any question below!
                </div>
            `;
        });
    }

    /* --------------------------------------------------------------------------
       4. Active Navigation Link on Scroll
       -------------------------------------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    });

});
