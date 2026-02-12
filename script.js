const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null };

// Resize handling
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Mouse interaction tracking
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// --- AUDIO & LYRICS SYSTEM ---
const audio = document.getElementById('bgMusic');
const currentLyric = document.getElementById('currentLyric');
let hasInteracted = false;

// Lyrics for "Can't Help Falling in Love" - Precise Sync
const lyrics = [
    { text: "Wise men say...", time: 5.5 },
    { text: "Only fools rush in", time: 10.5 },
    { text: "But I can't help", time: 17 },
    { text: "Falling in love with you", time: 22.5 },
    { text: "Shall I stay?", time: 31.5 },
    { text: "Would it be a sin?", time: 38 },
    { text: "If I can't help", time: 45 },
    { text: "Falling in love with you...", time: 51 },
    { text: "Like a river flows", time: 60 },
    { text: "Surely to the sea", time: 65.5 },
    { text: "Darling so it goes", time: 72 },
    { text: "Some things are meant to be", time: 78 },
    { text: "Take my hand", time: 86.5 },
    { text: "Take my whole life too", time: 93 },
    { text: "For I can't help", time: 99.5 },
    { text: "Falling in love with you", time: 105.5 }
];

function updateLyrics() {
    // Always update if playing
    if (!audio.paused) {
        const time = audio.currentTime;
        const lyric = lyrics.findLast(l => l.time <= time);
        if (lyric && currentLyric.textContent !== `🎵 ${lyric.text} 🎵`) { // Check content to avoid flicker
            currentLyric.style.opacity = 0;
            currentLyric.style.transform = "scale(0.9)";
            setTimeout(() => {
                currentLyric.textContent = `🎵 ${lyric.text} 🎵`;
                currentLyric.style.opacity = 1;
                currentLyric.style.transform = "scale(1)";
            }, 300);
        }
    }
    requestAnimationFrame(updateLyrics);
}

// Force Play Logic - Aggressive
function forcePlayMusic() {
    if (hasInteracted) return;
    hasInteracted = true;

    audio.volume = 1.0;
    audio.play().then(() => {
        console.log("Music started successfully");
        updateLyrics();
    }).catch(e => {
        console.log("Autoplay failed, waiting for next interaction");
        hasInteracted = false; // Reset to try again
    });
}

// Bind to ALL user interactions to ensure it starts ASAP
document.body.addEventListener('click', forcePlayMusic);
document.body.addEventListener('touchstart', forcePlayMusic);
document.body.addEventListener('keydown', forcePlayMusic);
document.body.addEventListener('mousemove', () => {
    if (!hasInteracted) forcePlayMusic();
});
// Try once on load just in case (e.g. refresh)
window.addEventListener('load', () => {
    audio.play().then(() => {
        hasInteracted = true;
        updateLyrics();
    }).catch(() => { });
});


// --- PARTICLE SYSTEM (Rose Petals & Magic Dust) ---
class Particle {
    constructor(x, y, type = 'normal') {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * height;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 1.5 + 0.8; // Faster fall

        // Vibrant Colors
        const isGold = Math.random() > 0.8;
        if (isGold) {
            this.color = `hsla(50, 100%, 70%, ${Math.random() * 0.6 + 0.4})`; // Bright Gold
        } else {
            this.color = `hsla(350, 90%, 50%, ${Math.random() * 0.5 + 0.5})`; // Vivid Red
        }

        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.type = type;

        if (type === 'explosion') {
            this.speedX = (Math.random() * 10 - 5);
            this.speedY = (Math.random() * 10 - 5);
            this.size = Math.random() * 12 + 6;
            this.life = 1;
            this.decay = Math.random() * 0.015 + 0.01;
            this.gravity = 0.15;
            this.color = Math.random() > 0.5 ? `hsla(50, 100%, 60%, 1)` : `hsla(340, 100%, 60%, 1)`;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        if (this.type === 'explosion') {
            ctx.globalAlpha = this.life;
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.type === 'normal') {
            this.speedX += Math.sin(this.y * 0.01) * 0.02;

            // Mouse Repulsion (Magic Wind)
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 180) { // Larger radius
                    const force = (180 - distance) / 180;
                    this.speedX -= (dx / distance) * force * 5; // Stronger force
                    this.speedY -= (dy / distance) * force * 5;
                }
            }

            if (this.x > width + 50) this.x = -50;
            if (this.x < -50) this.x = width + 50;
            if (this.y > height + 50) {
                this.y = -50;
                this.x = Math.random() * width;
            }
        } else if (this.type === 'explosion') {
            this.speedY += this.gravity;
            this.life -= this.decay;
        }
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 90; i++) { // More particles
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].type === 'explosion' && particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    // Start animation loop
    requestAnimationFrame(animateParticles);
}



// --- UI LOGIC ---
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const mainTitle = document.getElementById('mainTitle');
const subTitle = document.getElementById('subTitle');
const contentCard = document.querySelector('.card');
const loadingOverlay = document.getElementById('loadingOverlay');

// --- 2. Loading Screen Logic ---
window.addEventListener('load', () => {
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 2500);
});

// --- 3. URL Personalization ---
const urlParams = new URLSearchParams(window.location.search);
const name = urlParams.get('name');
if (name) {
    mainTitle.textContent = `${name}, ¿quieres ser mi San Valentín? 💖`;
}

// --- 4. 3D Tilt Effect & Parallax ---
// --- PARALLAX EFFECT ---
document.addEventListener('mousemove', (e) => {
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
        const x = (window.innerWidth - e.pageX * 2) / 50;
        const y = (window.innerHeight - e.pageY * 2) / 50;
        parallaxBg.style.transform = `translate(${x}px, ${y}px)`;
    }

    // Original Tilt Logic
    if (window.innerWidth <= 768) return; // Disable on mobile

    const card = document.querySelector('.card');
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Reset tilt on mouse leave
document.addEventListener('mouseleave', () => {
    contentCard.style.transform = `rotateY(0deg) rotateX(0deg)`;
    contentCard.style.transition = 'transform 0.5s ease';
});

// Remove transition when moving creates smoother effect
document.addEventListener('mouseenter', () => {
    contentCard.style.transition = 'none';
});

// --- 5. Playful "No" Button ---
function moveButton() {
    // Get viewport dimensions
    const w = window.innerWidth - 100;
    const h = window.innerHeight - 100;

    // Calculate new position ensuring it stays within viewport
    // Padding of 50px from edges
    const newX = Math.random() * w + 50;
    const newY = Math.random() * h + 50;

    noBtn.style.position = 'fixed'; // Change to fixed to move freely
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
}

noBtn.addEventListener('mouseover', moveButton);
noBtn.addEventListener('click', moveButton); // Just in case they capture it
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent touch click
    moveButton();
});


// --- Confetti/Heart Explosion function ---
function createExplosion(x, y) {
    for (let i = 0; i < 150; i++) { // More sparkles
        particles.push(new Particle(x, y, 'explosion'));
    }
}

yesBtn.addEventListener('click', (e) => {
    // Magic Sparkles
    const rect = yesBtn.getBoundingClientRect();
    createExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2);

    // More fireworks
    let fireworksInterval = setInterval(() => {
        createExplosion(Math.random() * width, Math.random() * height * 0.8);
    }, 200);
    setTimeout(() => clearInterval(fireworksInterval), 4000);

    // Fade out text
    mainTitle.style.opacity = 0;
    subTitle.style.opacity = 0;
    document.getElementById('lyricsContainer').style.opacity = 0;
    yesBtn.style.opacity = 0;
    noBtn.style.opacity = 0;

    setTimeout(() => {
        mainTitle.textContent = "Be Our Guest Forever! 🌹";
        subTitle.textContent = "Te amo hasta el último pétalo.";

        mainTitle.style.opacity = 1;
        subTitle.style.opacity = 1;

        yesBtn.style.display = 'none';
        noBtn.style.display = 'none';
    }, 500);
});



// Start
initParticles();
animateParticles();
