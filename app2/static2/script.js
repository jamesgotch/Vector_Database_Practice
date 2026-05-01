document.addEventListener('DOMContentLoaded', () => {
    const listElement = document.getElementById('chunk-list');

    async function fetchChunks() {
        try {
            const response = await fetch('/chunk');
            const data = await response.json();

            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'chunk-item';
                div.innerHTML = `<p>${item.chunk}</p><span>Length: ${item.length} characters</span>`;
                listElement.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching chunks:', error);
            listElement.innerHTML = '<p>Error loading chunks.</p>';
        }
    }

    fetchChunks();
});