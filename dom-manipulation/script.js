// ==================== GLOBAL VARIABLES ====================
let quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { id: 4, text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance" }
];

let currentCategory = 'all';

// ==================== TASK 0: DYNAMIC CONTENT ====================

// REQUIRED: showRandomQuote()
function showRandomQuote() {
    let filteredQuotes = quotes;
    if (currentCategory !== 'all') {
        filteredQuotes = quotes.filter(q => q.category === currentCategory);
    }
    
    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = `
            <div class="quote-text">No quotes in this category</div>
            <div class="quote-category">Category: ${currentCategory}</div>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    
    document.getElementById('quoteDisplay').innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-category">Category: ${quote.category}</div>
    `;
}

// REQUIRED: createAddQuoteForm()
function createAddQuoteForm() {
    const section = document.getElementById('addQuoteSection');
    
    const formHTML = `
        <div>
            <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
            <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
            <button onclick="addQuote()">Add Quote</button>
        </div>
    `;
    
    // Check if form already exists
    if (!document.getElementById('newQuoteText')) {
        section.insertAdjacentHTML('beforeend', formHTML);
    }
}

// Function called by the form
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();
    
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
    
    // TASK 1: Save to local storage
    saveQuotes();
    
    // TASK 2: Update categories
    populateCategories();
    
    showRandomQuote();
    alert('Quote added successfully!');
}

// ==================== TASK 1: WEB STORAGE & JSON ====================

// Load from localStorage
function loadQuotesFromStorage() {
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
}

// REQUIRED: saveQuotes()
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('selectedCategory', currentCategory);
}

// REQUIRED: exportQuotes() using Blob
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'quotes.json';
    link.click();
    
    URL.revokeObjectURL(dataUrl);
    alert(`Exported ${quotes.length} quotes`);
}

// REQUIRED: importFromJsonFile()
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// ==================== TASK 2: CONTENT FILTERING ====================

// REQUIRED: populateCategories()
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(q => q.category))];
    const filter = document.getElementById('categoryFilter');
    const tags = document.getElementById('categoriesList');
    
    // Update filter dropdown
    filter.innerHTML = '<option value="all">All Categories</option>';
    tags.innerHTML = '';
    
    categories.forEach(cat => {
        if (cat === 'all') return;
        
        // Add to filter dropdown
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filter.appendChild(option);
        
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
            saveQuotes();
        };
        tags.appendChild(tag);
    });
    
    // Set current category in filter
    filter.value = currentCategory;
}

// REQUIRED: filterQuotes()
function filterQuotes() {
    currentCategory = document.getElementById('categoryFilter').value;
    
    // Update active tags
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.textContent === currentCategory) {
            tag.classList.add('active');
        }
    });
    
    // Save selected category
    localStorage.setItem('selectedCategory', currentCategory);
    
    showRandomQuote();
}

// ==================== TASK 3: SERVER SYNC ====================

// REQUIRED: POST with headers
async function postToServer() {
    try {
        if (quotes.length === 0) {
            alert('No quotes to post');
            return;
        }
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        // REQUIRED: POST method with Content-Type headers
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: randomQuote.text.substring(0, 50),
                body: `Category: ${randomQuote.category}`,
                userId: 1
            })
        });
        
        if (response.ok) {
            showNotification('Quote posted to server successfully!', 'success');
            return true;
        } else {
            throw new Error('Server responded with ' + response.status);
        }
        
    } catch (error) {
        showNotification('Failed to post: ' + error.message, 'error');
        return false;
    }
}

// REQUIRED: syncWithServer()
async function syncWithServer() {
    try {
        updateSyncStatus('Syncing with server...');
        
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
        if (!response.ok) throw new Error('Server error: ' + response.status);
        
        const serverData = await response.json();
        const serverQuotes = serverData.map(post => ({
            id: 'server_' + post.id,
            text: post.title.substring(0, 50),
            category: 'Server',
            source: 'server'
        }));
        
        // Conflict resolution: server wins
        let added = 0;
        let conflicts = 0;
        
        serverQuotes.forEach(serverQuote => {
            const existingIndex = quotes.findIndex(q => q.id === serverQuote.id);
            
            if (existingIndex === -1) {
                quotes.push(serverQuote);
                added++;
            } else {
                quotes[existingIndex] = serverQuote;
                conflicts++;
            }
        });
        
        // Update local storage
        saveQuotes();
        populateCategories();
        
        updateSyncStatus(`Sync complete: ${added} added, ${conflicts} updated`);
        showNotification(`Sync: ${added} added, ${conflicts} updated`, 'success');
        
    } catch (error) {
        updateSyncStatus('Sync failed: ' + error.message);
        showNotification('Sync failed', 'error');
    }
}

// REQUIRED: syncQuotes()
async function syncQuotes() {
    showNotification('Starting full sync...', 'info');
    
    // Fetch from server
    await syncWithServer();
    
    // Also post to server
    await postToServer();
    
    showNotification('Full sync completed!', 'success');
}

// REQUIRED: Periodic checking
let syncInterval = null;
function startPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    // Check every 60 seconds
    syncInterval = setInterval(async () => {
        showNotification('Auto-sync in progress...', 'info');
        await syncWithServer();
    }, 60000);
    
    showNotification('Auto-sync started (60s intervals)', 'success');
}

// REQUIRED: Conflict resolution function
function resolveConflicts(localData, serverData) {
    // Simple strategy: server wins
    return serverData.map(serverItem => {
        const localItem = localData.find(l => l.id === serverItem.id);
        return localItem ? { ...localItem, ...serverItem } : serverItem;
    });
}

// REQUIRED: Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#e8f4fd'};
        color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
        padding: 15px;
        border-radius: 5px;
        border-left: 4px solid ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#17a2b8'};
        z-index: 1000;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateSyncStatus(message) {
    const status = document.getElementById('syncStatus');
    status.textContent = message;
    status.style.display = 'block';
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load data
    loadQuotesFromStorage();
    
    // Load selected category
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        currentCategory = savedCategory;
    }
    
    // Initialize UI
    createAddQuoteForm();
    populateCategories();
    showRandomQuote();
    
    // Event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('categoryFilter').value = currentCategory;
});

// ==================== UTILITY ====================
function clearAllData() {
    if (confirm('Clear ALL data?')) {
        localStorage.clear();
        quotes = [
            { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" }
        ];
        currentCategory = 'all';
        populateCategories();
        showRandomQuote();
        alert('All data cleared');
    }
}