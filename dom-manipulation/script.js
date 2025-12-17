// Quote Generator Application
let quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { id: 4, text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance" },
    { id: 5, text: "Whoever is happy will make others happy too.", category: "Happiness" },
    { id: 6, text: "In the middle of difficulty lies opportunity.", category: "Opportunity" }
];

let favorites = [];
let currentFilter = 'all';

// Initialize the application
function initApp() {
    loadFromStorage();
    setupEventListeners();
    showRandomQuote();
    updateStats();
    populateCategorySelect();
}

// Load data from localStorage
function loadFromStorage() {
    const savedQuotes = localStorage.getItem('quotes');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedQuotes) quotes = JSON.parse(savedQuotes);
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        renderFavorites();
    }
}

// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('favoriteQuote').addEventListener('click', addToFavorites);
    
    // Auto-sync checkbox
    document.getElementById('autoSync').addEventListener('change', function(e) {
        if (e.target.checked) {
            startAutoSync();
        } else {
            stopAutoSync();
        }
    });
    
    // Sync strategy radio buttons
    document.querySelectorAll('input[name="syncStrategy"]').forEach(radio => {
        radio.addEventListener('change', function(e) {
            localStorage.setItem('syncStrategy', e.target.id.replace('strategy', '').toLowerCase());
        });
    });
}

// Show random quote
function showRandomQuote() {
    const filteredQuotes = currentFilter === 'all' 
        ? quotes 
        : quotes.filter(q => q.category === currentFilter);
    
    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = `
            <p class="quote-text">No quotes found for this category.</p>
            <p class="quote-category">Category: ${currentFilter}</p>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    
    document.getElementById('quoteDisplay').innerHTML = `
        <p class="quote-text">"${quote.text}"</p>
        <p class="quote-category">Category: ${quote.category}</p>
    `;
}

// Add new quote
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    const categorySelect = document.getElementById('existingCategories');
    
    const text = textInput.value.trim();
    let category = categoryInput.value.trim();
    
    if (!category && categorySelect.value) {
        category = categorySelect.value;
    }
    
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
    textInput.value = '';
    categoryInput.value = '';
    
    saveToStorage();
    updateStats();
    populateCategorySelect();
    
    alert('Quote added successfully!');
}

// Add to favorites
function addToFavorites() {
    const quoteText = document.querySelector('.quote-text').textContent.replace(/"/g, '').trim();
    const quoteCategory = document.querySelector('.quote-category').textContent.replace('Category: ', '').trim();
    
    if (!quoteText || quoteText === 'No quotes found for this category.') {
        alert('No quote to add to favorites');
        return;
    }
    
    if (favorites.some(fav => fav.text === quoteText)) {
        alert('This quote is already in your favorites!');
        return;
    }
    
    favorites.push({
        text: quoteText,
        category: quoteCategory,
        dateAdded: new Date().toLocaleString()
    });
    
    saveToStorage();
    renderFavorites();
    
    alert('Added to favorites!');
}

// Render favorites list
function renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="no-favorites">No favorite quotes yet. Add some!</div>';
        return;
    }
    
    favoritesList.innerHTML = favorites.map((fav, index) => `
        <div class="favorite-item">
            <p>"${fav.text}"</p>
            <small>${fav.category} • Added: ${fav.dateAdded}</small>
            <button onclick="removeFavorite(${index})" style="margin-top: 5px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">Remove</button>
        </div>
    `).join('');
}

// Remove from favorites
function removeFavorite(index) {
    if (confirm('Remove this quote from favorites?')) {
        favorites.splice(index, 1);
        saveToStorage();
        renderFavorites();
    }
}

// Populate category select
function populateCategorySelect() {
    const categories = [...new Set(quotes.map(q => q.category))].sort();
    const select = document.getElementById('existingCategories');
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// Update statistics
function updateStats() {
    // Update UI elements as needed
    console.log(`Total quotes: ${quotes.length}, Categories: ${new Set(quotes.map(q => q.category)).size}`);
}

// Export quotes to JSON
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'quotes.json';
    link.click();
    
    alert(`Exported ${quotes.length} quotes`);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid format: expected array');
            }
            
            quotes.push(...importedQuotes);
            saveToStorage();
            populateCategorySelect();
            updateStats();
            
            alert(`Successfully imported ${importedQuotes.length} quotes!`);
            event.target.value = '';
            
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Sync with server (Task 4)
async function syncWithServer() {
    try {
        const serverUrl = document.getElementById('serverUrl').value;
        const response = await fetch(serverUrl + '?_limit=5');
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const serverData = await response.json();
        
        // Transform to our format
        const serverQuotes = serverData.map(post => ({
            id: `server_${post.id}`,
            text: post.title.substring(0, 100),
            category: 'From Server',
            source: 'server'
        }));
        
        // Add some demo server quotes
        serverQuotes.push({
            id: 'server_demo1',
            text: 'Server sync successful! Data is now consistent.',
            category: 'System',
            source: 'server'
        });
        
        // Merge with local quotes
        const strategy = document.querySelector('input[name="syncStrategy"]:checked').id;
        
        if (strategy === 'strategyOverwrite') {
            // Overwrite with server data
            quotes = [...serverQuotes];
            alert('Local data overwritten with server data');
        } else {
            // Merge (server wins for conflicts)
            const localMap = new Map(quotes.map(q => [q.id, q]));
            
            serverQuotes.forEach(serverQuote => {
                if (!localMap.has(serverQuote.id)) {
                    quotes.push(serverQuote);
                }
            });
            
            alert(`Sync complete. Added ${serverQuotes.length} server quotes`);
        }
        
        saveToStorage();
        populateCategorySelect();
        updateStats();
        
    } catch (error) {
        alert('Sync failed: ' + error.message);
    }
}

// Auto-sync functionality
let autoSyncInterval = null;

function startAutoSync() {
    const interval = parseInt(document.getElementById('syncInterval').value);
    
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
    }
    
    autoSyncInterval = setInterval(() => {
        if (confirm('Auto-sync: Sync with server now?')) {
            syncWithServer();
        }
    }, interval);
    
    console.log(`Auto-sync started: ${interval/1000} seconds`);
}

function stopAutoSync() {
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
        console.log('Auto-sync stopped');
    }
}

// Backup local data
function exportLocalData() {
    const data = {
        quotes: quotes,
        favorites: favorites,
        settings: {
            autoSync: document.getElementById('autoSync').checked,
            syncInterval: document.getElementById('syncInterval').value,
            syncStrategy: document.querySelector('input[name="syncStrategy"]:checked').id,
            serverUrl: document.getElementById('serverUrl').value
        },
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'quote_generator_backup.json';
    link.click();
    
    alert('Local data backup created');
}

// Clear all storage
function clearAllStorage() {
    if (confirm('Clear ALL saved data? This cannot be undone.')) {
        localStorage.clear();
        quotes = [];
        favorites = [];
        renderFavorites();
        updateStats();
        alert('All data cleared');
    }
}

// Make functions available globally
window.initApp = initApp;
window.showRandomQuote = showRandomQuote;
window.addQuote = addQuote;
window.addToFavorites = addToFavorites;
window.removeFavorite = removeFavorite;
window.exportQuotes = exportQuotes;
window.importFromJsonFile = importFromJsonFile;
window.syncWithServer = syncWithServer;
window.exportLocalData = exportLocalData;
window.clearAllStorage = clearAllStorage;