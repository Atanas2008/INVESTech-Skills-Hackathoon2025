// API Configuration
const API_KEY = 'd67057512d7a41409604421a2e3e3411';
const API_BASE_URL = 'https://api.geoapify.com/v1';

// Global Variables
let currentSection = 'home';
let mapInstance = null;
let ecoActions = [];
let locations = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
});

// App Initialization
function initializeApp() {
    // Show home section by default
    showSection('home');
    
    // Add navigation click handlers
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
        });
    });

    // Form handlers
    setupFormHandlers();
    
    // Initialize map when map section is shown
    if (document.getElementById('map-canvas')) {
        initializeMap();
    }
}

// Section Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section, .hero').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show target section
    if (sectionName === 'home') {
        document.querySelector('.hero').classList.remove('hidden');
    } else {
        document.getElementById(sectionName).classList.remove('hidden');
    }
    
    currentSection = sectionName;
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionName}"]`)?.classList.add('active');
    
    // Special handling for map section
    if (sectionName === 'map' && !mapInstance) {
        setTimeout(initializeMap, 100);
    }
}

// Map Functionality
function initializeMap() {
    const mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;
    
    // For demo purposes, we'll create a simple interactive map placeholder
    // In a real implementation, you would integrate with Geoapify Maps API
    mapCanvas.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative; background: #e8f5e8; border-radius: 8px;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: #7bc142; margin-bottom: 1rem;"></i>
                <h3 style="color: #2d5a27; margin-bottom: 0.5rem;">Интерактивна карта на София</h3>
                <p style="color: #666; margin-bottom: 1rem;">Тук ще се показват зелените зони</p>
                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    ${getSampleLocations().map(location => 
                        `<div class="map-marker" onclick="showLocationInfo('${location.id}')" style="
                            background: ${getLocationColor(location.type)};
                            color: white;
                            padding: 0.5rem 1rem;
                            border-radius: 20px;
                            cursor: pointer;
                            margin: 0.2rem;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            ${getLocationIcon(location.type)} ${location.name}
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
    
    mapInstance = true;
}

// Get location color based on type
function getLocationColor(type) {
    const colors = {
        'park': '#2ecc71',
        'trail': '#3498db', 
        'bike': '#f39c12',
        'plant': '#27ae60'
    };
    return colors[type] || '#7bc142';
}

// Get location icon based on type
function getLocationIcon(type) {
    const icons = {
        'park': '🏞️',
        'trail': '🥾',
        'bike': '🚴',
        'plant': '🌱'
    };
    return icons[type] || '📍';
}

// Sample data
function getSampleLocations() {
    return [
        { id: 1, name: 'Борисова градина', type: 'park', description: 'Най-големият парк в София' },
        { id: 2, name: 'Витоша парк', type: 'park', description: 'Красив парк в подножието на Витоша' },
        { id: 3, name: 'Еко пътека Витоша', type: 'trail', description: 'Планинска еко пътека' },
        { id: 4, name: 'Велоалея Дунав', type: 'bike', description: 'Велосипедна алея по р. Дунав' },
        { id: 5, name: 'Зона за засаждане', type: 'plant', description: 'Място за нови дървета' }
    ];
}

// Show location info
function showLocationInfo(locationId) {
    const location = getSampleLocations().find(loc => loc.id == locationId);
    if (location) {
        alert(`📍 ${location.name}\n\n${location.description}\n\nТип: ${getLocationTypeName(location.type)}`);
    }
}

// Get location type name in Bulgarian
function getLocationTypeName(type) {
    const names = {
        'park': 'Парк',
        'trail': 'Еко пътека',
        'bike': 'Велоалея', 
        'plant': 'Място за засаждане'
    };
    return names[type] || 'Неизвестен тип';
}

// Modal Functions
function showAddLocationModal() {
    document.getElementById('addLocationModal').classList.remove('hidden');
}

function showAddActionModal() {
    document.getElementById('addActionModal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Form Handlers
function setupFormHandlers() {
    // Location form
    const locationForm = document.getElementById('locationForm');
    if (locationForm) {
        locationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLocationSubmit(this);
        });
    }
    
    // Action form
    const actionForm = document.getElementById('actionForm');
    if (actionForm) {
        actionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleActionSubmit(this);
        });
    }
}

// Handle location form submission
function handleLocationSubmit(form) {
    const formData = new FormData(form);
    const locationData = {
        name: formData.get('name') || form.querySelector('input[type="text"]').value,
        description: formData.get('description') || form.querySelector('textarea').value,
        type: formData.get('type') || form.querySelector('select').value,
        timestamp: new Date().toISOString()
    };
    
    // In a real app, you would send this to your backend
    console.log('New location:', locationData);
    
    // Show success message
    showNotification('Локацията е добавена успешно! 🌱', 'success');
    
    // Close modal and reset form
    closeModal('addLocationModal');
    form.reset();
    
    // Refresh map
    if (currentSection === 'map') {
        initializeMap();
    }
}

// Handle action form submission  
function handleActionSubmit(form) {
    const formData = new FormData(form);
    const actionData = {
        title: formData.get('title') || form.querySelector('input[type="text"]').value,
        description: formData.get('description') || form.querySelector('textarea').value,
        type: formData.get('type') || form.querySelector('select').value,
        location: formData.get('location') || form.querySelectorAll('input[type="text"]')[1].value,
        image: formData.get('image') || form.querySelector('input[type="file"]').files[0],
        timestamp: new Date().toISOString(),
        points: calculatePoints(formData.get('type') || form.querySelector('select').value)
    };
    
    // In a real app, you would send this to your backend
    console.log('New eco action:', actionData);
    
    // Add to feed
    addActionToFeed(actionData);
    
    // Show success message
    showNotification(`Еко действието е добавено! Получихте ${actionData.points} точки! 🎉`, 'success');
    
    // Close modal and reset form
    closeModal('addActionModal');
    form.reset();
}

// Calculate points based on action type
function calculatePoints(actionType) {
    const pointsMap = {
        'tree': 15,
        'clean': 10,
        'bike': 5,
        'recycle': 8
    };
    return pointsMap[actionType] || 5;
}

// Add action to feed
function addActionToFeed(actionData) {
    const feedContainer = document.querySelector('.feed-container');
    if (!feedContainer) return;
    
    const actionElement = createActionElement(actionData);
    feedContainer.insertBefore(actionElement, feedContainer.firstChild);
}

// Create action element
function createActionElement(actionData) {
    const actionDiv = document.createElement('div');
    actionDiv.className = 'eco-post';
    
    const actionTypeNames = {
        'tree': 'Засаждане на дърво',
        'clean': 'Почистване', 
        'bike': 'Каране на колело',
        'recycle': 'Рециклиране'
    };
    
    actionDiv.innerHTML = `
        <div class="post-header">
            <img src="https://via.placeholder.com/40" alt="user" class="user-avatar">
            <div class="post-info">
                <h4>Вие</h4>
                <span class="post-date">току-що</span>
            </div>
            <div class="post-points">+${actionData.points} точки</div>
        </div>
        <div class="post-content">
            <img src="https://via.placeholder.com/400x300" alt="eco action" class="post-image">
            <h3>${actionData.title}</h3>
            <p>${actionData.description}</p>
            <div class="post-location">
                <i class="fas fa-map-marker-alt"></i> ${actionData.location}
            </div>
        </div>
        <div class="post-actions">
            <button class="btn-like"><i class="fas fa-heart"></i> 0</button>
            <button class="btn-comment"><i class="fas fa-comment"></i> 0</button>
        </div>
    `;
    
    return actionDiv;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : '#3498db'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Load sample data
function loadSampleData() {
    // This would typically come from your backend API
    ecoActions = [
        {
            id: 1,
            title: 'Засадих 3 дървета в Борисовата градина',
            description: 'Участвах в еко акция за засаджане на дървета. Всеки може да помогне!',
            type: 'tree',
            location: 'Борисова градина, София',
            user: 'Мария Петрова',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            points: 15,
            likes: 15,
            comments: 3
        }
    ];
    
    locations = getSampleLocations();
}

// API Integration Functions (for future use)
async function fetchLocationsFromAPI() {
    try {
        // Example API call to get routes/locations
        const requestOptions = {
            method: 'GET',
        };
        
        const response = await fetch(`${API_BASE_URL}/routing?waypoints=42.6977,23.3219&mode=walk&apiKey=${API_KEY}`, requestOptions);
        const result = await response.json();
        console.log('API Response:', result);
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Geolocation Functions
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                console.log('Current location:', latitude, longitude);
                // Use coordinates for map centering or location-based features
            },
            error => {
                console.error('Geolocation error:', error);
                showNotification('Не можем да определим вашата локация', 'error');
            }
        );
    } else {
        showNotification('Вашият браузър не поддържа геолокация', 'error');
    }
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'преди по-малко от час';
    if (diffHours < 24) return `преди ${diffHours} часа`;
    if (diffHours < 48) return 'вчера';
    return date.toLocaleDateString('bg-BG');
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden');
    }
});

// Mobile menu toggle (for future mobile optimization)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Search functionality (for future implementation)
function searchLocations(query) {
    const filteredLocations = locations.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.description.toLowerCase().includes(query.toLowerCase())
    );
    return filteredLocations;
}

// Filter functions for map
function filterLocationsByType(type) {
    const checkboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    // Implementation for filtering map markers
    console.log(`Filtering by type: ${type}`);
}

// Export functions for global access
window.showSection = showSection;
window.showAddLocationModal = showAddLocationModal;
window.showAddActionModal = showAddActionModal;
window.closeModal = closeModal;
window.showLocationInfo = showLocationInfo;