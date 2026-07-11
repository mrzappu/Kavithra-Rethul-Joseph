/* ============================================
   KAVITHRA & RETHUL WEDDING — CLEAN JAVASCRIPT
   ============================================ */

// ===== 1. VIDEO INTRO HANDLING =====
const introScreen = document.getElementById('intro-screen');
const introVideo = document.getElementById('intro-video');
const mainPage = document.getElementById('main-page');

let introEnded = false;

function endIntro() {
    if (introEnded) return; // already ending
    introEnded = true;
    introScreen.classList.add('fade-out');

    setTimeout(() => {
        introScreen.style.display = 'none';
        mainPage.classList.remove('hidden');
        startCardAnimation();
        // Audio was already playing during the video — just ensure it continues
        tryAutoplayAudio();
    }, 1200); // matches the CSS fade-out transition
}

// Only end intro when the video fully finishes playing
introVideo.addEventListener('ended', endIntro);

// Fallback: if video fails to load/play, end intro after 20 seconds
const introFallbackTimer = setTimeout(endIntro, 20000);
introVideo.addEventListener('ended', () => clearTimeout(introFallbackTimer));

// Allow tapping/clicking the screen to skip intro manually
introScreen.addEventListener('click', endIntro);
introScreen.addEventListener('touchstart', endIntro, { passive: true });

// Start audio playing immediately during the video intro (before card opens)
window.addEventListener('DOMContentLoaded', () => {
    const bgAudioEl = document.getElementById('bg-audio');
    if (bgAudioEl) {
        bgAudioEl.volume = 0.6;
        bgAudioEl.play().catch(() => {
            // Browser blocked autoplay — will try again after card loads
        });
    }
});


// ===== 2. CARD EXPANSION & SEQUENTIAL ANIMATION =====
function startCardAnimation() {
    const weddingCard = document.getElementById('glass-card-wedding');

    // Expand ONLY the wedding card from pill to full
    requestAnimationFrame(() => {
        if (weddingCard) weddingCard.classList.add('expanded');
    });

    // Reveal Bismillah text
    setTimeout(() => {
        const bismillah = document.getElementById('bismillah-text');
        if (bismillah) bismillah.classList.add('revealed');
    }, 600);

    // Animate name letters
    setTimeout(() => animateNameLetters('bride-name'), 1200);
    setTimeout(() => animateNameLetters('groom-name'), 1900);

    // Fade in anim-items ONLY inside the wedding card
    const animItems = weddingCard
        ? weddingCard.querySelectorAll('.anim-item')
        : document.querySelectorAll('.anim-item');
    animItems.forEach(item => {
        const delay = parseInt(item.getAttribute('data-delay')) || 0;
        setTimeout(() => {
            item.classList.add('visible');
        }, delay);
    });

    // Show the "Reception" floating nav button after card is revealed
    setTimeout(() => {
        const btn = document.getElementById('go-reception-btn');
        if (btn) {
            btn.style.display = 'flex';
            requestAnimationFrame(() => btn.classList.add('visible'));
        }
    }, 2600);
}


// ===== CARD SWITCHER — Floating Nav Buttons =====
const goReceptionBtn = document.getElementById('go-reception-btn');
const goWeddingBtn   = document.getElementById('go-wedding-btn');
const weddingCard    = document.getElementById('glass-card-wedding');
const recCard        = document.getElementById('glass-card-reception');

let receptionReady = false; // track if reception card has been expanded yet

function showReception() {
    // Ensure reception card is expanded (first time only)
    if (!receptionReady) {
        recCard.classList.add('expanded');
        receptionReady = true;
        // Animate anim-items inside reception card
        const recItems = recCard.querySelectorAll('.anim-item');
        recItems.forEach(item => {
            const delay = parseInt(item.getAttribute('data-delay')) || 0;
            setTimeout(() => item.classList.add('visible'), delay + 300);
        });
    }

    // Slide wedding out left, reception in from right
    weddingCard.classList.remove('slide-in-left');
    weddingCard.classList.add('slide-out-left');

    recCard.classList.remove('slide-out');
    recCard.classList.add('active');

    // Swap nav buttons
    goReceptionBtn.classList.remove('visible');
    setTimeout(() => {
        goReceptionBtn.style.display = 'none';
        goWeddingBtn.style.display = 'flex';
        requestAnimationFrame(() => goWeddingBtn.classList.add('visible'));
    }, 300);
}

function showWedding() {
    // Slide reception out right, wedding back in
    recCard.classList.remove('active');
    recCard.classList.add('slide-out');

    weddingCard.classList.remove('slide-out-left');
    weddingCard.classList.add('slide-in-left');

    // Swap nav buttons
    goWeddingBtn.classList.remove('visible');
    setTimeout(() => {
        goWeddingBtn.style.display = 'none';
        goReceptionBtn.style.display = 'flex';
        requestAnimationFrame(() => goReceptionBtn.classList.add('visible'));
    }, 300);
}

if (goReceptionBtn) goReceptionBtn.addEventListener('click', showReception);
if (goWeddingBtn)   goWeddingBtn.addEventListener('click', showWedding);



// ===== 3. NAME LETTER-BY-LETTER ANIMATION =====
function animateNameLetters(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.textContent;
    el.innerHTML = '';

    const letters = text.split('');
    letters.forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'name-letter';
        span.textContent = char === ' ' ? '\u00A0' : char; // non-breaking space
        el.appendChild(span);

        setTimeout(() => {
            span.classList.add('show');
        }, i * 60); // 60ms stagger per letter
    });
}


// ===== 4. COUNTDOWN TIMERS =====
// Wedding: Aug 31, 2026 10:00 AM IST  = UTC 04:30
const WEDDING_DATE    = new Date('2026-08-31T04:30:00Z').getTime();
// Reception: Aug 31, 2026 4:00 PM IST = UTC 10:30
const RECEPTION_DATE  = new Date('2026-08-31T10:30:00Z').getTime();

function makeCountdownUpdater(targetMs, idPrefix) {
    return function tick() {
        const now = Date.now();
        const dist = targetMs - now;

        const dEl  = document.getElementById(idPrefix + 'days');
        const hEl  = document.getElementById(idPrefix + 'hours');
        const mEl  = document.getElementById(idPrefix + 'mins');
        const sEl  = document.getElementById(idPrefix + 'secs');
        const wrap = document.getElementById(idPrefix + 'countdown');

        if (!dEl) return; // element not in DOM yet

        if (dist <= 0) {
            if (wrap) wrap.innerHTML = '<p style="font-family:var(--font-script);font-size:2rem;margin:1rem 0;">It\'s the Big Day! 🎉</p>';
            return;
        }

        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);

        dEl.textContent = String(d).padStart(2, '0');
        hEl.textContent = String(h).padStart(2, '0');
        mEl.textContent = String(m).padStart(2, '0');
        sEl.textContent = String(s).padStart(2, '0');
    };
}

const tickWedding   = makeCountdownUpdater(WEDDING_DATE,   'w-');
const tickReception = makeCountdownUpdater(RECEPTION_DATE, 'r-');

tickWedding();
tickReception();
setInterval(tickWedding,   1000);
setInterval(tickReception, 1000);



// ===== 5. ADD TO CALENDAR (.ics download) =====
const addToCalBtn = document.getElementById('addToCalendar');
if (addToCalBtn) {
    addToCalBtn.addEventListener('click', () => {
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Kavithra Rethul Wedding//EN',
            'BEGIN:VEVENT',
            'UID:kavithra-rethul-wedding-2026@invite',
            'DTSTAMP:' + formatICSDate(new Date()),
            'DTSTART:20260831T043000Z',
            'DTEND:20260831T093000Z',
            'SUMMARY:Wedding of Kavithra & Rethul Joseph',
            'DESCRIPTION:Join us in celebrating the marriage of Kavithra and Rethul Joseph.',
            'LOCATION:CSI Church Inchivila\\, Thiruvananthapuram',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Kavithra_Rethul_Wedding.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}


// ===== 6. AUDIO PLAYER =====
const audioBtn = document.getElementById('audio-toggle');
const bgAudio = document.getElementById('bg-audio');

if (audioBtn && bgAudio) {
    audioBtn.addEventListener('click', () => {
        if (bgAudio.paused) {
            bgAudio.play();
            audioBtn.classList.add('playing');
        } else {
            bgAudio.pause();
            audioBtn.classList.remove('playing');
        }
    });
}

function tryAutoplayAudio() {
    if (bgAudio) {
        bgAudio.play().then(() => {
            if (audioBtn) audioBtn.classList.add('playing');
        }).catch(() => {
            // Autoplay blocked — user will click the button
        });
    }
}


// ===== 7. FLOATING PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const count = window.innerWidth > 768 ? 12 : 6;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Alternate between hearts and sparkles
        const isHeart = i % 3 !== 0;
        const size = Math.random() * 16 + 10;
        const colors = [
            'rgba(255, 158, 187, 0.6)',
            'rgba(255, 182, 193, 0.5)',
            'rgba(255, 140, 170, 0.7)',
            'rgba(255, 192, 203, 0.4)'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];

        if (isHeart) {
            particle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/></svg>`;
        } else {
            particle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>`;
        }

        // Random fixed position
        const positions = [
            { left: '10%', top: '15%' },
            { left: '85%', top: '20%' },
            { left: '15%', top: '70%' },
            { left: '90%', top: '65%' },
            { left: '50%', top: '10%' },
            { left: '30%', top: '85%' },
            { left: '70%', top: '40%' },
            { left: '20%', top: '45%' },
            { left: '75%', top: '30%' },
            { left: '40%', top: '75%' },
            { left: '80%', top: '80%' },
            { left: '60%', top: '15%' }
        ];

        const pos = positions[i % positions.length];
        particle.style.left = pos.left;
        particle.style.top = pos.top;
        particle.style.opacity = (Math.random() * 0.15 + 0.08).toFixed(2);
        particle.style.transform = `scale(${(Math.random() * 0.5 + 0.5).toFixed(2)})`;

        container.appendChild(particle);
    }
}

createParticles();
