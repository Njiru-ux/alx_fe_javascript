// ==================== INITIAL DATA ====================
let quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { id: 4, text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance" }
];

let favorites = [];
let currentCategory = 'all';
let syncHistory = [];
let syncInterval = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load from localStorage
    loadFromStorage();
    
    // Initialize UI
    showRandomQuote();
    populateCategories();
    renderFavorites();
    
    // Setup event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('addToFavorites').addEventListener('click', addToFavorites);
    document.getElementById('autoSync').addEventListener('change', toggleAutoSync);
});

// ==================== TASK 0: DYNAMIC CONTENT ====================
// Required function: showRandomQuote()
function showRandomQuote() {
    const filtered = currentCategory === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === currentCategory);
    
    if (filtered.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = 
            '<p>No quotes in this category</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    
    document.getElementById('quoteDisplay').innerHTML = `
        <p>"${quote.text}"</p>
        <p><strong>Category:</strong> ${quote.category}</p>
    `;
}

// Required functionality: addQuote()
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    let category = document.getElementById('newQuoteCategory').value.trim();
    const existing = document.getElementById('existingCategories').value;
    
    if (!category && existing) category = existing;
    if (!text || !category) {
        alert('Please enter both quote text and category');
        return;
    }
    
    const newQuote = {
        id: Date.now(),
        text: text,
        category: category
    };
    
    quotes.push(newQuote);
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    saveToStorage();
    populateCategories();
    showRandomQuote();
    
    alert('Quote added successfully!');
}

// ==================== TASK 1: WEB STORAGE & JSON ====================
function loadFromStorage() {
    const savedQuotes = localStorage.getItem('quotes');
    const savedFavorites = localStorage.getItem('favorites');
    const savedSync = localStorage.getItem('syncHistory');
    
    if (savedQuotes) quotes = JSON.parse(savedQuotes);
    if (savedFavorites) favorites = JSON.parse(savedFavorites);
    if (savedSync) syncHistory = JSON.parse(savedSync);
}

function saveToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('syncHistory', JSON.stringify(syncHistory));
}

function exportQuotes() {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    
    URL.revokeObjectURL(url);
    alert(`Exported ${quotes.length} quotes`);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('Invalid format');
            
            quotes.push(...imported);
            saveToStorage();
            populateCategories();
            showRandomQuote();
            
            alert(`Imported ${imported.length} quotes!`);
            event.target.value = '';
        } catch (error) {
            alert('Import error: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function addToFavorites() {
    const quoteElement = document.querySelector('#quoteDisplay p');
    if (!quoteElement) return;
    
    const text = quoteElement.textContent.replace(/"/g, '').trim();
    if (!text || text === 'No quotes in this category') {
        alert('No quote to add');
        return;
    }
    
    if (favorites.some(f => f.text === text)) {
        alert('Already in favorites');
        return;
    }
    
    const category = document.querySelector('#quoteDisplay strong')?.nextSibling?.textContent?.trim() || 'Unknown';
    
    favorites.push({
        text: text,
        category: category,
        date: new Date().toLocaleString()
    });
    
    saveToStorage();
    renderFavorites();
    alert('Added to favorites!');
}

function renderFavorites() {
    const container = document.getElementById('favoritesList');
    if (favorites.length === 0) {
        container.innerHTML = '<p>No favorites yet.</p>';
        return;
    }
    
    container.innerHTML = favorites.map((fav, index) => `
        <div style="margin: 10px 0; padding: 10px; background: #f8f9fa;">
            <p>"${fav.text}"</p>
            <small>${fav.category} • ${fav.date}</small>
            <button onclick="removeFavorite(${index})" style="padding: 2px 8px;">Remove</button>
        </div>
    `).join('');
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    saveToStorage();
    renderFavorites();
}

function clearFavorites() {
    if (confirm('Clear all favorites?')) {
        favorites = [];
        saveToStorage();
        renderFavorites();
    }
}

// ==================== TASK 2: CONTENT FILTERING ====================
// Required function: populateCategories()
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    const filter = document.getElementById('categoryFilter');
    const existing = document.getElementById('existingCategories');
    const tags = document.getElementById('categoriesList');
    
    // Update filter dropdown
    filter.innerHTML = '<option value="all">All Categories</option>';
    existing.innerHTML = '<option value="">Or select existing category</option>';
    tags.innerHTML = '';
    
    categories.forEach(cat => {
        if (cat === 'all') return;
        
        // Add to filter dropdown
        const option1 = document.createElement('option');
        option1.value = cat;
        option1.textContent = cat;
        filter.appendChild(option1);
        
        // Add to existing categories
        const option2 = document.createElement('option');
        option2.value = cat;
        option2.textContent = cat;
        existing.appendChild(option2);
        
        // Add category tag
        const tag = document.createElement('span');
        tag.className = `category-tag ${currentCategory === cat ? 'active' : ''}`;
        tag.textContent = cat;
        tag.onclick = () => {
            currentCategory = cat;
            document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filter.value = cat;
            showRandomQuote();
        };
        tags.appendChild(tag);
    });
}

// Required function: filterQuotes()
function filterQuotes() {
    const filter = document.getElementById('categoryFilter');
    currentCategory = filter.value;
    
    // Update active tag
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.textContent === currentCategory) {
            tag.classList.add('active');
        }
    });
    
    showRandomQuote();
}

// ==================== TASK 3: SERVER SYNC ====================
async function syncWithServer() {
    try {
        updateSyncStatus('Syncing with server...');
        
        // 1. Fetch from JSONPlaceholder (REQUIRED)
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const serverData = await response.json();
        
        // 2. Transform to quotes
        const serverQuotes = serverData.map(post => ({
            id: `server_${post.id}`,
            text: post.title.substring(0, 50),
            category: 'Server',
            source: 'server',
            timestamp: new Date().toISOString()
        }));
        
        // 3. Add sample server quote
        serverQuotes.push({
            id: 'server_sample',
            text: 'Successfully synced from server!',
            category: 'Sync Demo',
            source: 'server'
        });
        
        // 4. Merge with local quotes (conflict resolution)
        const result = { added: 0, conflicts: 0 };
        
        serverQuotes.forEach(serverQuote => {
            const existingIndex = quotes.findIndex(q => q.id === serverQuote.id);
            
            if (existingIndex === -1) {
                // New quote from server
                quotes.push(serverQuote);
                result.added++;
            } else {
                // Conflict - server wins
                quotes[existingIndex] = serverQuote;
                result.conflicts++;
            }
        });
        
        // 5. Save and update
        saveToStorage();
        populateCategories();
        showRandomQuote();
        
        // 6. Record sync
        syncHistory.push({
            timestamp: new Date().toISOString(),
            added: result.added,
            conflicts: result.conflicts,
            total: quotes.length
        });
        saveToStorage();
        
        updateSyncStatus(`Sync complete: ${result.added} added, ${result.conflicts} updated`);
        
    } catch (error) {
        updateSyncStatus(`Sync failed: ${error.message}`);
    }
}

function toggleAutoSync() {
    const checkbox = document.getElementById('autoSync');
    const interval = parseInt(document.getElementById('syncInterval').value);
    
    if (checkbox.checked) {
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = setInterval(syncWithServer, interval);
        updateSyncStatus('Auto-sync enabled');
    } else {
        if (syncInterval) clearInterval(syncInterval);
        syncInterval = null;
        updateSyncStatus('Auto-sync disabled');
    }
}

function updateSyncStatus(message) {
    const status = document.getElementById('syncStatus');
    status.textContent = message;
    setTimeout(() => {
        if (status.textContent === message) {
            status.textContent = '';
        }
    }, 3000);
}

function showSyncLog() {
    if (syncHistory.length === 0) {
        alert('No sync history yet.');
        return;
    }
    
    const log = syncHistory.slice(-5).reverse().map(record => 
        `${new Date(record.timestamp).toLocaleTimeString()}: ${record.added} added, ${record.conflicts} conflicts`
    ).join('\n');
    
    alert('Recent Sync History:\n\n' + log);
}

function clearAllData() {
    if (confirm('Clear ALL data including quotes, favorites, and sync history?')) {
        localStorage.clear();
        quotes = [];
        favorites = [];
        syncHistory = [];
        populateCategories();
        renderFavorites();
        showRandomQuote();
        alert('All data cleared');
    }
}