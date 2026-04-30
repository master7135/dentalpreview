document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    const revealItems = document.querySelectorAll('.reveal-on-scroll');
    const reviewTrack = document.querySelector('.google-review-track');
    const reviewMarquee = document.querySelector('.google-review-marquee');
    const reviewLane = document.querySelector('.google-review-lane');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll reveal animation
    if (revealItems.length) {
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.18,
                rootMargin: '0px 0px -40px 0px'
            });

            revealItems.forEach((item) => revealObserver.observe(item));
        } else {
            revealItems.forEach((item) => item.classList.add('is-visible'));
        }
    }

    // Continuous review marquee loop
    if (reviewTrack && reviewMarquee && reviewLane) {
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const baseCards = Array.from(reviewLane.querySelectorAll('.google-review-card'));
        let offset = 0;
        let lastTime = 0;
        let animationFrameId = null;
        let isPaused = false;
        const speed = 48; // pixels per second

        const buildMarquee = () => {
            const trackWidth = reviewTrack.getBoundingClientRect().width;
            const sampleCard = baseCards[0];

            if (!sampleCard) {
                return;
            }

            const cardWidth = sampleCard.getBoundingClientRect().width || 340;
            const gap = 24;
            const cardsNeeded = Math.max(baseCards.length * 2, Math.ceil((trackWidth * 2) / (cardWidth + gap)) + baseCards.length);

            reviewMarquee.innerHTML = '';
            for (let i = 0; i < cardsNeeded; i += 1) {
                const card = baseCards[i % baseCards.length].cloneNode(true);
                reviewMarquee.appendChild(card);
            }
        };

        const getCardSpan = () => {
            const firstCard = reviewMarquee.firstElementChild;
            if (!firstCard) {
                return 0;
            }

            const styles = window.getComputedStyle(reviewMarquee);
            const gap = parseFloat(styles.gap || styles.columnGap || '0');
            return firstCard.getBoundingClientRect().width + gap;
        };

        const animateMarquee = (timestamp) => {
            if (!lastTime) {
                lastTime = timestamp;
            }

            const delta = timestamp - lastTime;
            lastTime = timestamp;

            if (!isPaused) {
                offset += (speed * delta) / 1000;
                let cardSpan = getCardSpan();

                while (cardSpan > 0 && offset >= cardSpan) {
                    offset -= cardSpan;
                    reviewMarquee.appendChild(reviewMarquee.firstElementChild);
                    cardSpan = getCardSpan();
                }
            }

            reviewMarquee.style.transform = `translate3d(${-offset}px, 0, 0)`;
            animationFrameId = window.requestAnimationFrame(animateMarquee);
        };

        const startMarquee = () => {
            if (motionQuery.matches || animationFrameId) {
                return;
            }

            buildMarquee();
            offset = 0;
            reviewMarquee.style.transform = 'translate3d(0, 0, 0)';
            lastTime = 0;
            animationFrameId = window.requestAnimationFrame(animateMarquee);
        };

        const stopMarquee = () => {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };

        startMarquee();
        window.addEventListener('resize', () => {
            stopMarquee();
            buildMarquee();
            offset = 0;
            reviewMarquee.style.transform = 'translate3d(0, 0, 0)';
            startMarquee();
        });
        reviewTrack.addEventListener('mouseenter', () => {
            isPaused = true;
        });
        reviewTrack.addEventListener('mouseleave', () => {
            isPaused = false;
        });
        motionQuery.addEventListener('change', () => {
            if (motionQuery.matches) {
                stopMarquee();
                reviewMarquee.style.transform = 'translate3d(0, 0, 0)';
                offset = 0;
            } else {
                startMarquee();
            }
        });
    }

    // Mobile Menu Toggle (Basic implementation)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
        });
    }

    // Set minimum date for date picker to today
    const dateInput = document.getElementById('date');
    const phoneInput = document.getElementById('phone');
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotPanel = document.getElementById('chatbotPanel');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotQuickReplies = document.getElementById('chatbotQuickReplies');
    const chatbotForm = document.getElementById('chatbotForm');
    const chatbotInput = document.getElementById('chatbotInput');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const formattedToday = yyyy + '-' + mm + '-' + dd;
        dateInput.setAttribute('min', formattedToday);
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
        });
    }

    const chatbotFlows = {
        welcome: {
            message: 'Hello! I can help with appointments, clinic timings, services, location, and contact details. What would you like to know?',
            replies: ['Book Appointment', 'Clinic Timings', 'Services', 'Location', 'Phone Number']
        },
        booking: {
            message: 'To book an appointment, fill out the booking form on this page with your name, 10-digit phone number, preferred service, date, and time. I can also take you there now.',
            replies: ['Go to Booking Form', 'Services', 'Clinic Timings', 'Phone Number']
        },
        timings: {
            message: 'The clinic is open Monday to Saturday from 9:00 AM to 7:00 PM, and Sunday from 10:00 AM to 2:00 PM.',
            replies: ['Book Appointment', 'Location', 'Phone Number']
        },
        services: {
            message: 'We currently highlight General Dentistry, Cosmetic Dentistry, Orthodontics, and Dental Implants. If you want, I can narrow that down for braces, whitening, implants, or general checkups.',
            replies: ['Braces / Aligners', 'Teeth Whitening', 'Dental Implants', 'General Checkup']
        },
        location: {
            message: 'The clinic location shown on the site is 123 Wellness Avenue, South Ex, New Delhi 110049. You can also use the map in the footer section.',
            replies: ['Book Appointment', 'Phone Number', 'Clinic Timings']
        },
        phone: {
            message: 'You can contact the clinic at +91 98765 43210. If you need urgent booking help, calling is the fastest option.',
            replies: ['Book Appointment', 'Clinic Timings', 'Location']
        },
        braces: {
            message: 'For braces and aligners, the clinic offers orthodontic consultations to assess tooth alignment and suggest the best treatment path.',
            replies: ['Book Appointment', 'Clinic Timings', 'Phone Number']
        },
        whitening: {
            message: 'Teeth whitening is listed under cosmetic dentistry. For exact suitability and pricing, the clinic should assess your teeth first.',
            replies: ['Book Appointment', 'Phone Number', 'Services']
        },
        implants: {
            message: 'Dental implants are available for replacing missing teeth. The clinic will usually recommend an in-person evaluation before giving a full treatment plan.',
            replies: ['Book Appointment', 'Phone Number', 'Clinic Timings']
        },
        general: {
            message: 'For a general dental checkup, you can book directly from the appointment form and choose General Checkup or General Dentistry.',
            replies: ['Go to Booking Form', 'Clinic Timings', 'Phone Number']
        },
        pricing: {
            message: 'Exact treatment pricing is not shown on the site, so the safest answer is to contact the clinic or book a consultation for a proper quote.',
            replies: ['Phone Number', 'Book Appointment', 'Services']
        },
        emergency: {
            message: 'For severe pain, swelling, bleeding, or an urgent dental problem, please call the clinic directly or seek immediate medical attention. I cannot provide emergency treatment advice.',
            replies: ['Phone Number', 'Clinic Timings', 'Location']
        },
        fallback: {
            message: 'I can help with appointments, timings, services, location, phone number, and basic treatment categories. Try one of the options below.',
            replies: ['Book Appointment', 'Clinic Timings', 'Services', 'Location', 'Phone Number']
        }
    };

    const intentMap = [
        { keywords: ['book', 'appointment', 'booking', 'visit'], flow: 'booking' },
        { keywords: ['time', 'timing', 'hours', 'open', 'close'], flow: 'timings' },
        { keywords: ['service', 'treatment', 'offer'], flow: 'services' },
        { keywords: ['location', 'address', 'map', 'where'], flow: 'location' },
        { keywords: ['phone', 'call', 'contact', 'number'], flow: 'phone' },
        { keywords: ['brace', 'aligner', 'orthodontic'], flow: 'braces' },
        { keywords: ['whitening', 'white'], flow: 'whitening' },
        { keywords: ['implant', 'missing tooth'], flow: 'implants' },
        { keywords: ['checkup', 'general'], flow: 'general' },
        { keywords: ['price', 'pricing', 'cost', 'fees', 'charge'], flow: 'pricing' },
        { keywords: ['pain', 'bleeding', 'swelling', 'emergency', 'urgent'], flow: 'emergency' }
    ];

    const scrollToBooking = () => {
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const addChatMessage = (role, text) => {
        if (!chatbotMessages) {
            return;
        }

        const message = document.createElement('div');
        message.className = `chatbot-message ${role}`;
        message.textContent = text;
        chatbotMessages.appendChild(message);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const renderQuickReplies = (replies = []) => {
        if (!chatbotQuickReplies) {
            return;
        }

        chatbotQuickReplies.innerHTML = '';
        replies.forEach((reply) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chatbot-chip';
            chip.textContent = reply;
            chip.addEventListener('click', () => handleChatInput(reply));
            chatbotQuickReplies.appendChild(chip);
        });
    };

    const runChatFlow = (flowKey) => {
        const flow = chatbotFlows[flowKey] || chatbotFlows.fallback;
        addChatMessage('bot', flow.message);
        renderQuickReplies(flow.replies);
    };

    const resolveIntent = (input) => {
        const normalized = input.toLowerCase().trim();

        if (normalized === 'go to booking form') {
            return 'booking';
        }

        const matched = intentMap.find(({ keywords }) =>
            keywords.some((keyword) => normalized.includes(keyword))
        );

        return matched ? matched.flow : 'fallback';
    };

    const handleChatInput = (input) => {
        if (!input) {
            return;
        }

        addChatMessage('user', input);

        if (input.toLowerCase() === 'go to booking form') {
            runChatFlow('booking');
            scrollToBooking();
            return;
        }

        runChatFlow(resolveIntent(input));
    };

    if (chatbotToggle && chatbotPanel && chatbotClose && chatbotForm && chatbotInput) {
        const openChatbot = () => {
            chatbotPanel.hidden = false;
            chatbotInput.focus();
            if (!chatbotMessages.children.length) {
                runChatFlow('welcome');
            }
        };

        const closeChatbot = () => {
            chatbotPanel.hidden = true;
        };

        chatbotToggle.addEventListener('click', openChatbot);
        chatbotClose.addEventListener('click', closeChatbot);

        chatbotForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const value = chatbotInput.value.trim();
            if (!value) {
                return;
            }

            handleChatInput(value);
            chatbotInput.value = '';
        });
    }

    // Form Submission Handling
    const appointmentForm = document.getElementById('appointmentForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('span');
    const loader = document.getElementById('formLoader');
    const formMessage = document.getElementById('formMessage');

    appointmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset message
        formMessage.className = 'form-message';
        formMessage.textContent = '';
        
        // Show loader
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';
        submitBtn.disabled = true;

        // Gather data
        const normalizedPhone = (document.getElementById('phone').value || '').replace(/\D/g, '').slice(0, 10);

        if (normalizedPhone.length !== 10) {
            formMessage.textContent = 'Please enter a valid 10-digit phone number.';
            formMessage.className = 'form-message error';
            btnText.style.display = 'inline';
            loader.style.display = 'none';
            submitBtn.disabled = false;
            return;
        }

        const formData = {
            name: document.getElementById('name').value,
            phone: normalizedPhone,
            service: document.getElementById('service').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('/api/book-appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                formMessage.textContent = 'Appointment booked successfully! We will contact you soon.';
                formMessage.className = 'form-message success';
                appointmentForm.reset();
            } else {
                // Error from server
                formMessage.textContent = data.error || 'Failed to book appointment. Please try again.';
                formMessage.className = 'form-message error';
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            formMessage.textContent = 'A network error occurred. Please try again later.';
            formMessage.className = 'form-message error';
        } finally {
            // Hide loader
            btnText.style.display = 'inline';
            loader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
});
