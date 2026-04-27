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

// --- Search Functionality ---
const searchContainer = document.createElement('div');
searchContainer.id = 'search-container';
searchContainer.innerHTML = '<input type="text" id="search-input" placeholder="Search documents by semantic meaning..." autocomplete="off">';
listElement.parentNode.insertBefore(searchContainer, listElement);

const searchInput = document.getElementById('search-input');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    
    if (query) {
        // Debounce the search to avoid spamming the endpoint while typing
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    } else {
        fetchDocuments();
    }
});

async function performSearch(query) {
    renderSkeletons();
    try {
        const endpoint = `/search?query=${encodeURIComponent(query)}`;
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        listElement.innerHTML = '';

        // The backend now returns a clean array of objects: [{id: '...', document: '...'}]
        if (data && data.length > 0) {
            data.forEach((item, index) => {
                const docId = item.id;
                const doc = item.document;
                const distance = item.distance;
                const div = document.createElement('div');
                div.className = 'document-item';
                
                div.style.animationDelay = `${index * 0.07}s`;
                const strong = document.createElement('strong');
                if (distance !== undefined) {
                    strong.textContent = `${docId} (Distance: ${distance.toFixed(4)}): `;
                } else {
                    strong.textContent = `${docId}: `;
                }
                div.appendChild(strong);
                div.appendChild(document.createTextNode(doc));
                listElement.appendChild(div);
            });
        } else {
            listElement.innerHTML = '<div class="empty-state">No matching documents found.</div>';
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        listElement.innerHTML = '<div class="empty-state" style="color: #ef4444;">Error loading search results.</div>';
    }
}

// --- High-End Dynamic Laser Background ---
const canvas = document.getElementById('laser-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
let width, height;

let currentEffect = 'none'; // The active animation effect
let isRedTheme = false; // The active UI theme

const effectSelector = document.getElementById('effect-selector');
if (effectSelector) {
    // Remove lightspeed options dynamically
    Array.from(effectSelector.options).forEach(opt => {
        if (opt.value.includes('lightspeed')) {
            opt.remove();
        }
    });

    // Add Red Lasers option if missing
    if (!Array.from(effectSelector.options).some(opt => opt.value === 'red-lasers')) {
        const redOption = document.createElement('option');
        redOption.value = 'red-lasers';
        redOption.textContent = 'Red Lasers';
        effectSelector.appendChild(redOption);
    }

    effectSelector.addEventListener('change', (e) => {
        const value = e.target.value;

        if (value === 'red-lasers') {
            isRedTheme = true;
            document.documentElement.classList.add('theme-red-lasers');
            document.body.classList.add('theme-red-lasers');
            currentEffect = 'laser-wave'; // Use laser-wave animation for this theme
        } else {
            isRedTheme = false;
            document.documentElement.classList.remove('theme-red-lasers');
            document.body.classList.remove('theme-red-lasers');
            currentEffect = value;
        }

        // Force all lasers to update their color based on the new theme
        lasers.forEach(laser => laser.updateColor());

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
        const colors = isRedTheme
            ? ['#ef4444', '#f87171', '#dc2626'] // Red theme colors
            : ['#00f3ff', '#38bdf8', '#0284c7']; // Default blue colors
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

// Create a pool of 12 simultaneous lasers
const lasers = Array.from({ length: 12 }, () => new Laser());

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
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    animate(timestamp);
});