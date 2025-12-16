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

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const categoriesList = document.getElementById('categoriesList');
const favoritesList = document.getElementById('favoritesList');
const existingCategories = document.getElementById('existingCategories');
const totalQuotesElement = document.getElementById('totalQuotes');
const totalCategoriesElement = document.getElementById('totalCategories');
const lastUpdatedElement = document.getElementById('lastUpdated');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    setupEventListeners();
    initializeCategories();
    showRandomQuote();
    updateStats();
    populateCategorySelect();
});

// Load data from local storage
function loadDataFromStorage() {
    const savedQuotes = localStorage.getItem('quotes');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedQuotes) {
        quotes = JSON.parse(savedQuotes);
    }
    
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
        renderFavorites();
    }
}

// Save data to local storage
function saveDataToStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    lastUpdatedElement.textContent = new Date().toLocaleTimeString();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('favoriteQuote').addEventListener('click', addToFavorites);
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
}

// Initialize categories from quotes
function initializeCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categories.sort();
    
    // Add "All" category
    categories.unshift('all');
    
    renderCategories(categories);
}

// Render categories list
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

// Set category filter
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

// Show random quote - This is showRandomQuote() function
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
}

// Add new quote - This is createAddQuoteForm functionality
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
    
    // Update categories if new
    updateCategories();
    
    // Update stats
    updateStats();
    
    // Save to storage
    saveDataToStorage();
    
    // Show success message
    alert('Quote added successfully!');
}

// Add new category
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

// Update categories list
function updateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categories.sort();
    categories.unshift('all');
    renderCategories(categories);
}

// Populate category select dropdown
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

// Add current quote to favorites
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
    saveDataToStorage();
    
    // Update button text temporarily
    const favoriteBtn = document.getElementById('favoriteQuote');
    const originalHTML = favoriteBtn.innerHTML;
    favoriteBtn.innerHTML = '<i class="fas fa-star"></i> Added!';
    setTimeout(() => {
        favoriteBtn.innerHTML = originalHTML;
    }, 2000);
}

// Render favorites list
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
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        favoritesList.appendChild(favoriteElement);
    });
}

// Remove from favorites
function removeFavorite(index) {
    favorites.splice(index, 1);
    renderFavorites();
    saveDataToStorage();
}

// Clear all favorites
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

// Update statistics
function updateStats() {
    totalQuotesElement.textContent = quotes.length;
    totalCategoriesElement.textContent = new Set(quotes.map(quote => quote.category)).size;
    
    if (localStorage.getItem('quotes')) {
        lastUpdatedElement.textContent = 'Just now';
    }
}

// Export quotes as JSON
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'quotes.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import quotes from JSON
function importQuotes(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes.push(...importedQuotes);
                updateCategories();
                populateCategorySelect();
                updateStats();
                saveDataToStorage();
                alert(`Successfully imported ${importedQuotes.length} quotes!`);
            } else {
                throw new Error('Invalid format');
            }
        } catch (error) {
            alert('Error importing quotes. Please check the file format.');
        }
    };
    reader