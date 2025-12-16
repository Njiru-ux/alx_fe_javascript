// ============================================
// INITIALIZATION AND DATA MANAGEMENT
// ============================================

// Initial quotes data
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance" },
    { text: "Whoever is happy will make others happy too.", category: "Happiness" },
    { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" }
];

// Store for favorite quotes
let favorites = [];

// Track current category filter
let currentCategory = 'all';

// User preferences for session storage
let userPreferences = {
    theme: 'light',
    fontSize: 'medium',
    lastQuoteIndex: null
};

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoriesList = document.getElementById('categoriesList');
const favoritesList = document.getElementById('favoritesList');
const existingCategories = document.getElementById('existingCategories');
const totalQuotesElement = document.getElementById('totalQuotes');
const totalCategoriesElement = document.getElementById('totalCategories');
const lastUpdatedElement = document.getElementById('lastUpdated');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Dynamic Quote Generator...");
    
    // STEP 1: Load data from web storage
    loadDataFromStorage();
    
    // Load session-specific preferences
    loadSessionPreferences();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize categories
    initializeCategories();
    
    // Show a quote (preferably last viewed from session storage)
    showLastOrRandomQuote();
    
    // Update statistics
    updateStats();
    
    // Populate category select dropdown
    populateCategorySelect();
    
    console.log("Application initialized successfully!");
});

// ============================================
// WEB STORAGE IMPLEMENTATION
// ============================================

// STEP 1: Load data from local storage
function loadDataFromStorage() {
    console.log("Loading data from storage...");
    
    // Load quotes from localStorage
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        try {
            quotes = JSON.parse(savedQuotes);
            console.log(`Loaded ${quotes.length} quotes from localStorage`);
        } catch (error) {
            console.error("Error parsing quotes from localStorage:", error);
            // Keep default quotes
        }
    }
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
        try {
            favorites = JSON.parse(savedFavorites);
            console.log(`Loaded ${favorites.length} favorites from localStorage`);
            renderFavorites();
        } catch (error) {
            console.error("Error parsing favorites from localStorage:", error);
        }
    }
}

// Save data to local storage
function saveDataToStorage() {
    console.log("Saving data to storage...");
    
    // Save quotes to localStorage
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Save favorites to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update last updated timestamp
    const now = new Date();
    lastUpdatedElement.textContent = now.toLocaleTimeString();
    
    console.log("Data saved to localStorage");
}

// STEP 1 (Optional): Session Storage for user preferences
function loadSessionPreferences() {
    const savedPreferences = sessionStorage.getItem('userPreferences');
    if (savedPreferences) {
        try {
            userPreferences = JSON.parse(savedPreferences);
            console.log("Loaded user preferences from sessionStorage:", userPreferences);
            
            // Apply preferences if needed
            applyUserPreferences();
        } catch (error) {
            console.error("Error parsing preferences from sessionStorage:", error);
        }
    }
}

function saveSessionPreferences() {
    sessionStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    console.log("Saved preferences to sessionStorage");
}

function applyUserPreferences() {
    // Apply theme if different from current
    if (userPreferences.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Apply font size
    document.body.style.fontSize = userPreferences.fontSize === 'large' ? '18px' : 
                                  userPreferences.fontSize === 'small' ? '14px' : '16px';
}

function updateUserPreference(key, value) {
    userPreferences[key] = value;
    saveSessionPreferences();
    applyUserPreferences();
}

// ============================================
// EVENT LISTENERS AND UI SETUP
// ============================================

function setupEventListeners() {
    // Quote display button
    document.getElementById('newQuote').addEventListener('click', function() {
        showRandomQuote();
        // Save last viewed quote index to session storage
        updateUserPreference('lastQuoteIndex', quotes.length - 1);
    });
    
    // Favorite quote button
    document.getElementById('favoriteQuote').addEventListener('click', addToFavorites);
    
    // Clear favorites button
    document.getElementById('clearFavorites').addEventListener('click', clearFavorites);
    
    // Enter key support for inputs
    document.getElementById('newQuoteText').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addQuote();
    });
    
    document.getElementById('newQuoteCategory').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addQuote();
    });
    
    document.getElementById('newCategory').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addNewCategory();
    });
    
    // Theme toggle button (new feature for session storage demo)
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'btn-secondary';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i> Toggle Theme';
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add theme toggle to controls
    document.querySelector('.controls').appendChild(themeToggle);
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    userPreferences.theme = isDark ? 'dark' : 'light';
    saveSessionPreferences();
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.innerHTML = isDark ? 
        '<i class="fas fa-sun"></i> Light Mode' : 
        '<i class="fas fa-moon"></i> Dark Mode';
}

// ============================================
// CORE FUNCTIONALITY
// ============================================

function initializeCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categories.sort();
    categories.unshift('all');
    renderCategories(categories);
}

function renderCategories(categories) {
    categoriesList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-tag';
        categoryElement.textContent = category === 'all' ? 'All Categories' : category;
        categoryElement.dataset.category = category;
        
        if (category === currentCategory) {
            categoryElement.classList.add('active');
        }
        
        categoryElement.addEventListener('click', function() {
            setCategoryFilter(category);
        });
        
        categoriesList.appendChild(categoryElement);
    });
}

function setCategoryFilter(category) {
    currentCategory = category;
    
    // Update active state
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.dataset.category === category) {
            tag.classList.add('active');
        }
    });
    
    // Show a random quote from selected category
    showRandomQuote();
}

// Task 0: showRandomQuote function
function showRandomQuote() {
    let filteredQuotes = quotes;
    
    if (currentCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentCategory);
    }
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `
            <p class="quote-text">No quotes found for this category. Add some!</p>
            <p class="quote-category">Category: <span>${currentCategory}</span></p>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.text}"</p>
        <p class="quote-category">Category: <span>${randomQuote.category}</span></p>
    `;
    
    // Save to session storage
    updateUserPreference('lastViewedQuote', randomQuote.text);
}

function showLastOrRandomQuote() {
    // Check if we have a last viewed quote in session storage
    if (userPreferences.lastViewedQuote) {
        quoteDisplay.innerHTML = `
            <p class="quote-text">"${userPreferences.lastViewedQuote}"</p>
            <p class="quote-category">Last Viewed Quote</p>
        `;
    } else {
        showRandomQuote();
    }
}

// Task 0: createAddQuoteForm functionality (implemented as addQuote)
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    let quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    const selectedCategory = document.getElementById('existingCategories').value;
    
    // Use selected category if provided
    if (!quoteCategory && selectedCategory) {
        quoteCategory = selectedCategory;
    }
    
    if (!quoteText || !quoteCategory) {
        alert('Please enter both quote text and category');
        return;
    }
    
    // Add new quote
    const newQuote = {
        text: quoteText,
        category: quoteCategory
    };
    
    quotes.push(newQuote);
    
    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // STEP 1: Save to local storage
    saveDataToStorage();
    
    // Update categories if new
    updateCategories();
    
    // Update stats
    updateStats();
    
    // Show success message
    alert('Quote added successfully!');
}

// ============================================
// JSON IMPORT/EXPORT IMPLEMENTATION
// ============================================

// STEP 2: JSON Export Function
function exportQuotes() {
    console.log("Exporting quotes to JSON...");
    
    // Validate data
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    // Create JSON string
    const dataStr = JSON.stringify(quotes, null, 2);
    
    // Create blob and download link
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = 'quotes_export_' + new Date().toISOString().split('T')[0] + '.json';
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up URL object
    URL.revokeObjectURL(dataUrl);
    
    console.log("Export completed successfully");
    alert(`Exported ${quotes.length} quotes to JSON file!`);
}

// STEP 2: JSON Import Function
function importQuotes(event) {
    console.log("Importing quotes from JSON file...");
    
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected");
        return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.json')) {
        alert('Please select a JSON file (.json)');
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            console.log("Parsing JSON file...");
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate imported data structure
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
            // Validate each quote object
            const validQuotes = importedQuotes.filter(quote => {
                return quote && 
                       typeof quote.text === 'string' && 
                       typeof quote.category === 'string' &&
                       quote.text.trim().length > 0 &&
                       quote.category.trim().length > 0;
            });
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file');
            }
            
            // Add valid quotes to our collection
            quotes.push(...validQuotes);
            
            // STEP 1: Save to local storage
            saveDataToStorage();
            
            // Update UI
            updateCategories();
            populateCategorySelect();
            updateStats();
            showRandomQuote();
            
            console.log(`Imported ${validQuotes.length} quotes successfully`);
            alert(`Successfully imported ${validQuotes.length} quotes!`);
            
            // Reset file input
            event.target.value = '';
            
        } catch (error) {
            console.error("Error importing quotes:", error);
            alert('Error importing quotes: ' + error.message + '\n\nPlease ensure the file contains valid JSON with quote objects in the format:\n\n[\n  {\n    "text": "Quote text",\n    "category": "Category name"\n  }\n]');
        }
    };
    
    fileReader.onerror = function() {
        console.error("Error reading file");
        alert('Error reading the file. Please try again.');
    };
    
    fileReader.readAsText(file);
}

// Alternative import function matching the task description exactly
function importFromJsonFile(event) {
    console.log("Importing using importFromJsonFile...");
    importQuotes(event); // Using the same implementation
}

// ============================================
// ADDITIONAL FUNCTIONALITY
// ============================================

function addNewCategory() {
    const newCategoryInput = document.getElementById('newCategory');
    const newCategory = newCategoryInput.value.trim();
    
    if (!newCategory) {
        alert('Please enter a category name');
        return;
    }
    
    if (newCategory === 'all') {
        alert('"all" is a reserved category name');
        return;
    }
    
    // Check if category already exists
    const categories = [...new Set(quotes.map(quote => quote.category))];
    if (categories.includes(newCategory)) {
        alert('Category already exists');
        return;
    }
    
    // Clear input
    newCategoryInput.value = '';
    
    // Update categories
    updateCategories();
    
    // Populate select
    populateCategorySelect();
    
    alert('Category added successfully!');
}

function updateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categories.sort();
    categories.unshift('all');
    renderCategories(categories);
}

function populateCategorySelect() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categories.sort();
    
    existingCategories.innerHTML = '<option value="">Or select existing category</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        existingCategories.appendChild(option);
    });
}

function addToFavorites() {
    const quoteTextElement = quoteDisplay.querySelector('.quote-text');
    const quoteCategoryElement = quoteDisplay.querySelector('.quote-category span');
    
    if (!quoteTextElement || quoteTextElement.textContent.includes('No quotes found')) {
        alert('No quote to add to favorites');
        return;
    }
    
    const quoteText = quoteTextElement.textContent.replace(/"/g, '').trim();
    const quoteCategory = quoteCategoryElement.textContent;
    
    // Check if already in favorites
    if (favorites.some(fav => fav.text === quoteText && fav.category === quoteCategory)) {
        alert('This quote is already in your favorites!');
        return;
    }
    
    const favoriteQuote = {
        text: quoteText,
        category: quoteCategory,
        dateAdded: new Date().toLocaleString()
    };
    
    favorites.push(favoriteQuote);
    renderFavorites();
    
    // STEP 1: Save to local storage
    saveDataToStorage();
    
    // Update button text temporarily
    const favoriteBtn = document.getElementById('favoriteQuote');
    const originalHTML = favoriteBtn.innerHTML;
    favoriteBtn.innerHTML = '<i class="fas fa-star"></i> Added!';
    setTimeout(() => {
        favoriteBtn.innerHTML = originalHTML;
    }, 2000);
}

function renderFavorites() {
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="no-favorites">No favorite quotes yet.</p>';
        return;
    }
    
    favorites.forEach((favorite, index) => {
        const favoriteElement = document.createElement('div');
        favoriteElement.className = 'favorite-item';
        favoriteElement.innerHTML = `
            <p class="favorite-text">"${favorite.text}"</p>
            <div class="favorite-meta">
                <span class="favorite-category">${favorite.category}</span>
                <span class="favorite-date">Added: ${favorite.dateAdded}</span>
                <button onclick="removeFavorite(${index})" class="btn-remove">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        `;
        favoritesList.appendChild(favoriteElement);
    });
}

function removeFavorite(index) {
    if (confirm('Are you sure you want to remove this quote from favorites?')) {
        favorites.splice(index, 1);
        renderFavorites();
        
        // STEP 1: Save to local storage
        saveDataToStorage();
    }
}

function clearFavorites() {
    if (favorites.length === 0) {
        alert('No favorites to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear all favorites?')) {
        favorites = [];
        renderFavorites();
        
        // STEP 1: Save to local storage
        saveDataToStorage();
    }
}

function updateStats() {
    totalQuotesElement.textContent = quotes.length;
    totalCategoriesElement.textContent = new Set(quotes.map(quote => quote.category)).size;
    
    // Check when data was last saved
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) {
        const lastSave = new Date().toLocaleTimeString();
        lastUpdatedElement.textContent = lastSave;
        lastUpdatedElement.title = 'Data is being saved to localStorage';
    }
}

// ============================================
// ADDITIONAL WEB STORAGE DEMONSTRATION
// ============================================

// Function to clear all storage (for testing)
function clearAllStorage() {
    if (confirm('This will clear ALL saved data (quotes, favorites, preferences). Continue?')) {
        localStorage.clear();
        sessionStorage.clear();
        alert('All storage cleared! Page will reload.');
        location.reload();
    }
}

// Function to show storage usage (for debugging)
function showStorageInfo() {
    console.log("=== STORAGE INFORMATION ===");
    console.log("LocalStorage:");
    console.log("- quotes:", localStorage.getItem('quotes') ? JSON.parse(localStorage.getItem('quotes')).length + " items" : "empty");
    console.log("- favorites:", localStorage.getItem('favorites') ? JSON.parse(localStorage.getItem('favorites')).length + " items" : "empty");
    
    console.log("\nSessionStorage:");
    console.log("- userPreferences:", sessionStorage.getItem('userPreferences') ? "exists" : "empty");
    
    console.log("\nMemory:");
    console.log("- quotes array:", quotes.length + " items");
    console.log("- favorites array:", favorites.length + " items");
    console.log("===========================");
}

// Add storage info button for testing
document.addEventListener('DOMContentLoaded', function() {
    const storageInfoBtn = document.createElement('button');
    storageInfoBtn.id = 'storageInfoBtn';
    storageInfoBtn.className = 'btn-secondary';
    storageInfoBtn.innerHTML = '<i class="fas fa-database"></i> Storage Info';
    storageInfoBtn.style.marginTop = '10px';
    storageInfoBtn.addEventListener('click', function() {
        showStorageInfo();
        alert('Storage information logged to console. Press F12 to view.');
    });
    
    document.querySelector('.stats').appendChild(storageInfoBtn);
});