// ==================== GLOBAL VARIABLES ====================
let quotes = [
    { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { id: 4, text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance" },
    { id: 5, text: "Whoever is happy will make others happy too.", category: "Happiness" },
    { id: 6, text: "In the middle of difficulty lies opportunity.", category: "Opportunity" }
];

let currentCategory = 'all';
let syncInterval = null;

// ==================== TASK 0: DYNAMIC CONTENT GENERATOR ====================

// REQUIRED FUNCTION: showRandomQuote()
function showRandomQuote() {
    let filteredQuotes = quotes;
    if (currentCategory !== 'all') {
        filteredQuotes = quotes.filter(q => q.category === currentCategory);
    }
    
    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = `
            <div class="quote-text">No quotes found in this category</div>
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

// REQUIRED FUNCTION: createAddQuoteForm()
function createAddQuoteForm() {
    const section = document.getElementById('addQuoteSection');
    
    // Clear any existing form
    const existingForm = section.querySelector('div');
    if (existingForm) {
        existingForm.remove();
    }
    
    // Create the form exactly as specified in the task
    const formHTML = `
        <div class="form-group">
            <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
            <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
            <button onclick="addQuote()">Add Quote</button>
        </div>
    `;
    
    section.insertAdjacentHTML('beforeend', formHTML);
}

// Function called by the form button
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();
    
    if (!text || !category) {
        alert('Please enter both quote text and category');
        return;
    }
    
    const newQuote = {
        id: Date.now(), // Unique ID for each quote
        text: text,
        category: category
    };
    
    quotes.push(newQuote);
    
    // Clear inputs
    textInput.value = '';
    categoryInput.value = '';
    
    // Save to localStorage (Task 1)
    saveQuotes();
    
    // Update categories dropdown (Task 2)
    populateCategories();
    
    // Show random quote
    showRandomQuote();
    
    alert('Quote added successfully!');
}

// ==================== TASK 1: WEB STORAGE & JSON HANDLING ====================

// Load quotes from localStorage
function loadQuotesFromStorage() {
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        try {
            quotes = JSON.parse(savedQuotes);
        } catch (error) {
            console.error('Error parsing quotes from localStorage:', error);
        }
    }
}

// REQUIRED FUNCTION: saveQuotes()
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Also save last viewed category
    localStorage.setItem('selectedCategory', currentCategory);
}

// REQUIRED FUNCTION: exportQuotes() - using Blob as specified
function exportQuotes() {
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    
    // REQUIRED: Use Blob and URL.createObjectURL
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = 'quotes_export.json';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(dataUrl);
    
    alert(`Exported ${quotes.length} quotes successfully!`);
}

// REQUIRED FUNCTION: importFromJsonFile(event)
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid JSON format. Expected an array of quotes.');
            }
            
            // Validate each quote
            const validQuotes = importedQuotes.filter(quote => 
                quote && 
                typeof quote.text === 'string' && 
                typeof quote.category === 'string' &&
                quote.text.trim().length > 0 &&
                quote.category.trim().length > 0
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file.');
            }
            
            quotes.push(...validQuotes);
            
            // REQUIRED: Call saveQuotes()
            saveQuotes();
            
            // Update UI
            populateCategories();
            showRandomQuote();
            
            alert(`Imported ${validQuotes.length} quotes successfully!`);
            
            // Reset file input
            event.target.value = '';
            
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading the file. Please try again.');
    };
    
    fileReader.readAsText(file);
}

// ==================== TASK 2: DYNAMIC CONTENT FILTERING ====================

// REQUIRED FUNCTION: populateCategories()
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    const categoriesList = document.getElementById('categoriesList');
    
    // Clear existing options except first
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Clear category tags
    categoriesList.innerHTML = '';
    
    // Add categories to dropdown and create tags
    categories.forEach(category => {
        if (category === 'all') return;
        
        // Add to dropdown
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
        
        // Create category tag
        const tag = document.createElement('span');
        tag.className = `category-tag ${currentCategory === category ? 'active' : ''}`;
        tag.textContent = category;
        tag.dataset.category = category;
        
        tag.addEventListener('click', function() {
            currentCategory = this.dataset.category;
            document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            categoryFilter.value = currentCategory;
            showRandomQuote();
            saveQuotes(); // Save selected category
        });
        
        categoriesList.appendChild(tag);
    });
}

// REQUIRED FUNCTION: filterQuotes()
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    currentCategory = categoryFilter.value;
    
    // Update active tag
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.dataset.category === currentCategory) {
            tag.classList.add('active');
        }
    });
    
    // Save selected category to localStorage
    localStorage.setItem('selectedCategory', currentCategory);
    
    showRandomQuote();
}

// ==================== TASK 3: SERVER SYNC & CONFLICT RESOLUTION ====================

// REQUIRED FUNCTION: fetchQuotesFromServer()
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }
        
        const serverData = await response.json();
        
        // Transform server data to match our quote format
        return serverData.map(post => ({
            id: `server_${post.id}`,
            text: post.title.substring(0, 100) + (post.body ? ': ' + post.body.substring(0, 50) + '...' : ''),
            category: 'Server',
            source: 'server',
            timestamp: new Date().toISOString()
        }));
        
    } catch (error) {
        console.error('Error fetching from server:', error);
        throw error;
    }
}

// REQUIRED FUNCTION: syncWithServer()
async function syncWithServer() {
    try {
        updateSyncStatus('🔄 Syncing with server...');
        
        // Fetch quotes from server
        const serverQuotes = await fetchQuotesFromServer();
        
        // Add some sample server quotes for demonstration
        serverQuotes.push(
            {
                id: 'server_demo_1',
                text: 'Server sync successful! Your data is now up to date.',
                category: 'System',
                source: 'server'
            },
            {
                id: 'server_demo_2',
                text: 'Conflict resolution applied: Server data takes precedence.',
                category: 'Technology',
                source: 'server'
            }
        );
        
        let addedCount = 0;
        let updatedCount = 0;
        let conflictCount = 0;
        
        // Process server quotes with conflict resolution
        serverQuotes.forEach(serverQuote => {
            const existingIndex = quotes.findIndex(q => q.id === serverQuote.id);
            
            if (existingIndex === -1) {
                // New quote from server
                quotes.push(serverQuote);
                addedCount++;
            } else {
                // Conflict detected - server takes precedence (as per requirements)
                const localQuote = quotes[existingIndex];
                
                if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
                    // There's a real conflict
                    conflictCount++;
                    quotes[existingIndex] = serverQuote; // Server wins
                    updatedCount++;
                }
                // If identical, no action needed
            }
        });
        
        // Save updated quotes
        saveQuotes();
        
        // Update UI
        populateCategories();
        showRandomQuote();
        
        // Show sync result
        let resultMessage = `✅ Sync completed successfully!`;
        if (addedCount > 0) resultMessage += `\n• Added ${addedCount} new quotes`;
        if (updatedCount > 0) resultMessage += `\n• Updated ${updatedCount} quotes`;
        if (conflictCount > 0) resultMessage += `\n• Resolved ${conflictCount} conflicts`;
        
        updateSyncStatus(resultMessage);
        
    } catch (error) {
        updateSyncStatus(`❌ Sync failed: ${error.message}`);
    }
}

function updateSyncStatus(message) {
    const syncStatus = document.getElementById('syncStatus');
    syncStatus.textContent = message;
    syncStatus.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (message.includes('✅')) {
        setTimeout(() => {
            syncStatus.style.display = 'none';
        }, 5000);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load quotes from localStorage
    loadQuotesFromStorage();
    
    // Load selected category
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        currentCategory = savedCategory;
    }
    
    // Initialize UI
    createAddQuoteForm(); // Task 0 requirement
    populateCategories(); // Task 2 requirement
    showRandomQuote();    // Task 0 requirement
    
    // Set up event listeners
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
    
    // Set initial category filter value
    document.getElementById('categoryFilter').value = currentCategory;
    
    // Update active category tag
    document.querySelectorAll('.category-tag').forEach(tag => {
        if (tag.dataset.category === currentCategory) {
            tag.classList.add('active');
        }
    });
});

// ==================== UTILITY FUNCTIONS ====================
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
        localStorage.clear();
        quotes = [
            { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { id: 3, text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
            { id: 4, text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance" }
        ];
        currentCategory = 'all';
        populateCategories();
        showRandomQuote();
        alert('All data has been cleared!');
    }
}