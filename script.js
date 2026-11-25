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
            answer: "I am a BSCS 4th year student at Lipa City Colleges, focusing on Software Engineering, Web Technologies, and Database Systems."
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
            answer: "You can reach me directly via email at Janmatsu81@gmail.com or send a message using the Contact section form at the bottom of this page!"
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
                    Hi there! 👋 I am Jan Matsu's portfolio assistant. What would you like to know? Pick any question below!
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

    /* --------------------------------------------------------------------------
       4. Hero Photo Slider (Arrows, Dot Indicators, Drag & Swipe, Autoplay)
       -------------------------------------------------------------------------- */
    const heroSlider = document.getElementById('heroSlider');
    const sliderTrack = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');
    const indicatorBtns = document.querySelectorAll('.slider-indicators .indicator');
    const slides = document.querySelectorAll('.slide-item');

    if (sliderTrack && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoplayTimer = null;
        let isDragging = false;
        let startPosX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;

        function updateSlider(index, animate = true) {
            if (index < 0) {
                currentIndex = totalSlides - 1;
            } else if (index >= totalSlides) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            if (animate) {
                sliderTrack.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
            } else {
                sliderTrack.style.transition = 'none';
            }

            sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Update active states
            slides.forEach((slide, idx) => {
                slide.classList.toggle('active', idx === currentIndex);
            });

            indicatorBtns.forEach((btn, idx) => {
                btn.classList.toggle('active', idx === currentIndex);
            });
        }

        // Navigation button listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                updateSlider(currentIndex - 1);
                restartAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                updateSlider(currentIndex + 1);
                restartAutoplay();
            });
        }

        // Indicators click
        indicatorBtns.forEach((indicator) => {
            indicator.addEventListener('click', () => {
                const slideIndex = parseInt(indicator.getAttribute('data-slide'), 10);
                updateSlider(slideIndex);
                restartAutoplay();
            });
        });

        // Autoplay logic (rotates every 5 seconds)
        function startAutoplay() {
            stopAutoplay();
            autoplayTimer = setInterval(() => {
                updateSlider(currentIndex + 1);
            }, 5000);
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopAutoplay);
            heroSlider.addEventListener('mouseleave', startAutoplay);

            // Touch & Mouse Drag / Swipe Handlers
            heroSlider.addEventListener('touchstart', touchStart, { passive: true });
            heroSlider.addEventListener('touchmove', touchMove, { passive: true });
            heroSlider.addEventListener('touchend', touchEnd);

            heroSlider.addEventListener('mousedown', touchStart);
            heroSlider.addEventListener('mousemove', touchMove);
            heroSlider.addEventListener('mouseup', touchEnd);
            heroSlider.addEventListener('mouseleave', () => {
                if (isDragging) touchEnd();
            });
        }

        function getPositionX(event) {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        function touchStart(event) {
            if (event.target.closest('.slider-btn') || event.target.closest('.slider-indicators')) return;
            isDragging = true;
            startPosX = getPositionX(event);
            prevTranslate = -currentIndex * (heroSlider ? heroSlider.offsetWidth : 0);
            stopAutoplay();
        }

        function touchMove(event) {
            if (!isDragging) return;
            const currentPosition = getPositionX(event);
            const diffX = currentPosition - startPosX;
            currentTranslate = prevTranslate + diffX;
            sliderTrack.style.transition = 'none';
            sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
        }

        function touchEnd() {
            if (!isDragging) return;
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;

            if (movedBy < -50 && currentIndex < totalSlides - 1) {
                currentIndex += 1;
            } else if (movedBy > 50 && currentIndex > 0) {
                currentIndex -= 1;
            } else if (movedBy < -50 && currentIndex === totalSlides - 1) {
                currentIndex = 0;
            } else if (movedBy > 50 && currentIndex === 0) {
                currentIndex = totalSlides - 1;
            }

            updateSlider(currentIndex, true);
            startAutoplay();
        }

        // Start autoplay initially
        startAutoplay();
    }

    /* --------------------------------------------------------------------------
       5. Scroll Reveal Animations - fade in every time section scrolls into view
       -------------------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if (revealElements.length > 0) {
        const revealOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0,
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                } else {
                    entry.target.classList.remove('revealed');
                }
            });
        }, revealOptions);

        revealElements.forEach((el) => revealObserver.observe(el));
    }

    /* --------------------------------------------------------------------------
       6. Page Transitions
       -------------------------------------------------------------------------- */
    const pageTransition = document.getElementById('pageTransition');

    if (pageTransition) {
        setTimeout(() => {
            pageTransition.classList.remove('is-active');
        }, 500);
    }

    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link || !pageTransition) return;

        const href = link.getAttribute('href');
        if (!href) return;

        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        if (link.target === '_blank') return;
        if (href.startsWith('http') && !href.includes(location.hostname)) return;

        event.preventDefault();
        pageTransition.classList.add('is-active');
        setTimeout(() => {
            location.href = href;
        }, 550);
    });

    /* --------------------------------------------------------------------------
       7. Contact Form → Resend Emailer
       -------------------------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const payload = Object.fromEntries(new FormData(contactForm).entries());
            const originalLabel = submitBtn ? submitBtn.innerHTML : '';

            formStatus.textContent = '';
            formStatus.className = 'form-status';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json().catch(() => ({}));

                if (!response.ok || !result.ok) {
                    throw new Error(result.error || 'Something went wrong. Please try again.');
                }

                formStatus.textContent = result.message || 'Thanks! Your message has been sent.';
                formStatus.classList.add('is-success');
                contactForm.reset();
            } catch (error) {
                formStatus.textContent = error.message || 'Something went wrong. Please try again.';
                formStatus.classList.add('is-error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalLabel;
                }
            }
        });
    }

});
