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

// User preferences
let userPreferences = {
    theme: 'light',
    fontSize: 'medium',
    lastFilter: 'all'
};

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoriesList = document.getElementById('categoriesList');
const favoritesList = document.getElementById('favoritesList');
const existingCategories = document.getElementById('existingCategories');
const categoryFilter = document.getElementById('categoryFilter');
const filterInfo = document.getElementById('filterInfo');
const lastFilterElement = document.getElementById('lastFilter');
const totalQuotesElement = document.getElementById('totalQuotes');
const totalCategoriesElement = document.getElementById('totalCategories');
const lastUpdatedElement = document.getElementById('lastUpdated');

// ============================================
// TASK 2: DYNAMIC CONTENT FILTERING SYSTEM
// ============================================

// STEP 1 & 2: Initialize filtering system
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing Dynamic Quote Generator with Filtering System...");
    
    // Load data from storage
    loadDataFromStorage();
    
    // Load user preferences including last filter
    loadUserPreferences();
    
    // Setup event listeners
    setupEventListeners();
    
    // STEP 2: Populate categories dynamically
    populateCategories();
    
    // STEP 2: Filter quotes based on saved preference
    filterQuotes();
    
    // Update statistics
    updateStats();
    
    console.log("Filtering system initialized successfully!");
});

// STEP 2: Function to populate categories dropdown
function populateCategories() {
    console.log("Populating categories...");
    
    // Clear existing options except the first one
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Get unique categories from quotes
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categories.sort();
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Also update the category tags
    updateCategoryTags();
    
    // Update existing categories select (for adding quotes)
    updateExistingCategoriesSelect();
    
    console.log(`Populated ${categories.length} categories`);
}

// STEP 2: Function to filter quotes based on selected category
function filterQuotes() {
    console.log("Filtering quotes...");
    
    // Get selected category
    const selectedCategory = categoryFilter.value;
    currentCategory = selectedCategory;
    
    // STEP 2: Save filter preference to localStorage
    saveFilterPreference(selectedCategory);
    
    // Update UI to show current filter
    updateFilterUI(selectedCategory);
    
    // Get filtered quotes
    let filteredQuotes = quotes;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Update statistics
    updateFilterStats(filteredQuotes.length);
    
    // Show a random quote from filtered list
    showRandomQuoteFromFiltered(filteredQuotes);
    
    console.log(`Filter applied: ${selectedCategory}, showing ${filteredQuotes.length} quotes`);
}

// STEP 2: Save filter preference to localStorage
function saveFilterPreference(category) {
    userPreferences.lastFilter = category;
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    lastFilterElement.textContent = category === 'all' ? 'All Categories' : category;
}

// STEP 2: Load user preferences including last filter
function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
        try {
            userPreferences = JSON.parse(savedPreferences);
            console.log("Loaded user preferences:", userPreferences);
            
            // Apply last filter
            if (userPreferences.lastFilter) {
                categoryFilter.value = userPreferences.lastFilter;
                currentCategory = userPreferences.lastFilter;
            }
            
            // Apply other preferences
            applyUserPreferences();
            
        } catch (error) {
            console.error("Error parsing user preferences:", error);
        }
    }
}

// Update filter UI
function updateFilterUI(category) {
    // Update filter info text
    const categoryName = category === 'all' ? 'All Categories' : category;
    filterInfo.innerHTML = `
        <i class="fas fa-filter"></i> 
        Showing quotes from: <strong>${categoryName}</strong>
        ${category !== 'all' ? `(${quotes.filter(q => q.category === category).length} quotes)` : ''}
    `;
    
    // Update category tags highlighting
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('filtered');
        if (tag.dataset.category === category) {
            tag.classList.add('filtered');
        }
    });
}

// Update category tags
function updateCategoryTags() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categories.sort();
    categories.unshift('all');
    
    categoriesList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-tag';
        categoryElement.textContent = category === 'all' ? 'All Categories' : category;
        categoryElement.dataset.category = category;
        
        if (category === currentCategory) {
            categoryElement.classList.add('filtered');
        }
        
        // Click handler for category tags
        categoryElement.addEventListener('click', function() {
            categoryFilter.value = category;
            filterQuotes();
        });
        
        categoriesList.appendChild(categoryElement);
    });
}

// Update existing categories select
function updateExistingCategoriesSelect() {
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

// Show random quote from filtered list
function showRandomQuoteFromFiltered(filteredQuotes) {
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `
            <p class="quote-text">No quotes found for this category. Add some!</p>
            <p class="quote-category">Category: <span>${currentCategory === 'all' ? 'All' : currentCategory}</span></p>
            <div class="no-quotes-message">
                <i class="fas fa-exclamation-circle"></i>
                No quotes match the selected filter. Try a different category or add new quotes.
            </div>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.text}"</p>
        <p class="quote-category">Category: <span>${randomQuote.category}</span></p>
        <div class="filter-info" id="filterInfo">
            <i class="fas fa-filter"></i> 
            Showing quotes from: <strong>${currentCategory === 'all' ? 'All Categories' : currentCategory}</strong>
        </div>
    `;
}

// Update filter statistics
function updateFilterStats(filteredCount) {
    const totalCount = quotes.length;
    const filterText = currentCategory === 'all' 
        ? `Showing all ${totalCount} quotes` 
        : `Showing ${filteredCount} of ${totalCount} quotes`;
    
    // Update filter info
    document.querySelector('#filterInfo strong').textContent = 
        currentCategory === 'all' ? 'All Categories' : currentCategory;
}

// ============================================
// EXISTING FUNCTIONALITY (UPDATED FOR TASK 2)
// ============================================

// Load data from storage
function loadDataFromStorage() {
    const savedQuotes = localStorage.getItem('quotes');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedQuotes) {
        try {
            quotes = JSON.parse(savedQuotes);
        } catch (error) {
            console.error("Error parsing quotes:", error);
        }
    }
    
    if (savedFavorites) {
        try {
            favorites = JSON.parse(savedFavorites);
            renderFavorites();
        } catch (error) {
            console.error("Error parsing favorites:", error);
        }
    }
}

// Save data to storage
function saveDataToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    lastUpdatedElement.textContent = new Date().toLocaleTimeString();
}

// Setup event listeners
function setupEventListeners() {
    // Quote display button
    document.getElementById('newQuote').addEventListener('click', function() {
        filterQuotes(); // This will show a random quote from current filter
    });
    
    // Favorite quote button
    document.getElementById('favoriteQuote').addEventListener('click', addToFavorites);
    
    // Clear favorites button
    document.getElementById('clearFavorites').addEventListener('click', clearFavorites);
    
    // STEP 1: Category filter dropdown
    categoryFilter.addEventListener('change', filterQuotes);
    
    // Enter key support
    document.getElementById('newQuoteText').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addQuote();
    });
    
    document.getElementById('newQuoteCategory').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addQuote();
    });
    
    document.getElementById('newCategory').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addNewCategory();
    });
    
    // Add theme toggle
    addThemeToggle();
}

// Add quote function (updated for Task 2)
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    let quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    const selectedCategory = document.getElementById('existingCategories').value;
    
    if (!quoteCategory && selectedCategory) {
        quoteCategory = selectedCategory;
    }
    
    if (!quoteText || !quoteCategory) {
        alert('Please enter both quote text and category');
        return;
    }
    
    const newQuote = {
        text: quoteText,
        category: quoteCategory
    };
    
    quotes.push(newQuote);
    
    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // STEP 3: Update categories if new category added
    if (![...new Set(quotes.map(q => q.category))].includes(quoteCategory)) {
        populateCategories(); // Update dropdown with new category
    }
    
    // Save to storage
    saveDataToStorage();
    
    // Update stats
    updateStats();
    
    // Update current filter display
    filterQuotes();
    
    alert('Quote added successfully!');
}

// Add new category (updated for Task 2)
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
    
    // STEP 3: Update categories dropdown
    populateCategories();
    
    // Select the new category in filter
    categoryFilter.value = newCategory;
    filterQuotes();
    
    alert(`Category "${newCategory}" added successfully!`);
}

// Update statistics
function updateStats() {
    totalQuotesElement.textContent = quotes.length;
    totalCategoriesElement.textContent = new Set(quotes.map(quote => quote.category)).size;
}

// Apply user preferences
function applyUserPreferences() {
    if (userPreferences.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Add theme toggle functionality
function addThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'btn-secondary';
    themeToggle.innerHTML = userPreferences.theme === 'dark' 
        ? '<i class="fas fa-sun"></i> Light Mode' 
        : '<i class="fas fa-moon"></i> Dark Mode';
    
    themeToggle.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-theme');
        userPreferences.theme = isDark ? 'dark' : 'light';
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        
        this.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i> Light Mode' 
            : '<i class="fas fa-moon"></i> Dark Mode';
    });
    
    document.querySelector('.controls').appendChild(themeToggle);
}

// ============================================
// FAVORITES FUNCTIONALITY
// ============================================

function addToFavorites() {
    const quoteTextElement = quoteDisplay.querySelector('.quote-text');
    const quoteCategoryElement = quoteDisplay.querySelector('.quote-category span');
    
    if (!quoteTextElement || quoteTextElement.textContent.includes('No quotes found')) {
        alert('No quote to add to favorites');
        return;
    }
    
    const quoteText = quoteTextElement.textContent.replace(/"/g, '').trim();
    const quoteCategory = quoteCategoryElement.textContent;
    
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
    saveDataToStorage();
    
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
    
    // Filter favorites based on current category if not "all"
    let filteredFavorites = favorites;
    if (currentCategory !== 'all') {
        filteredFavorites = favorites.filter(fav => fav.category === currentCategory);
        
        if (filteredFavorites.length === 0) {
            favoritesList.innerHTML = `
                <p class="no-favorites">
                    No favorites in the "${currentCategory}" category.
                    ${favorites.length > 0 ? `You have ${favorites.length} favorites in other categories.` : ''}
                </p>`;
            return;
        }
    }
    
    filteredFavorites.forEach((favorite, index) => {
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
        saveDataToStorage();
    }
}

// ============================================
// JSON IMPORT/EXPORT
// ============================================

function exportQuotes() {
    if (quotes.length === 0) {
        alert('No quotes to export!');
        return;
    }
    
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `quotes_${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(dataUrl);
    
    alert(`Exported ${quotes.length} quotes to JSON file!`);
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        alert('Please select a JSON file (.json)');
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
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
            
            quotes.push(...validQuotes);
            saveDataToStorage();
            
            // STEP 3: Update categories dropdown with new categories
            populateCategories();
            
            updateStats();
            filterQuotes();
            
            alert(`Successfully imported ${validQuotes.length} quotes!`);
            
            event.target.value = '';
            
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    
    fileReader.readAsText(file);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function clearAllStorage() {
    if (confirm('This will clear ALL saved data. Continue?')) {
        localStorage.clear();
        sessionStorage.clear();
        alert('All storage cleared! Page will reload.');
        location.reload();
    }
}

function showStorageInfo() {
    console.log("=== STORAGE INFORMATION ===");
    console.log("Current Filter:", currentCategory);
    console.log("Quotes in storage:", localStorage.getItem('quotes') ? JSON.parse(localStorage.getItem('quotes')).length : 0);
    console.log("User Preferences:", JSON.parse(localStorage.getItem('userPreferences') || '{}'));
    console.log("===========================");
    
    alert('Storage information logged to console (F12 to view)');
}

// Add storage info button
document.addEventListener('DOMContentLoaded', function() {
    const storageInfoBtn = document.createElement('button');
    storageInfoBtn.id = 'storageInfoBtn';
    storageInfoBtn.className = 'btn-secondary';
    storageInfoBtn.innerHTML = '<i class="fas fa-database"></i> Storage Info';
    storageInfoBtn.style.marginTop = '10px';
    storageInfoBtn.addEventListener('click', showStorageInfo);
    
    document.querySelector('.stats').appendChild(storageInfoBtn);
});