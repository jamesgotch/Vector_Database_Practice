const listElement = document.getElementById('document-list');

// Render skeleton placeholders for that premium loading feel
function renderSkeletons() {
    listElement.innerHTML = Array(4).fill('<div class="skeleton"></div>').join('');
}

async function fetchDocuments() {
    renderSkeletons();
    try {
        const endpoint = '/documents';
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        listElement.innerHTML = '';

        // The backend now returns an array of objects: [{id: '...', document: '...'}]
        if (data && data.length > 0) {
            data.forEach((item, index) => {
                const docId = item.id;
                const doc = item.document;
                const div = document.createElement('div');
                div.className = 'document-item';
                
                div.style.animationDelay = `${index * 0.07}s`;
                const strong = document.createElement('strong');
                strong.textContent = `${docId}: `;
                div.appendChild(strong);
                div.appendChild(document.createTextNode(doc));
                listElement.appendChild(div);
            });
        } else {
            listElement.innerHTML = '<div class="empty-state">No documents found.</div>';
        }
    } catch (error) {
        console.error('Error fetching documents:', error);
        listElement.innerHTML = '<div class="empty-state" style="color: #ef4444;">Error loading database.</div>';
    }
}

// Fetch all documents initially
fetchDocuments();


// --- High-End Dynamic Laser Background ---
const canvas = document.getElementById('laser-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
let width, height;

let currentEffect = 'none';
const effectSelector = document.getElementById('effect-selector');
if (effectSelector) {
    effectSelector.addEventListener('change', (e) => {
        currentEffect = e.target.value;
        if (currentEffect.startsWith('laser')) {
            lasers.forEach(laser => laser.updateColor());
        } else if (currentEffect.startsWith('lightspeed')) {
            lightSpeedLasers.forEach(ls => ls.updateColor());
        }
        if (currentEffect === 'none') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, width, height);
        }
    });
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Laser {
    constructor() {
        this.reset();
        this.time = Math.random() * 1000;
    }

    reset() {
        this.y = Math.random() * height;
        // Angled spread for the lasers
        this.angle = (Math.random() - 0.5) * Math.PI / 2;
        this.waveSpeed = 0.0001 + Math.random() * 0.0003; // Slowed down horizontal wave speed
        this.amplitude = 50 + Math.random() * 250;
        this.frequency = 0.001 + Math.random() * 0.003;
        this.thickness = 1 + Math.random() * 2.5;
        
        this.glow = 15 + Math.random() * 30;
        this.alpha = 0.15 + Math.random() * 0.35;
        this.timeOffset = Math.random() * 1000;
        this.verticalSpeed = (Math.random() - 0.5) * 0.2; // Slowed down vertical drift
        
        this.updateColor();
    }

    updateColor() {
        const colors = ['#00f3ff', '#38bdf8', '#0284c7']; // All blue
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime) {
        this.time += deltaTime;
        this.y += this.verticalSpeed;
        
        // Loop smoothly off-screen (extended buffer to prevent popping when rotated)
        if (this.y > height + 1000) this.y = -1000;
        if (this.y < -1000) this.y = height + 1000;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = this.glow;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;
        ctx.globalCompositeOperation = 'screen';

        // Rotate around the center of the screen
        ctx.translate(width / 2, height / 2);
        // Dynamic rotation that bends and shifts slightly over time
        const currentAngle = this.angle + Math.sin(this.time * 0.0001) * 0.15;
        ctx.rotate(currentAngle);
        ctx.translate(-width / 2, -height / 2);

        ctx.beginPath();
        // Draw a smooth wave across the canvas with extended bounds
        for (let x = -1000; x <= width + 1000; x += 30) {
            const yOffset = Math.sin(x * this.frequency + (this.time * this.waveSpeed) + this.timeOffset) * this.amplitude;
            if (x === -1000) {
                ctx.moveTo(x, this.y + yOffset);
            } else {
                ctx.lineTo(x, this.y + yOffset);
            }
        }
        ctx.stroke();
        ctx.restore();
    }
}

// --- High-End Light Speed (Warp) Effect ---
class LightSpeedLaser {
    constructor() {
        this.reset(true);
    }

    reset(randomZ = false) {
        this.x = (Math.random() - 0.5) * 3000;
        this.y = (Math.random() - 0.5) * 3000;
        this.z = randomZ ? Math.random() * 2000 : 2000;
        this.pz = this.z;
        
        this.speed = 1.5 + Math.random() * 2.5; // Super high speed
        this.updateColor();
    }

    updateColor() {
        let colors;
        if (currentEffect === 'lightspeed-white') {
            colors = ['#ffffff', '#f8fafc', '#e2e8f0'];
        } else if (currentEffect === 'lightspeed-red') {
            colors = ['#ef4444', '#f87171', '#dc2626'];
        } else {
            colors = ['#00f3ff', '#38bdf8', '#0284c7', '#ffffff']; // Blue lightspeed
        }
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime) {
        this.pz = this.z;
        this.z -= this.speed * deltaTime;
        if (this.z < 10) this.reset();
    }

    draw(ctx) {
        const cx = width / 2;
        const cy = height / 2;
        const fov = 1000;

        // Calculate 3D to 2D perspective projection
        const sx = (this.x / this.z) * fov + cx;
        const sy = (this.y / this.z) * fov + cy;
        const px = (this.x / this.pz) * fov + cx;
        const py = (this.y / this.pz) * fov + cy;

        if (this.pz === this.z) return; // Prevent artifacts when resetting

        const thickness = Math.max(0.5, 1000 / this.z); // Get thicker as they get closer
        
        // Seamlessly fade in at distance and fade out right before camera to ensure infinite looping
        const distanceFade = Math.min(1, (2000 - this.z) / 250);
        const nearFade = Math.max(0, Math.min(1, (this.z - 10) / 50));
        const opacity = Math.min(1, 2000 / this.z * 0.4) * distanceFade * nearFade;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);

        // Draw a manual glow (thick transparent line)
        ctx.lineWidth = thickness + 4;
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = opacity * 0.3;
        ctx.stroke();

        // Draw core laser
        ctx.lineWidth = thickness;
        ctx.globalAlpha = opacity;
        ctx.stroke();
    }
}

// Create a pool of 12 simultaneous lasers
const lasers = Array.from({ length: 12 }, () => new Laser());

// Create a massive pool of light speed beams
const lightSpeedLasers = Array.from({ length: 3000 }, () => new LightSpeedLaser());

let lastTime = 0;

function animate(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (currentEffect.startsWith('laser')) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, width, height);
        
        ctx.globalCompositeOperation = 'screen';
        lasers.forEach(laser => {
            laser.update(deltaTime);
            laser.draw(ctx);
        });
    } else if (currentEffect.startsWith('lightspeed')) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000000'; // Pitch black space
        ctx.fillRect(0, 0, width, height);
        
        ctx.globalCompositeOperation = 'screen';
        lightSpeedLasers.forEach(ls => {
            ls.update(deltaTime);
            ls.draw(ctx);
        });
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    animate(timestamp);
});