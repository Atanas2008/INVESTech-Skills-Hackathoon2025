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
    console.log('DOM loaded, initializing app...');
    console.log('Leaflet available:', typeof L !== 'undefined');
    
    initializeApp();
    loadSampleData();
});

// App Initialization
function initializeApp() {
    // Show home section by default
    showSection('home');
    
    // Form handlers
    setupFormHandlers();
    
    console.log('App initialized successfully');
}

// Section Navigation
function showSection(sectionName) {
    console.log('=== showSection called ===');
    console.log('Target section:', sectionName);
    console.log('Current section:', currentSection);
    
    try {
        // Hide all sections first
        const allSections = document.querySelectorAll('.section, .hero');
        console.log('Found sections:', allSections.length);
        
        allSections.forEach((section, index) => {
            console.log(`Section ${index}: ${section.id || section.className}`);
            section.classList.add('hidden');
        });
        
        // Show target section
        if (sectionName === 'home') {
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.classList.remove('hidden');
                console.log('✅ Home section shown');
            } else {
                console.error('❌ Hero section not found');
            }
        } else {
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                console.log(`✅ Section ${sectionName} shown`);
            } else {
                console.error(`❌ Section ${sectionName} not found`);
            }
        }
        
        currentSection = sectionName;
        console.log('Current section updated to:', currentSection);
        
        // Update navigation active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Initialize specific sections
        if (sectionName === 'map') {
            setTimeout(loadMapWithRedesign, 100);
        } else if (sectionName === 'builder') {
            setTimeout(() => {
                // Always start fresh - clear any saved data
                clearCityData();
                initializeCityBuilder();
                
                // Don't auto-save anymore - keep everything temporary
                console.log('City builder initialized with fresh data');
            }, 100);
        }
        
        // Show success notification (except for home)
        if (sectionName !== 'home') {
            const sectionNames = {
                'map': 'Карта', 
                'feed': 'Еко действия',
                'profile': 'Профил',
                'builder': 'Градостроител'
            };
            
            if (sectionNames[sectionName]) {
                setTimeout(() => {
                    showNotification(`Отворена секция: ${sectionNames[sectionName]} 📱`, 'info');
                }, 100);
            }
        }
        
        console.log('=== showSection completed ===');
        
    } catch (error) {
        console.error('❌ Error in showSection:', error);
    }
}

// Map variables
let map = null;
let drawnItems = null;
let drawControl = null;
let currentRedesignTool = 'select';
let sofiaData = null;

const SOFIA_CENTER = [42.6977, 23.3219]; // Sofia center coordinates

// Load Sofia data and boundaries
async function loadSofiaData() {
    try {
        const response = await fetch('/sofia_data.json');
        sofiaData = await response.json();
        
        // Store original data for restoration
        originalSofiaData = JSON.parse(JSON.stringify(sofiaData));
        
        console.log('Sofia data loaded:', sofiaData);
        return sofiaData;
    } catch (error) {
        console.error('Error loading Sofia data:', error);
        return null;
    }
}

// Manual map loading function
function loadMap() {
    console.log('Manual map loading triggered');
    const mapCanvas = document.getElementById('map-canvas');
    const placeholder = document.getElementById('map-placeholder');
    
    if (placeholder) {
        placeholder.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #7bc142; margin-bottom: 1rem;"></i>
            <p>Зареждам картата...</p>
        `;
    }
    
    // Force map initialization
    setTimeout(() => {
        initializeMap();
    }, 500);
}

// Map Functionality - Simplified and Working Version
function initializeMap() {
    const mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) {
        console.error('Map canvas not found');
        return;
    }
    
    console.log('Initializing map...');
    
    // Create map container
    mapCanvas.innerHTML = `
        <div id="geoapify-map" style="width: 100%; height: 100%; border-radius: 8px; position: relative;">
            <div id="map-loading" style="
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%); 
                text-align: center;
                z-index: 1000;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            ">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #7bc142; margin-bottom: 1rem;"></i>
                <p>Зареждам картата...</p>
            </div>
        </div>
    `;
    
    // Try to initialize Leaflet map after a short delay
    setTimeout(() => {
        initLeafletMap();
    }, 1000);
    
    mapInstance = true;
}

// Initialize Leaflet Map with better error handling
function initLeafletMap() {
    const mapContainer = document.getElementById('geoapify-map');
    const loadingElement = document.getElementById('map-loading');
    
    console.log('Attempting to create Leaflet map...');
    console.log('Leaflet available:', typeof L !== 'undefined');
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        showFallbackMap();
        return;
    }
    
    try {
        // Remove loading indicator
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Sofia coordinates
        const sofiaLat = 42.6977;
        const sofiaLng = 23.3219;
        
        console.log('Creating map with coordinates:', sofiaLat, sofiaLng);
        
        // Create map with more explicit options
        const map = L.map('geoapify-map', {
            center: [sofiaLat, sofiaLng],
            zoom: 12,
            zoomControl: true,
            attributionControl: true
        });
        
        console.log('Map created, adding Geoapify tile layer...');
        
        // Add Geoapify tile layer (using your API key)
        const tileLayer = L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${API_KEY}`, {
            attribution: '© Geoapify | © OpenStreetMap contributors',
            maxZoom: 18
        });
        
        tileLayer.addTo(map);
        
        // Event handlers for tile layer
        tileLayer.on('loading', () => {
            console.log('Geoapify tiles loading...');
        });
        
        tileLayer.on('load', () => {
            console.log('Geoapify tiles loaded successfully!');
        });
        
        tileLayer.on('tileerror', (e) => {
            console.error('Geoapify tile error:', e);
        });
        
        // Add Geoapify address search control (if available)
        if (typeof L.Control !== 'undefined' && L.Control.GeoapifyAddressSearch) {
            try {
                const addressSearchControl = L.control.addressSearch(API_KEY, {
                    position: 'topleft',
                    resultCallback: (address) => {
                        console.log('Address found:', address);
                    },
                    suggestionsCallback: (suggestions) => {
                        console.log('Address suggestions:', suggestions);
                    }
                });
                map.addControl(addressSearchControl);
                console.log('Geoapify address search added');
            } catch (e) {
                console.log('Address search not available:', e.message);
            }
        }
        
        // Add markers after a short delay to ensure map is ready
        setTimeout(() => {
            addMarkersToMap(map);
            addCurrentLocationButton(map);
        }, 100);
        
        // Store map reference globally
        window.leafletMap = map;
        
        console.log('Geoapify map initialized successfully!');
        
        // Show success notification after map renders
        setTimeout(() => {
            showNotification('Geoapify картата е заредена успешно! 🗺️', 'success');
        }, 1500);
        
        // Event listener for map ready
        map.whenReady(() => {
            console.log('Geoapify map is ready and rendered');
        });
        
    } catch (error) {
        console.error('Error creating Leaflet map:', error);
        showFallbackMap();
    }
}

// Show fallback map when Leaflet fails
function showFallbackMap() {
    console.log('Showing fallback map');
    
    const mapContainer = document.getElementById('geoapify-map');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = `
        <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, #e8f5e8 0%, #d4f1d4 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border: 2px dashed #7bc142;
        ">
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: #7bc142; margin-bottom: 1rem;"></i>
                <h3 style="color: #2d5a27; margin-bottom: 1rem;">Карта на зелените зони в София</h3>
                <p style="color: #666; margin-bottom: 2rem; max-width: 400px;">
                    Интерактивна карта за демонстрация. Кликнете върху локациите за повече информация.
                </p>
                <div style="
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 1rem; 
                    max-width: 600px;
                    margin: 0 auto;
                ">
                    ${getSampleLocations().map(location => `
                        <div 
                            class="fallback-location" 
                            onclick="showLocationInfo('${location.id}')" 
                            style="
                                background: ${getLocationColor(location.type)};
                                color: white;
                                padding: 1rem;
                                border-radius: 10px;
                                cursor: pointer;
                                transition: all 0.3s;
                                text-align: left;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                            "
                            onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.2)'"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.1)'"
                        >
                            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">
                                ${getLocationIcon(location.type)}
                            </div>
                            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">
                                ${location.name}
                            </h4>
                            <p style="margin: 0; font-size: 0.8rem; opacity: 0.9;">
                                ${getLocationTypeName(location.type)}
                            </p>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 2rem;">
                    <button 
                        onclick="location.reload()" 
                        style="
                            background: #7bc142; 
                            color: white; 
                            border: none; 
                            padding: 10px 20px; 
                            border-radius: 5px; 
                            cursor: pointer;
                            font-size: 1rem;
                        "
                    >
                        🔄 Презареди картата
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showNotification('Картата е в демо режим 🗺️', 'info');
}

// Add markers to map
function addMarkersToMap(map) {
    const locations = getSampleLocations();
    locations.forEach(location => {
        // Use real Sofia coordinates for demo locations
        const coords = getSofiaLocationCoords(location.id);
        
        // Create custom icon based on location type
        const iconColor = getLocationColor(location.type);
        const iconHtml = `
            <div style="
                background: ${iconColor};
                color: white;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">
                ${getLocationIcon(location.type)}
            </div>
        `;
        
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Add marker
        const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
        
        // Add popup
        marker.bindPopup(`
            <div style="min-width: 200px;">
                <h4 style="color: #2d5a27; margin-bottom: 8px;">
                    ${getLocationIcon(location.type)} ${location.name}
                </h4>
                <p style="margin-bottom: 8px; color: #666;">${location.description}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                    <strong>Тип:</strong> ${getLocationTypeName(location.type)}
                </p>
                <button onclick="visitLocation('${location.id}')" style="
                    background: #7bc142;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    margin-top: 8px;
                    cursor: pointer;
                ">Посети</button>
            </div>
        `);
        
        // Add click event
        marker.on('click', () => {
            showLocationInfo(location.id);
        });
    });
}

// Add current location button to map
function addCurrentLocationButton(map) {
    const currentLocationControl = L.control({ position: 'topleft' });
    currentLocationControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'current-location-control');
        div.innerHTML = `
            <button onclick="getCurrentLocationOnMap()" style="
                background: white;
                border: 2px solid #ccc;
                border-radius: 4px;
                padding: 8px;
                cursor: pointer;
                font-size: 16px;
            " title="Моята локация">
                📍
            </button>
        `;
        return div;
    };
    currentLocationControl.addTo(map);
}

// Get sample coordinates for Sofia locations
function getSofiaLocationCoords(locationId) {
    const coords = {
        1: { lat: 42.6755, lng: 23.3348 }, // Борисова градина
        2: { lat: 42.6447, lng: 23.2750 }, // Витоша парк  
        3: { lat: 42.5569, lng: 23.2892 }, // Еко пътека Витоша
        4: { lat: 42.6892, lng: 23.3517 }, // Велоалея Дунав
        5: { lat: 42.6977, lng: 23.3219 }  // Зона за засаждане
    };
    return coords[locationId] || { lat: 42.6977, lng: 23.3219 };
}

// Get current location on map
function getCurrentLocationOnMap() {
    if (navigator.geolocation && window.leafletMap) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                
                // Add current location marker
                const currentLocationIcon = L.divIcon({
                    html: `
                        <div style="
                            background: #e74c3c;
                            color: white;
                            border-radius: 50%;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 3px solid white;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                            animation: pulse 2s infinite;
                        ">
                            📍
                        </div>
                        <style>
                            @keyframes pulse {
                                0% { transform: scale(1); }
                                50% { transform: scale(1.2); }
                                100% { transform: scale(1); }
                            }
                        </style>
                    `,
                    className: 'current-location-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                
                L.marker([latitude, longitude], { icon: currentLocationIcon })
                    .addTo(window.leafletMap)
                    .bindPopup('Вашата текуща локация')
                    .openPopup();
                
                // Center map on current location
                window.leafletMap.setView([latitude, longitude], 15);
                
                showNotification('Локацията ви е показана на картата! 📍', 'success');
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

// Visit location function
function visitLocation(locationId) {
    showNotification('Благодарим за посещението! Получихте 5 точки! 🎉', 'success');
    console.log(`Visiting location ${locationId}`);
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

// API Integration Functions
async function fetchLocationsFromAPI() {
    try {
        // Get locations from our Flask API
        const response = await fetch('/api/locations');
        const locations = await response.json();
        console.log('Locations from API:', locations);
        return locations;
    } catch (error) {
        console.error('API Error:', error);
        return getSampleLocations(); // Fallback to sample data
    }
}

// Geoapify routing API integration
async function getRouteTo(destinationLat, destinationLng) {
    if (!navigator.geolocation) {
        showNotification('Вашият браузър не поддържа геолокация', 'error');
        return null;
    }
    
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            async position => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const requestOptions = {
                        method: 'GET',
                    };
                    
                    const url = `https://api.geoapify.com/v1/routing?waypoints=${latitude},${longitude}|${destinationLat},${destinationLng}&mode=walk&apiKey=${API_KEY}`;
                    
                    const response = await fetch(url, requestOptions);
                    const result = await response.json();
                    
                    if (result.features && result.features.length > 0) {
                        const route = result.features[0];
                        const distance = (route.properties.distance / 1000).toFixed(2); // km
                        const time = Math.round(route.properties.time / 60); // minutes
                        
                        showNotification(`Разстояние: ${distance} км, Време: ${time} мин пеша 🚶‍♂️`, 'info');
                        
                        // Draw route on map if available
                        if (window.leafletMap && route.geometry) {
                            const coordinates = route.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                            L.polyline(coordinates, {
                                color: '#7bc142',
                                weight: 4,
                                opacity: 0.8
                            }).addTo(window.leafletMap);
                        }
                        
                        resolve(result);
                    } else {
                        showNotification('Не може да се намери маршрут', 'error');
                        resolve(null);
                    }
                } catch (error) {
                    console.error('Routing API Error:', error);
                    showNotification('Грешка при изчисляване на маршрута', 'error');
                    reject(error);
                }
            },
            error => {
                console.error('Geolocation error:', error);
                showNotification('Не можем да определим вашата локация', 'error');
                reject(error);
            }
        );
    });
}

// Enhanced visit location function with routing
async function visitLocation(locationId) {
    const location = getSampleLocations().find(loc => loc.id == locationId);
    if (!location) return;
    
    const coords = getSofiaLocationCoords(locationId);
    
    // Show route to location
    showNotification('Изчислявам маршрут до локацията...', 'info');
    
    try {
        await getRouteTo(coords.lat, coords.lng);
        showNotification('Благодарим за интереса! Получихте 5 точки! 🎉', 'success');
    } catch (error) {
        showNotification('Получихте 5 точки за интереса! 🎉', 'success');
    }
    
    console.log(`Visiting location ${locationId}:`, location.name);
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
    
    if (!window.leafletMap) {
        console.log('Map not initialized yet');
        return;
    }
    
    // Get checked types
    const activeTypes = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const label = checkbox.parentElement.textContent.trim();
            const typeMap = {
                'Паркове': 'park',
                'Еко пътеки': 'trail', 
                'Велоалеи': 'bike',
                'Места за засаждане': 'plant'
            };
            if (typeMap[label]) {
                activeTypes.push(typeMap[label]);
            }
        }
    });
    
    // Clear existing markers
    window.leafletMap.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            window.leafletMap.removeLayer(layer);
        }
    });
    
    // Add filtered markers
    const locations = getSampleLocations();
    locations.forEach(location => {
        if (activeTypes.includes(location.type)) {
            const coords = getSofiaLocationCoords(location.id);
            
            const iconColor = getLocationColor(location.type);
            const iconHtml = `
                <div style="
                    background: ${iconColor};
                    color: white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    border: 3px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">
                    ${getLocationIcon(location.type)}
                </div>
            `;
            
            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(window.leafletMap);
            
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <h4 style="color: #2d5a27; margin-bottom: 8px;">
                        ${getLocationIcon(location.type)} ${location.name}
                    </h4>
                    <p style="margin-bottom: 8px; color: #666;">${location.description}</p>
                    <p style="margin: 0; font-size: 12px; color: #999;">
                        <strong>Тип:</strong> ${getLocationTypeName(location.type)}
                    </p>
                    <button onclick="visitLocation('${location.id}')" style="
                        background: #7bc142;
                        color: white;
                        border: none;
                        padding: 5px 10px;
                        border-radius: 3px;
                        margin-top: 8px;
                        cursor: pointer;
                    ">Посети</button>
                </div>
            `);
            
            marker.on('click', () => {
                showLocationInfo(location.id);
            });
        }
    });
    
    console.log(`Filtering by types: ${activeTypes.join(', ')}`);
}

// City Builder Variables
let cityData = {
    population: 5000,
    ecoScore: 75,
    budget: 25000,
    happiness: 80,
    grid: {} // stores building types for each cell
};

let selectedTool = null;
let buildingCosts = {
    park: 500,
    forest: 800,
    garden: 300,
    residential: 1200,
    commercial: 1500,
    industrial: 2000,
    road: 100,
    'bike-path': 200,
    solar: 1000
};

// City Builder Functions
function initializeCityBuilder() {
    console.log('Initializing City Builder...');
    createCityGrid();
    updateCityStats();
    
    // Add some initial buildings for demo
    const initialBuildings = [
        {x: 5, y: 5, type: 'park'},
        {x: 10, y: 8, type: 'residential'},
        {x: 15, y: 10, type: 'commercial'},
        {x: 8, y: 12, type: 'garden'}
    ];
    
    initialBuildings.forEach(building => {
        const cellId = `${building.x}-${building.y}`;
        cityData.grid[cellId] = building.type;
        updateGridCell(building.x, building.y, building.type);
    });
}

function createCityGrid() {
    const gridContainer = document.getElementById('city-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // Create 20x15 grid (300 cells total)
    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 20; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `cell-${x}-${y}`;
            cell.setAttribute('data-x', x);
            cell.setAttribute('data-y', y);
            
            cell.addEventListener('click', () => handleCellClick(x, y));
            cell.addEventListener('mouseenter', () => handleCellHover(x, y));
            
            gridContainer.appendChild(cell);
        }
    }
    
    console.log('City grid created: 20x15 = 300 cells');
}

function selectTool(toolType) {
    // Remove previous selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select new tool
    const toolBtn = document.querySelector(`[data-tool="${toolType}"]`);
    if (toolBtn) {
        toolBtn.classList.add('selected');
        selectedTool = toolType;
        
        document.getElementById('current-tool').textContent = getToolDisplayName(toolType);
        
        // Update cursor for grid
        const grid = document.getElementById('city-grid');
        if (grid) {
            grid.style.cursor = toolType === 'demolish' ? 'not-allowed' : 
                               toolType === 'info' ? 'help' : 'pointer';
        }
        
        console.log('Selected tool:', toolType);
    }
}

function getToolDisplayName(toolType) {
    const names = {
        park: 'Парк 🌳',
        forest: 'Гора 🌲',
        garden: 'Градина 🌸',
        residential: 'Жилищна сграда 🏠',
        commercial: 'Търговска сграда 🏢',
        industrial: 'Индустриална сграда 🏭',
        road: 'Път 🛣️',
        'bike-path': 'Велоалея 🚴',
        solar: 'Соларни панели ☀️',
        demolish: 'Съборяване 🗑️',
        info: 'Информация ℹ️'
    };
    return names[toolType] || toolType;
}

function handleCellClick(x, y) {
    if (!selectedTool) {
        showNotification('Първо изберете инструмент!', 'info');
        return;
    }
    
    const cellId = `${x}-${y}`;
    const currentBuilding = cityData.grid[cellId];
    
    if (selectedTool === 'info') {
        showCellInfo(x, y, currentBuilding);
        return;
    }
    
    if (selectedTool === 'demolish') {
        if (currentBuilding) {
            demolishBuilding(x, y, currentBuilding);
        } else {
            showNotification('Няма нищо за съборяване тук!', 'info');
        }
        return;
    }
    
    // Check if cell is already occupied
    if (currentBuilding) {
        showNotification('Тук вече има сграда! Първо я съборете.', 'error');
        return;
    }
    
    // Check budget
    const cost = buildingCosts[selectedTool] || 0;
    if (cityData.budget < cost) {
        showNotification('Недостатъчно средства!', 'error');
        return;
    }
    
    // Build the structure
    buildStructure(x, y, selectedTool, cost);
}

function buildStructure(x, y, type, cost) {
    const cellId = `${x}-${y}`;
    
    // Update city data
    cityData.grid[cellId] = type;
    cityData.budget -= cost;
    
    // Update grid visual
    updateGridCell(x, y, type);
    
    // Update stats based on building type
    updateStatsAfterBuilding(type);
    
    // Update display
    updateCityStats();
    
    showNotification(`${getToolDisplayName(type)} построен за ${cost} лв!`, 'success');
    console.log(`Built ${type} at (${x}, ${y}) for ${cost}`);
}

function demolishBuilding(x, y, type) {
    const cellId = `${x}-${y}`;
    
    // Remove from city data
    delete cityData.grid[cellId];
    
    // Update grid visual
    updateGridCell(x, y, null);
    
    // Get some money back (50% of original cost)
    const refund = Math.floor((buildingCosts[type] || 0) * 0.5);
    cityData.budget += refund;
    
    // Update stats
    updateStatsAfterDemolish(type);
    updateCityStats();
    
    showNotification(`${getToolDisplayName(type)} съборен! Възстановени ${refund} лв.`, 'info');
    console.log(`Demolished ${type} at (${x}, ${y}), refund: ${refund}`);
}

function updateGridCell(x, y, type) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (!cell) return;
    
    // Remove all building classes
    cell.className = 'grid-cell';
    
    // Add new type class if building exists
    if (type) {
        cell.classList.add(type);
    }
}

function updateStatsAfterBuilding(type) {
    switch (type) {
        case 'park':
        case 'forest':
        case 'garden':
            cityData.ecoScore += 2;
            cityData.happiness += 1;
            break;
        case 'residential':
            cityData.population += 50;
            cityData.happiness += 1;
            break;
        case 'commercial':
            cityData.budget += 200; // Monthly income
            break;
        case 'industrial':
            cityData.budget += 300;
            cityData.ecoScore -= 1;
            cityData.happiness -= 1;
            break;
        case 'bike-path':
            cityData.ecoScore += 1;
            cityData.happiness += 1;
            break;
        case 'solar':
            cityData.ecoScore += 3;
            break;
    }
    
    // Keep values in reasonable ranges
    cityData.ecoScore = Math.max(0, Math.min(100, cityData.ecoScore));
    cityData.happiness = Math.max(0, Math.min(100, cityData.happiness));
}

function updateStatsAfterDemolish(type) {
    switch (type) {
        case 'park':
        case 'forest':
        case 'garden':
            cityData.ecoScore -= 2;
            cityData.happiness -= 1;
            break;
        case 'residential':
            cityData.population -= 50;
            cityData.happiness -= 1;
            break;
        case 'industrial':
            cityData.ecoScore += 1;
            cityData.happiness += 1;
            break;
        case 'bike-path':
            cityData.ecoScore -= 1;
            cityData.happiness -= 1;
            break;
        case 'solar':
            cityData.ecoScore -= 3;
            break;
    }
    
    cityData.ecoScore = Math.max(0, Math.min(100, cityData.ecoScore));
    cityData.happiness = Math.max(0, Math.min(100, cityData.happiness));
    cityData.population = Math.max(0, cityData.population);
}

function updateCityStats() {
    document.getElementById('population').textContent = cityData.population;
    document.getElementById('eco-score').textContent = cityData.ecoScore;
    document.getElementById('budget').textContent = cityData.budget;
    document.getElementById('happiness').textContent = cityData.happiness;
}

function showCellInfo(x, y, buildingType) {
    if (buildingType) {
        const cost = buildingCosts[buildingType] || 0;
        showNotification(`${getToolDisplayName(buildingType)} на позиция (${x}, ${y}). Цена: ${cost} лв.`, 'info');
    } else {
        showNotification(`Празно място на позиция (${x}, ${y}). Готово за строене!`, 'info');
    }
}

function handleCellHover(x, y) {
    // Optional: Show preview or highlight neighboring cells
}

// Auto-save city progress (DISABLED - now temporary)
function saveCityProgress() {
    // No longer save to localStorage - keep everything temporary
    console.log('City progress not saved - session is temporary');
}

function loadCityProgress() {
    // Always return false to start fresh
    console.log('Starting with fresh city - no saved progress loaded');
    return false;
}

// Clear city data on page load
function clearCityData() {
    cityData = {
        population: 5000,
        ecoScore: 75,
        budget: 25000,
        happiness: 80,
        grid: {} // Reset grid to empty
    };
    localStorage.removeItem('cityBuilderData'); // Clear any saved data
    console.log('City data cleared - starting fresh');
}

// Export functions for global access
window.showSection = showSection;
window.showAddLocationModal = showAddLocationModal;
window.showAddActionModal = showAddActionModal;
window.closeModal = closeModal;
window.showLocationInfo = showLocationInfo;
window.visitLocation = visitLocation;
window.filterLocationsByType = filterLocationsByType;
window.getCurrentLocationOnMap = getCurrentLocationOnMap;
window.loadMap = loadMap;
window.selectTool = selectTool;
window.initializeCityBuilder = initializeCityBuilder;

// Sofia Redesign Map Functions
function setRedesignTool(toolType) {
    console.log('Setting redesign tool:', toolType);
    
    // Update active tool
    currentRedesignTool = toolType;
    
    // Update UI
    document.querySelectorAll('.redesign-tool').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${toolType}-tool`).classList.add('active');
    
    // Update tool info
    const toolNames = {
        'select': 'Селектиране област',
        'park': 'Парк 🌳',
        'alley': 'Алея/Улица 🛣️', 
        'greenzone': 'Зелена зона 🌿',
        'bikelane': 'Велоалея 🚴'
    };
    
    document.getElementById('current-redesign-tool').textContent = 
        `Избран инструмент: ${toolNames[toolType]}`;
    
    // Update drawing controls if map is loaded
    if (map && drawControl) {
        setupDrawingControls();
    }
}

function getDrawOptions() {
    const baseOptions = {
        polyline: false,
        polygon: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false
    };
    
    switch (currentRedesignTool) {
        case 'park':
        case 'greenzone':
            return {
                ...baseOptions,
                polygon: {
                    shapeOptions: {
                        color: '#4CAF50',
                        fillColor: '#4CAF50',
                        fillOpacity: 0.6
                    }
                }
            };
        case 'alley':
        case 'bikelane':
            return {
                ...baseOptions,
                polyline: {
                    shapeOptions: {
                        color: currentRedesignTool === 'bikelane' ? '#FF9800' : '#2196F3',
                        weight: 6,
                        opacity: 0.8
                    }
                }
            };
        default:
            return {
                ...baseOptions,
                rectangle: {
                    shapeOptions: {
                        color: '#9E9E9E',
                        fillColor: '#9E9E9E',
                        fillOpacity: 0.3
                    }
                }
            };
    }
}

function onAreaDrawn(e) {
    const layer = e.layer;
    const type = e.layerType;
    
    console.log('Area drawn:', type, 'Tool:', currentRedesignTool);
    
    // Add the layer to the map
    drawnItems.addLayer(layer);
    
    // Style the layer based on tool type
    styleRedesignLayer(layer, currentRedesignTool);
    
    // Add popup with redesign info
    addRedesignPopup(layer, currentRedesignTool);
    
    // If this is a park, calculate area and update Sofia stats
    if (currentRedesignTool === 'park') {
        const parkAreaKm2 = calculateLayerAreaKm2(layer);
        if (parkAreaKm2 > 0) {
            console.log(`New park area: ${parkAreaKm2.toFixed(6)} km² (${(parkAreaKm2 * 100).toFixed(2)} hectares)`);
            updateSofiaStatsWithNewPark(parkAreaKm2);
        }
    } else {
        // Don't save to backend - keep only in memory for this session
        showNotification(`${getToolDisplayName(currentRedesignTool)} добавен! (временно за тази сесия)`, 'success');
    }
}

function onAreaEdited(e) {
    console.log('Areas edited - changes are temporary for this session');
    showNotification('Промените са направени временно за тази сесия', 'info');
}

function onAreaDeleted(e) {
    console.log('Areas deleted - changes are temporary for this session');
    showNotification('Обектите са изтрити временно за тази сесия', 'info');
}

function isWithinSofiaBounds(layer) {
    // Allow drawing anywhere on the map
    return true;
}

// Add existing parks and green zones to the map
function addExistingGreenZones() {
    if (!sofiaData || !sofiaData.green_data || !sofiaData.green_data.major_parks) {
        console.log('No Sofia data available for green zones');
        return;
    }
    
    console.log('Adding existing green zones to map...');
    
    sofiaData.green_data.major_parks.forEach(park => {
        const marker = L.circleMarker([park.coordinates[0], park.coordinates[1]], {
            radius: Math.sqrt(park.area_hectares) / 3, // Size based on area
            fillColor: '#4CAF50',
            color: '#2E7D32',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
        }).addTo(map);
        
        marker.bindPopup(`
            <div style="text-align: center;">
                <h4>🌳 ${park.name}</h4>
                <p><strong>Площ:</strong> ${park.area_hectares} хектара</p>
                <p>${park.description}</p>
                <small>Съществуващ парк</small>
            </div>
        `);
    });
    
    console.log(`Added ${sofiaData.green_data.major_parks.length} existing parks to map`);
}

// Calculate area of a Leaflet layer in square kilometers
function calculateLayerAreaKm2(layer) {
    if (!layer.getLatLngs) return 0;
    
    try {
        const latlngs = layer.getLatLngs();
        
        // Handle different polygon structures
        let coords;
        if (Array.isArray(latlngs[0])) {
            coords = latlngs[0]; // Polygon
        } else {
            coords = latlngs; // Simple polygon
        }
        
        if (coords.length < 3) return 0;
        
        console.log('Calculating area for coordinates:', coords.length, 'points');
        
        // Use more accurate method - convert to projected coordinates and use Shoelace formula
        const avgLat = coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length;
        const metersPerDegreeLat = 111320; // meters per degree latitude
        const metersPerDegreeLng = 111320 * Math.cos(avgLat * Math.PI / 180); // meters per degree longitude at this latitude
        
        // Convert to meters coordinates
        const projectedCoords = coords.map(coord => ({
            x: coord.lng * metersPerDegreeLng,
            y: coord.lat * metersPerDegreeLat
        }));
        
        // Shoelace formula for polygon area
        let area = 0;
        for (let i = 0; i < projectedCoords.length; i++) {
            const j = (i + 1) % projectedCoords.length;
            area += projectedCoords[i].x * projectedCoords[j].y;
            area -= projectedCoords[j].x * projectedCoords[i].y;
        }
        area = Math.abs(area) / 2;
        
        const areaKm2 = area / 1000000; // Convert to km²
        const areaHectares = areaKm2 * 100; // Convert to hectares for comparison
        
        console.log(`Calculated area: ${areaKm2.toFixed(6)} km² (${areaHectares.toFixed(2)} hectares)`);
        
        return areaKm2;
    } catch (error) {
        console.warn('Error calculating area:', error);
        return 0;
    }
}

// Update Sofia statistics with new park area
function updateSofiaStatsWithNewPark(newParkAreaKm2) {
    if (!sofiaData || !newParkAreaKm2 || newParkAreaKm2 <= 0) return;
    
    // Add new park area to total green area
    const originalGreenArea = sofiaData.green_data.total_green_area_km2;
    const newTotalGreenArea = originalGreenArea + newParkAreaKm2;
    
    // Calculate new green percentage with one decimal place
    const newGreenPercentage = parseFloat(((newTotalGreenArea / sofiaData.city_info.total_area_km2) * 100).toFixed(1));
    
    // Calculate air quality improvement based on park size
    // Each hectare of new green area reduces air quality index by approximately 0.02 points (more realistic)
    const parkAreaHectares = newParkAreaKm2 * 100;
    const airQualityReduction = Math.round(parkAreaHectares * 0.02 * 10) / 10; // Round to 1 decimal
    const originalAirQuality = sofiaData.environmental_data.air_quality_index;
    const newAirQuality = Math.max(20, parseFloat((originalAirQuality - airQualityReduction).toFixed(1))); // Minimum air quality 20
    
    // Update Sofia data temporarily for this session
    sofiaData.green_data.total_green_area_km2 = parseFloat(newTotalGreenArea.toFixed(1));
    sofiaData.green_data.green_percentage = newGreenPercentage;
    sofiaData.green_data.parks_count += 1;
    sofiaData.environmental_data.air_quality_index = newAirQuality;
    
    console.log(`Updated Sofia stats: +${newParkAreaKm2.toFixed(3)} km² green area, new percentage: ${newGreenPercentage}%, air quality: ${originalAirQuality} → ${newAirQuality}`);
    
    // Update sidebar display
    updateSofiaSidebarStats();
    
    // Show notification with air quality improvement
    showNotification(
        `Нов парк добавен! Зелената площ се увеличи с ${(newParkAreaKm2 * 100).toFixed(1)} хектара. Нов процент зеленина: ${newGreenPercentage}%. Индексът на замърсения въздух намаля с ${airQualityReduction.toFixed(1)} точки!`, 
        'success'
    );
}

// Update Sofia sidebar stats with loaded data
function updateSofiaSidebarStats() {
    if (!sofiaData) return;
    
    console.log('Updating Sofia sidebar stats...');
    
    // Update all stat values in sidebar
    const greenPercent = document.getElementById('sidebar-green-percent');
    const parksCount = document.getElementById('sidebar-parks-count');
    const population = document.getElementById('sidebar-population');
    const area = document.getElementById('sidebar-area');
    const greenArea = document.getElementById('sidebar-green-area');
    const airQuality = document.getElementById('sidebar-air-quality');
    
    if (greenPercent) greenPercent.textContent = `${sofiaData.green_data.green_percentage}%`;
    if (parksCount) parksCount.textContent = sofiaData.green_data.parks_count;
    if (population) population.textContent = `${(sofiaData.city_info.population / 1000000).toFixed(1)}М`;
    if (area) area.textContent = `${sofiaData.city_info.total_area_km2} км²`;
    if (greenArea) greenArea.textContent = `${sofiaData.green_data.total_green_area_km2.toFixed(1)} км²`;
    
    if (airQuality) {
        airQuality.textContent = sofiaData.environmental_data.air_quality_index;
        // Update air quality color based on value
        const airQualityItem = airQuality.closest('.air-quality-item');
        if (airQualityItem) {
            if (sofiaData.environmental_data.air_quality_index > 70) {
                airQuality.style.background = '#fff3cd';
                airQuality.style.color = '#856404';
            } else {
                airQuality.style.background = '#d4edda';
                airQuality.style.color = '#155724';
            }
        }
    }
    
    console.log('Sofia sidebar stats updated');
}

// Show random Sofia facts
function showRandomFact() {
    if (!sofiaData || !sofiaData.facts || sofiaData.facts.length === 0) {
        document.getElementById('current-fact').innerHTML = '<p>Няма налични факти за София.</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * sofiaData.facts.length);
    const fact = sofiaData.facts[randomIndex];
    
    document.getElementById('current-fact').innerHTML = `<p>${fact}</p>`;
}

// Show Sofia facts panel when map loads
function showSofiaFactsPanel() {
    const factsPanel = document.getElementById('sofia-facts-panel');
    if (factsPanel) {
        factsPanel.style.display = 'block';
        showRandomFact(); // Show initial fact
    }
}

function styleRedesignLayer(layer, toolType) {
    const styles = {
        'park': { color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.6 },
        'greenzone': { color: '#8BC34A', fillColor: '#8BC34A', fillOpacity: 0.5 },
        'alley': { color: '#2196F3', weight: 6, opacity: 0.8 },
        'bikelane': { color: '#FF9800', weight: 6, opacity: 0.8 }
    };
    
    if (styles[toolType]) {
        layer.setStyle(styles[toolType]);
    }
}

function addRedesignPopup(layer, toolType) {
    let popupContent = `
        <div style="text-align: center;">
            <h4>${getToolDisplayName(toolType)}</h4>
            <p>Временно преустройство на София</p>
    `;
    
    // Add area information for parks
    if (toolType === 'park' && layer.getLatLngs) {
        const areaKm2 = calculateLayerAreaKm2(layer);
        if (areaKm2 > 0) {
            const areaHectares = (areaKm2 * 100).toFixed(1);
            popupContent += `<p><strong>Площ:</strong> ${areaHectares} хектара</p>`;
        }
    }
    
    popupContent += `
            <small>Промените ще се загубят при презареждане на страницата</small>
        </div>
    `;
    
    layer.bindPopup(popupContent);
}

function getToolDisplayName(toolType) {
    const names = {
        'park': 'Парк 🌳',
        'alley': 'Алея 🛣️',
        'greenzone': 'Зелена зона 🌿',
        'bikelane': 'Велоалея 🚴'
    };
    return names[toolType] || toolType;
}

// Store original Sofia data for restoration
let originalSofiaData = null;

function clearAllRedesigns() {
    if (drawnItems) {
        drawnItems.clearLayers();
        
        // Restore original Sofia data
        if (originalSofiaData && sofiaData) {
            sofiaData.green_data.total_green_area_km2 = originalSofiaData.green_data.total_green_area_km2;
            sofiaData.green_data.green_percentage = originalSofiaData.green_data.green_percentage;
            sofiaData.green_data.parks_count = originalSofiaData.green_data.parks_count;
            sofiaData.environmental_data.air_quality_index = originalSofiaData.environmental_data.air_quality_index;
            
            // Update sidebar display
            updateSofiaSidebarStats();
            console.log('Sofia stats restored to original values including air quality');
        }
        
        showNotification('Всички преустройства са изчистени и статистиките са възстановени', 'info');
        console.log('All redesigns cleared from current session');
    }
}

// Clear all redesigns from database when page loads (start fresh)
function clearAllRedesignsOnLoad() {
    fetch('/api/redesigns', { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            console.log('All previous redesigns cleared from database - starting fresh');
        })
        .catch(error => {
            console.log('Note: Could not clear previous redesigns, but starting with clean map anyway');
        });
}

function saveRedesignToBackend(layer, toolType) {
    const geoJSON = layer.toGeoJSON();
    const redesignData = {
        type: toolType,
        geometry: geoJSON.geometry,
        coordinates: geoJSON.geometry.coordinates
    };
    
    fetch('/api/redesigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(redesignData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Redesign saved:', data);
        layer._redesignId = data.id; // Store ID for updates/deletes
    })
    .catch(error => console.error('Error saving redesign:', error));
}

function updateRedesignInBackend(layer) {
    if (!layer._redesignId) return;
    
    const geoJSON = layer.toGeoJSON();
    const redesignData = {
        geometry: geoJSON.geometry,
        coordinates: geoJSON.geometry.coordinates
    };
    
    fetch(`/api/redesigns/${layer._redesignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(redesignData)
    })
    .then(response => response.json())
    .then(data => console.log('Redesign updated:', data))
    .catch(error => console.error('Error updating redesign:', error));
}

function deleteRedesignFromBackend(layer) {
    if (!layer._redesignId) return;
    
    fetch(`/api/redesigns/${layer._redesignId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => console.log('Redesign deleted:', data))
    .catch(error => console.error('Error deleting redesign:', error));
}

function loadExistingRedesigns() {
    fetch('/api/redesigns')
        .then(response => response.json())
        .then(redesigns => {
            redesigns.forEach(redesign => {
                try {
                    const layer = L.geoJSON(redesign.geometry).getLayers()[0];
                    if (layer) {
                        styleRedesignLayer(layer, redesign.type);
                        addRedesignPopup(layer, redesign.type);
                        layer._redesignId = redesign.id;
                        drawnItems.addLayer(layer);
                    }
                } catch (error) {
                    console.error('Error loading redesign:', error);
                }
            });
            console.log(`Loaded ${redesigns.length} existing redesigns`);
        })
        .catch(error => console.error('Error loading redesigns:', error));
}

// Updated map loading with redesign functionality
async function loadMapWithRedesign() {
    console.log('Loading Sofia redesign map...');
    const mapCanvas = document.getElementById('map-canvas');
    const placeholder = document.getElementById('map-placeholder');
    
    if (!mapCanvas) {
        console.error('Map canvas not found');
        return;
    }
    
    if (placeholder) {
        placeholder.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #7bc142; margin-bottom: 1rem;"></i>
            <p>Зареждам картата на София...</p>
        `;
    }
    
    try {
        // Load Sofia data first
        await loadSofiaData();
        
        // Clear existing map
        if (map) {
            map.remove();
            map = null;
        }
        
        mapCanvas.innerHTML = '';
        
        // Create map focused on Sofia with wider view
        map = L.map('map-canvas').setView(SOFIA_CENTER, 11);
        
        // Add tile layer (using Geoapify)
        const geoapifyKey = 'd67057512d7a41409604421a2e3e3411';
        L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`, {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Initialize drawing functionality for Sofia redesign
        await initializeSofiaRedesign();
        
        // Update Sofia sidebar stats
        updateSofiaSidebarStats();
        
        // Show Sofia facts panel
        showSofiaFactsPanel();
        
        // Hide placeholder
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        console.log('✅ Sofia redesign map loaded successfully');
        showNotification('Картата на София е заредена с реални данни! 🗺️', 'success');
        
    } catch (error) {
        console.error('Map loading error:', error);
        showFallbackMap();
    }
}

// Initialize Sofia redesign functionality with drawing tools
async function initializeSofiaRedesign() {
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    console.log('Initializing Sofia redesign tools...');
    
    // Clear all existing redesigns when map loads
    clearAllRedesignsOnLoad();
    
    // Create layer group for drawn items
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Add existing parks and green zones
    addExistingGreenZones();
    
    // Setup drawing controls
    setupDrawingControls();
    
    console.log('Sofia redesign tools initialized');
}

// Setup drawing controls based on selected tool
function setupDrawingControls() {
    // Remove existing draw control
    if (drawControl) {
        map.removeControl(drawControl);
    }
    
    // Create new draw control based on current tool
    drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems,
            edit: true,
            remove: true
        },
        draw: getDrawOptions()
    });
    
    map.addControl(drawControl);
    
    // Handle drawing events
    map.on('draw:created', onAreaDrawn);
    map.on('draw:edited', onAreaEdited);
    map.on('draw:deleted', onAreaDeleted);
}

// Export new functions
window.setRedesignTool = setRedesignTool;
window.clearAllRedesigns = clearAllRedesigns;
window.loadMapWithRedesign = loadMapWithRedesign;
window.showRandomFact = showRandomFact;

// Clear all temporary data when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - clearing all temporary data');
    
    // Clear localStorage data
    localStorage.removeItem('cityBuilderData');
    
    // Clear any other temporary data
    console.log('All temporary data cleared - starting fresh session');
});