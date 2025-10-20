// API Configuration
const API_KEY = 'd67057512d7a41409604421a2e3e3411';
const API_BASE_URL = 'https://api.geoapify.com/v1';

// Ambee API Configuration
const AMBEE_API_KEY = 'bdeedc716f3882fa7005eaf1c617bdeb943df52c1b3f3cc43b6334daf19689cc';
const AMBEE_BASE_URL = 'https://api.ambeedata.com';

// Global Variables
let currentSection = 'home';
let mapInstance = null;
let ecoActions = [];
let locations = [];

// Video Background Handler
function initializeVideoBackground() {
    const video = document.getElementById('hero-video');
    const slideshow = document.getElementById('fallback-slideshow');
    const heroSection = document.querySelector('.hero');
    
    if (video) {
        let videoLoaded = false;
        video.classList.add('loading');
        
        // Preload and prepare video
        video.addEventListener('loadstart', function() {
            console.log('Video loading started...');
        });
        
        video.addEventListener('progress', function() {
            console.log('Video loading progress...');
        });
        
        video.addEventListener('canplay', function() {
            console.log('Video can start playing');
            smoothVideoTransition();
        });
        
        video.addEventListener('canplaythrough', function() {
            console.log('Video fully buffered and ready');
            smoothVideoTransition();
        });
        
        function smoothVideoTransition() {
            if (videoLoaded) return;
            videoLoaded = true;
            
            // Add loading complete class to hero
            heroSection.classList.add('video-loaded');
            
            // Smooth transition to video
            setTimeout(() => {
                video.classList.remove('loading');
                video.classList.add('loaded');
                
                // Hide slideshow smoothly
                if (slideshow) {
                    slideshow.style.opacity = '0';
                    setTimeout(() => {
                        slideshow.style.display = 'none';
                    }, 500);
                }
                
                console.log('Video transition complete');
            }, 300);
        }
        
        video.addEventListener('error', function(e) {
            console.log('Video error occurred:', e);
            handleVideoError();
        });
        
        function handleVideoError() {
            video.style.display = 'none';
            heroSection.classList.remove('video-loaded');
            initializeFallbackSlideshow();
        }
        
        // Force load and play
        video.load();
        
        // Gentle timeout with retry
        setTimeout(() => {
            if (!videoLoaded) {
                console.log('Attempting to force video play...');
                video.play().then(() => {
                    console.log('Video play successful');
                    smoothVideoTransition();
                }).catch((error) => {
                    console.log('Video play failed:', error);
                    handleVideoError();
                });
            }
        }, 1500);
        
        // Video restart every 10 seconds with smooth transition
        video.addEventListener('timeupdate', function() {
            if (video.currentTime >= 10) {
                video.style.opacity = '0.8';
                setTimeout(() => {
                    video.currentTime = 0;
                    video.style.opacity = '1';
                }, 200);
            }
        });
        
    } else {
        console.log('Video element not found');
        initializeFallbackSlideshow();
    }
}

// Enhanced Fallback Slideshow Handler
function initializeFallbackSlideshow() {
    const slideshow = document.getElementById('fallback-slideshow');
    const heroSection = document.querySelector('.hero');
    
    if (!slideshow) return;
    
    slideshow.classList.add('active');
    const slides = slideshow.querySelectorAll('.slide');
    let currentSlide = 0;
    
    // Smooth slide transitions
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        
        setTimeout(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 500);
    }
    
    // Stagger initial slide appearance
    slides.forEach((slide, index) => {
        setTimeout(() => {
            if (index === 0) slide.classList.add('active');
        }, index * 200);
    });
    
    // Change slide every 3 seconds with smooth transitions
    setInterval(nextSlide, 3000);
    console.log('Enhanced slideshow initialized with', slides.length, 'slides');
}

// Smooth Number Counter Animation
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    statNumbers.forEach((element, index) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        // Add staggered delay for each stat
        const delay = index * 300;
        
        setTimeout(() => {
            const timer = setInterval(() => {
                current += increment;
                
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Update the display with + sign
                element.textContent = Math.floor(current) + '+';
                
                // Add a subtle scale effect during counting
                const progress = current / target;
                const scale = 1 + (Math.sin(progress * Math.PI) * 0.1);
                element.style.transform = `scale(${scale})`;
                
                if (current >= target) {
                    element.style.transform = 'scale(1)';
                    // Add completion effect
                    element.style.color = '#7bc142';
                    setTimeout(() => {
                        element.style.color = '';
                    }, 500);
                }
            }, 16);
        }, delay);
    });
}

// Fallback Slideshow Handler
function initializeFallbackSlideshow() {
    const slideshow = document.getElementById('fallback-slideshow');
    if (!slideshow) return;
    
    const slides = slideshow.querySelectorAll('.slide');
    let currentSlide = 0;
    
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    // Change slide every 2.5 seconds to create video-like movement
    setInterval(nextSlide, 2500);
    console.log('Fallback slideshow initialized with', slides.length, 'slides');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    console.log('Leaflet available:', typeof L !== 'undefined');
    
    initializeVideoBackground();
    initializeNavbarEffects();
    initializeApp();
    loadSampleData();
    
    // Start number animations after a delay to let content fade in
    setTimeout(() => {
        animateNumbers();
    }, 1500);
});

// Enhanced Navbar Effects
function initializeNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    // Scroll effect for navbar transparency and blur
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const scrolled = scrollY > 50;
        
        if (scrolled) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(15px)';
            navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }
        
        // Hide/show navbar on scroll direction (optional)
        if (scrollY > lastScrollY && scrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = scrollY;
    });
    
    // Smooth navbar item animations on hover
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

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
        
        // Update navbar active states
        const allNavLinks = document.querySelectorAll('.nav-link');
        allNavLinks.forEach(link => link.classList.remove('active'));
        
        // Find and activate the current nav link
        const activeNavLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
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
        } else if (sectionName === 'feed') {
            setTimeout(loadEcoActions, 100);
        } else if (sectionName === 'leaderboard') {
            setTimeout(loadLeaderboard, 100);
        } else if (sectionName === 'air-quality') {
            setTimeout(initializeAirQualitySection, 100);
        } else if (sectionName === 'sponsors') {
            setTimeout(initializeSponsorsPage, 100);
        }
        
        // Show success notification (except for home)
        if (sectionName !== 'home') {
            const sectionNames = {
                'map': 'Карта', 
                'feed': 'Еко действия',
                'leaderboard': 'Класация',
                'air-quality': 'Въздушно качество',
                'sponsors': 'Спонсори',
                'profile': 'Профил'
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
async function handleActionSubmit(form) {
    const formData = new FormData();
    
    // Get form values
    const title = form.querySelector('input[type="text"]').value;
    const description = form.querySelector('textarea').value;
    const type = form.querySelector('select').value;
    const location = form.querySelectorAll('input[type="text"]')[1].value;
    const imageFile = form.querySelector('input[type="file"]').files[0];
    
    // Add to FormData for API call
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('location', location);
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        // Send to backend API
        const response = await fetch('/api/eco-actions', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showNotification(result.message, 'success');
            
            // Add to feed display
            const actionData = {
                title: title,
                description: description,
                type: type,
                location: location,
                points: result.points,
                timestamp: new Date().toISOString(),
                username: 'Вие'
            };
            addActionToFeed(actionData);
            
            // Close modal and reset form
            closeModal('addActionModal');
            form.reset();
            
            // Refresh feed from server
            setTimeout(() => loadEcoActions(), 1000);
        } else {
            showNotification('Грешка при добавяне на действието: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error submitting action:', error);
        showNotification('Грешка при връзката със сървъра', 'error');
    }
}

// Load eco actions from server
async function loadEcoActions() {
    try {
        const response = await fetch('/api/eco-actions');
        const actions = await response.json();
        
        const feedContainer = document.querySelector('.feed-container');
        if (!feedContainer) return;
        
        // Clear current actions (keep only the sample one if no real actions)
        if (actions.length > 0) {
            feedContainer.innerHTML = '';
            
            actions.forEach(action => {
                addActionToFeed(action);
            });
        }
        
        // Update charity statistics
        updateCharityStats();
        
        console.log(`Loaded ${actions.length} eco actions from server`);
    } catch (error) {
        console.error('Error loading eco actions:', error);
    }
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
    
    // Format timestamp
    const timeAgo = formatTimeAgo(actionData.created_at || actionData.timestamp);
    const username = actionData.username || 'Анонимен потребител';
    const imageUrl = actionData.image_path ? `/${actionData.image_path}` : 'https://via.placeholder.com/400x300';
    
    actionDiv.innerHTML = `
        <div class="post-header">
            <img src="https://via.placeholder.com/40" alt="user" class="user-avatar">
            <div class="post-info">
                <h4>${username}</h4>
                <span class="post-date">${timeAgo}</span>
            </div>
            <div class="post-points">+${actionData.points} точки</div>
        </div>
        <div class="post-content">
            <img src="${imageUrl}" alt="eco action" class="post-image">
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

// Format time ago string
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'току-що';
    
    const now = new Date();
    const actionTime = new Date(timestamp);
    const diff = now - actionTime;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'току-що';
    if (minutes < 60) return `преди ${minutes} минути`;
    if (hours < 24) return `преди ${hours} часа`;
    if (days < 30) return `преди ${days} дни`;
    
    return actionTime.toLocaleDateString('bg-BG');
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

// Enhanced Map UX Functions for карта page
function loadMapWithRedesign() {
    const placeholder = document.getElementById('map-placeholder');
    const loading = document.getElementById('map-loading');
    const btn = document.getElementById('load-map-btn');
    
    // Show loading state
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Зареждане...';
    
    setTimeout(() => {
        placeholder.style.opacity = '0';
        setTimeout(() => {
            placeholder.style.display = 'none';
            loading.style.display = 'flex';
            loading.style.opacity = '0';
            
            setTimeout(() => {
                loading.style.opacity = '1';
            }, 100);
            
            // Simulate map loading
            setTimeout(() => {
                loading.style.opacity = '0';
                setTimeout(() => {
                    loading.style.display = 'none';
                    showNotification('Картата е заредена успешно!', 'success');
                    // Here you would initialize the actual map
                    initializeInteractiveMap();
                }, 500);
            }, 2500);
        }, 300);
    }, 500);
}

function initializeInteractiveMap() {
    const mapCanvas = document.getElementById('map-canvas');
    mapCanvas.innerHTML = `
        <div class="interactive-map-placeholder">
            <div class="map-success">
                <i class="fas fa-check-circle"></i>
                <h3>Картата е готова!</h3>
                <p>Използвайте инструментите за преустройване за да редактирате София</p>
            </div>
        </div>
    `;
    
    // Add success styling
    mapCanvas.style.background = 'linear-gradient(135deg, #e8f5e8 0%, #f0f9f0 100%)';
    mapCanvas.style.border = '2px solid #7bc142';
}

function toggleAllFilters() {
    const checkboxes = document.querySelectorAll('.filter-item input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
        // Trigger change event for each
        cb.dispatchEvent(new Event('change'));
    });
    
    const btn = document.querySelector('.filter-toggle-all');
    btn.innerHTML = allChecked ? 
        '<i class="fas fa-eye"></i> Всички' : 
        '<i class="fas fa-eye-slash"></i> Скрий всички';
    
    showNotification(
        allChecked ? 'Всички филтри са изключени' : 'Всички филтри са включени', 
        'info'
    );
}

function getCurrentLocation() {
    const btn = event.target.closest('.map-action-btn');
    const originalHTML = btn.innerHTML;
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Намиране...</span>';
    btn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                showNotification(`Вашата позиция: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success');
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                
                // Animate button success
                btn.style.background = '#28a745';
                setTimeout(() => {
                    btn.style.background = '';
                }, 1000);
            },
            (error) => {
                showNotification('Не може да се определи позицията', 'error');
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }
        );
    } else {
        showNotification('Геолокацията не се поддържа', 'error');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

function shareMapView() {
    const btn = event.target.closest('.map-action-btn');
    const originalHTML = btn.innerHTML;
    
    // Copy to clipboard simulation
    const shareURL = window.location.href + '?view=sofia-map';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareURL).then(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> <span>Копирано!</span>';
            btn.style.background = '#28a745';
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 2000);
            
            showNotification('Връзката е копирана в клипборда', 'success');
        });
    } else {
        showNotification('Споделянето не се поддържа от браузъра', 'error');
    }
}

// Enhanced redesign tool selection with better feedback
function setRedesignTool(toolType) {
    // Remove active from all tools
    document.querySelectorAll('.redesign-tool').forEach(tool => {
        tool.classList.remove('active');
    });
    
    // Add active to selected tool
    const selectedTool = document.getElementById(`${toolType}-tool`);
    if (selectedTool) {
        selectedTool.classList.add('active');
        
        // Add animation effect
        selectedTool.style.transform = 'scale(1.1)';
        setTimeout(() => {
            selectedTool.style.transform = '';
        }, 200);
    }
    
    // Update tool info with more detailed descriptions
    const toolDescriptions = {
        'select': 'Селектиране област - Кликнете и влачете за избор на район',
        'park': 'Създаване на парк - Кликнете за добавяне на зелена зона',
        'alley': 'Планиране на алея - Начертайте нови улици и пътища',
        'greenzone': 'Зелена зона - Добавете дървета и растителност',
        'bikelane': 'Велоалея - Създайте велосипедни пътеки',
        'clear': 'Изчистване - Премахнете всички промени'
    };
    
    const toolInfo = document.getElementById('current-redesign-tool');
    if (toolInfo) {
        toolInfo.textContent = `Избран инструмент: ${toolDescriptions[toolType] || 'Неизвестен инструмент'}`;
    }
    
    showNotification(`Избран инструмент: ${toolType}`, 'info');
}

// Add enhanced filter interaction
function filterLocationsByType() {
    const checkedFilters = Array.from(document.querySelectorAll('.filter-item input[type="checkbox"]:checked'));
    const filterTypes = checkedFilters.map(cb => cb.closest('.filter-item').querySelector('span').textContent);
    
    showNotification(`Показват се: ${filterTypes.join(', ')}`, 'info');
    
    // Add visual feedback to map canvas
    const mapCanvas = document.getElementById('map-canvas');
    mapCanvas.style.borderColor = checkedFilters.length > 0 ? '#7bc142' : '#ccc';
}

// Sponsors page functions
function showBecomeSponsorModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('becomeSponsorModal')) {
        const modal = document.createElement('div');
        modal.id = 'becomeSponsorModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('becomeSponsorModal')">&times;</span>
                <h3><i class="fas fa-handshake"></i> Станете наш спонсор</h3>
                <form id="sponsorForm">
                    <div class="form-group">
                        <label>Име на компанията</label>
                        <input type="text" name="company" placeholder="Вашата компания" required>
                    </div>
                    <div class="form-group">
                        <label>Контактен имейл</label>
                        <input type="email" name="email" placeholder="company@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>Тип на бизнеса</label>
                        <select name="businessType" required>
                            <option value="">Изберете тип</option>
                            <option value="technology">Технологии</option>
                            <option value="energy">Енергия</option>
                            <option value="construction">Строителство</option>
                            <option value="transport">Транспорт</option>
                            <option value="food">Храни и напитки</option>
                            <option value="other">Друго</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Желан тип партньорство</label>
                        <select name="sponsorshipType" required>
                            <option value="">Изберете тип</option>
                            <option value="gold">Златно партньорство (50,000+ лв)</option>
                            <option value="silver">Сребърно партньорство (25,000+ лв)</option>
                            <option value="bronze">Бронзово партньорство (10,000+ лв)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Съобщение</label>
                        <textarea name="message" placeholder="Разкажете ни повече за вашите цели и как можем да работим заедно..." rows="4"></textarea>
                    </div>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-paper-plane"></i>
                        Изпратете заявката
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add form handler
        document.getElementById('sponsorForm').addEventListener('submit', handleSponsorApplication);
    }
    
    document.getElementById('becomeSponsorModal').classList.remove('hidden');
    document.getElementById('becomeSponsorModal').style.display = 'flex';
}

function showContactModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('contactModal')) {
        const modal = document.createElement('div');
        modal.id = 'contactModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeModal('contactModal')">&times;</span>
                <h3><i class="fas fa-envelope"></i> Свържете се с нас</h3>
                <form id="contactForm">
                    <div class="form-group">
                        <label>Вашето име</label>
                        <input type="text" name="name" placeholder="Име и фамилия" required>
                    </div>
                    <div class="form-group">
                        <label>Имейл адрес</label>
                        <input type="email" name="email" placeholder="your@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Тема</label>
                        <select name="subject" required>
                            <option value="">Изберете тема</option>
                            <option value="sponsorship">Спонсорство</option>
                            <option value="partnership">Партньорство</option>
                            <option value="collaboration">Сътрудничество</option>
                            <option value="media">Медии</option>
                            <option value="general">Общи въпроси</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Съобщение</label>
                        <textarea name="message" placeholder="Вашето съобщение..." rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-paper-plane"></i>
                        Изпратете съобщението
                    </button>
                </form>
                
                <div class="contact-info">
                    <h4>Други начини за контакт:</h4>
                    <div class="contact-methods">
                        <div class="contact-method">
                            <i class="fas fa-envelope"></i>
                            <span>info@plantatree.bg</span>
                        </div>
                        <div class="contact-method">
                            <i class="fas fa-phone"></i>
                            <span>+359 888 123 456</span>
                        </div>
                        <div class="contact-method">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>бул. Витоша 1, София 1000</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add form handler
        document.getElementById('contactForm').addEventListener('submit', handleContactForm);
    }
    
    document.getElementById('contactModal').classList.remove('hidden');
    document.getElementById('contactModal').style.display = 'flex';
}

function handleSponsorApplication(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const sponsorData = {
        company: formData.get('company'),
        email: formData.get('email'),
        businessType: formData.get('businessType'),
        sponsorshipType: formData.get('sponsorshipType'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    console.log('Sponsor application:', sponsorData);
    
    // Simulate sending to backend
    showNotification('Заявката за спонсорство е изпратена успешно! Ще се свържем с вас скоро. 🤝', 'success');
    
    closeModal('becomeSponsorModal');
    e.target.reset();
    
    // Add sparkle animation effect
    createSparkleEffect();
}

function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };
    
    console.log('Contact form:', contactData);
    
    // Simulate sending to backend
    showNotification('Съобщението е изпратено успешно! Очаквайте отговор в рамките на 24 часа. 📧', 'success');
    
    closeModal('contactModal');
    e.target.reset();
}

function createSparkleEffect() {
    // Create sparkle animation for sponsor application success
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                top: ${Math.random() * window.innerHeight}px;
                left: ${Math.random() * window.innerWidth}px;
                width: 10px;
                height: 10px;
                background: #7bc142;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                animation: sparkle 1s ease-out forwards;
            `;
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }, i * 50);
    }
}

// Add sparkle animation CSS
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkle {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sparkleStyle);

// Initialize sponsors page when loaded
function initializeSponsorsPage() {
    // Animate statistics when sponsors page is viewed
    const sponsorStats = document.querySelectorAll('#sponsors .stat-number[data-target]');
    
    if (sponsorStats.length > 0) {
        sponsorStats.forEach((element, index) => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const delay = index * 200;
            
            setTimeout(() => {
                const timer = setInterval(() => {
                    current += increment;
                    
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    
                    // Update display
                    if (target > 1000) {
                        element.textContent = Math.floor(current).toLocaleString();
                    } else {
                        element.textContent = Math.floor(current);
                    }
                    
                    // Add completion effect
                    if (current >= target) {
                        element.style.color = '#7bc142';
                        setTimeout(() => {
                            element.style.color = '';
                        }, 500);
                    }
                }, 16);
            }, delay);
        });
    }
    
    console.log('Sponsors page initialized with animated statistics');
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

// =================== LEADERBOARD FUNCTIONALITY ===================

// Sample leaderboard data
const leaderboardData = [
    {
        id: 1,
        name: "Мария Петрова",
        points: 1250,
        actions: 85,
        badges: ["Еко герой", "Майстор дървета", "Рециклиращ"],
        level: "Еко легенда",
        avatar: "https://via.placeholder.com/80",
        online: true,
        joinDate: "2024-01-15"
    },
    {
        id: 2,
        name: "Петър Иванов",
        points: 1120,
        actions: 72,
        badges: ["Велосипедист", "Садовник"],
        level: "Еко майстор",
        avatar: "https://via.placeholder.com/80",
        online: false,
        joinDate: "2024-02-03"
    },
    {
        id: 3,
        name: "Анна Георгиева",
        points: 950,
        actions: 63,
        badges: ["Почистител", "Природолюбец"],
        level: "Еко експерт",
        avatar: "https://via.placeholder.com/80",
        online: true,
        joinDate: "2024-01-28"
    },
    {
        id: 4,
        name: "Георги Димитров",
        points: 840,
        actions: 56,
        badges: ["🌳 Залесител"],
        level: "Еко активист",
        avatar: "https://via.placeholder.com/80",
        online: false,
        joinDate: "2024-03-10"
    },
    {
        id: 5,
        name: "Елена Николова",
        points: 780,
        actions: 52,
        badges: ["Рециклиращ", "Садовник"],
        level: "Еко активист",
        avatar: "https://via.placeholder.com/80",
        online: true,
        joinDate: "2024-02-20"
    },
    {
        id: 6,
        name: "Иван Стоянов",
        points: 720,
        actions: 48,
        badges: ["🚴 Велосипедист"],
        level: "Еко активист",
        avatar: "https://via.placeholder.com/80",
        online: false,
        joinDate: "2024-03-05"
    },
    {
        id: 7,
        name: "Росица Василева",
        points: 680,
        actions: 45,
        badges: ["Почистител", "Природолюбец"],
        level: "Еко ентусиаст",
        avatar: "https://via.placeholder.com/80",
        online: true,
        joinDate: "2024-02-15"
    },
    {
        id: 8,
        name: "Димитър Петков",
        points: 620,
        actions: 41,
        badges: ["🌳 Залесител"],
        level: "Еко ентусиаст",
        avatar: "https://via.placeholder.com/80",
        online: false,
        joinDate: "2024-03-20"
    },
    {
        id: 9,
        name: "Стефка Атанасова",
        points: 580,
        actions: 38,
        badges: ["♻️ Рециклиращ"],
        level: "Еко ентусиаст",
        avatar: "https://via.placeholder.com/80",
        online: true,
        joinDate: "2024-02-28"
    },
    {
        id: 10,
        name: "Николай Христов",
        points: 520,
        actions: 34,
        badges: ["Велосипедист", "Садовник"],
        level: "Еко новак",
        avatar: "https://via.placeholder.com/80",
        online: false,
        joinDate: "2024-03-15"
    },
    {
        id: 11,
        name: "Ваня Младенова",
        points: 480,
        actions: 32,
        badges: ["Природолюбец"],
        level: "Еко новак",
        avatar: "https://via.placeholder.com/80",
        online: true,
        joinDate: "2024-03-08"
    },
    {
        id: 12,
        name: "Иван Петров",
        points: 420,
        actions: 28,
        badges: ["🌳 Залесител"],
        level: "Еко новак",
        avatar: "https://via.placeholder.com/80",
        online: true,
        joinDate: "2024-03-22"
    }
];

let currentFilter = 'month';
let currentTypeFilter = 'all';

// Load and display leaderboard
function loadLeaderboard() {
    console.log('Loading leaderboard...');
    
    // Update statistics
    updateLeaderboardStats();
    
    // Display regular rankings (4th place and below)
    displayRegularRankings();
    
    // Update your position
    updateYourPosition();
    
    showNotification('Класацията е заредена! 🏆', 'success');
}

// Update leaderboard statistics
function updateLeaderboardStats() {
    const totalUsers = leaderboardData.length;
    const totalActions = leaderboardData.reduce((sum, user) => sum + user.actions, 0);
    const totalPoints = leaderboardData.reduce((sum, user) => sum + user.points, 0);
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-actions').textContent = totalActions.toLocaleString();
    document.getElementById('total-points').textContent = totalPoints.toLocaleString();
}

// Display regular rankings (4th place and below)
function displayRegularRankings() {
    const container = document.getElementById('leaderboard-list');
    const regularUsers = leaderboardData.slice(3); // Skip top 3
    
    container.innerHTML = regularUsers.map((user, index) => `
        <div class="ranking-item">
            <div class="ranking-number">#${index + 4}</div>
            <div class="ranking-avatar">
                <img src="${user.avatar}" alt="${user.name}">
            </div>
            <div class="ranking-info">
                <h5>${user.name}</h5>
                <div class="level">${user.level}</div>
            </div>
            <div class="ranking-points">${user.points}</div>
            <div class="ranking-actions">${user.actions}</div>
            <div class="ranking-badges">
                ${user.badges.slice(0, 3).map(badge => 
                    `<div class="mini-badge" title="${badge}">${badge.charAt(0)}</div>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

// Update your position card
function updateYourPosition() {
    const yourUser = leaderboardData.find(user => user.name === "Иван Петров");
    if (yourUser) {
        const yourRank = leaderboardData.findIndex(user => user.id === yourUser.id) + 1;
        const nextUser = leaderboardData[yourRank - 2]; // User above you
        const pointsToNext = nextUser ? nextUser.points - yourUser.points : 0;
        const progressPercent = nextUser ? ((yourUser.points / nextUser.points) * 100) : 100;
        
        // Update the position card
        const positionCard = document.querySelector('.position-rank');
        if (positionCard) {
            positionCard.textContent = `#${yourRank}`;
        }
        
        const progressSpan = document.querySelector('.position-progress span');
        if (progressSpan && nextUser) {
            progressSpan.textContent = `До следваща позиция: ${pointsToNext} точки`;
        }
        
        const progressFill = document.querySelector('.position-progress .progress-fill');
        if (progressFill) {
            progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
        }
    }
}

// Filter leaderboard by time period
function filterLeaderboard(period) {
    currentFilter = period;
    
    // Update filter button text
    const filterNames = {
        'week': 'Тази седмица',
        'month': 'Този месец', 
        'year': 'Тази година',
        'all': 'Всички времена',
        'trees': '🌳 Дървета',
        'cleanup': '🧹 Почистване',
        'bike': '🚴 Велосипед'
    };
    
    const currentFilterElement = document.getElementById('current-filter');
    if (currentFilterElement && filterNames[period]) {
        currentFilterElement.textContent = filterNames[period];
    }
    
    // Hide dropdown
    const dropdown = document.getElementById('time-filter-menu');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
    
    // Update filter buttons active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // In a real app, you would filter the data based on period/type
    // For demo, we'll just show a notification
    showNotification(`Филтър приложен: ${filterNames[period]} 📊`, 'info');
    
    // Reload leaderboard with filtered data
    displayRegularRankings();
    updateLeaderboardStats();
}

// Toggle time filter dropdown
function toggleTimeFilter() {
    const dropdown = document.getElementById('time-filter-menu');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('time-filter-menu');
    const toggle = document.querySelector('.dropdown-toggle');
    
    if (dropdown && toggle && !toggle.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Add some animation effects
function animateLeaderboardEntry() {
    const items = document.querySelectorAll('.ranking-item, .podium-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Call animation when leaderboard loads
function loadLeaderboard() {
    console.log('Loading leaderboard...');
    
    updateLeaderboardStats();
    displayRegularRankings();
    updateYourPosition();
    
    // Add animation
    setTimeout(animateLeaderboardEntry, 100);
    
    showNotification('Класацията е заредена! 🏆', 'success');
}

// ==================== AMBEE API INTEGRATION ====================

// Sofia coordinates for air quality data
const SOFIA_COORDINATES = {
    lat: 42.6977,
    lon: 23.3219
};

// Location coordinates mapping
const LOCATION_COORDINATES = {
    'sofia-center': { lat: 42.6977, lon: 23.3219 },
    'sofia-lozenets': { lat: 42.6730, lon: 23.3390 },
    'sofia-studentski-grad': { lat: 42.6540, lon: 23.3480 },
    'sofia-druzhba': { lat: 42.6650, lon: 23.3900 },
    'sofia-lyulin': { lat: 42.7120, lon: 23.2500 }
};

// Current selected location
let currentAirLocation = 'sofia-center';

// Air Quality functions
async function fetchAirQualityData(lat, lon) {
    try {
        console.log(`Fetching air quality data for lat: ${lat}, lon: ${lon}`);
        
        // Use our backend endpoint instead of direct Ambee API call
        const response = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        });
        
        console.log('Air Quality API Response status:', response.status);
        
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Air Quality API Response data:', result);
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        // Return static realistic data instead of random
        return {
            stations: [{
                AQI: 44,
                PM25: 8.177,
                PM10: 20.523,
                NO2: 7.497,
                OZONE: 22.803,
                CO: 1.072,
                SO2: 0.816,
                city: 'Sofia',
                countryCode: 'BG'
            }]
        };
    }
}

// Weather data from Ambee
async function fetchWeatherData(lat, lon) {
    try {
        console.log(`Fetching weather data for lat: ${lat}, lon: ${lon}`);
        
        // Use our backend endpoint instead of direct Ambee API call
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        });
        
        console.log('Weather API Response status:', response.status);
        
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Weather API Response data:', result);
        
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Return static realistic data for Sofia
        return {
            data: {
                temperature: 18.2,
                humidity: 65,
                windSpeed: 3.4, // m/s
                visibility: 8000, // meters
                pressure: 1013.2
            }
        };
    }
}

// Update air quality display
function updateAirQualityDisplay(data) {
    if (!data || !data.stations || data.stations.length === 0) {
        console.log('No air quality data available, using fallback');
        showFallbackAirData();
        return;
    }
    
    const station = data.stations[0];
    console.log('Air quality station data:', station);
    
    const aqi = station.AQI || station.aqiInfo?.aqi || 72; // Use API data or fallback to realistic value
    
    // Update AQI display
    document.getElementById('aqi-value').textContent = aqi;
    document.getElementById('aqi-status').textContent = getAQIStatus(aqi);
    
    // Update pollutants with actual data or realistic fallbacks
    document.getElementById('pm25-value').textContent = station.PM25 || station.PM25?.concentration || '18.5';
    document.getElementById('pm10-value').textContent = station.PM10 || station.PM10?.concentration || '32.1';
    document.getElementById('no2-value').textContent = station.NO2 || station.NO2?.concentration || '24.7';
    document.getElementById('o3-value').textContent = station.OZONE || station.O3?.concentration || '85.3';
    
    // Update main card color based on AQI
    const mainCard = document.querySelector('.air-quality-card.main-card');
    mainCard.className = `air-quality-card main-card ${getAQIClass(aqi)}`;
    
    // Update last updated time
    document.getElementById('last-updated').textContent = 
        `Последно обновяване: ${new Date().toLocaleTimeString('bg-BG')}`;
    
    // Update health recommendations
    updateHealthRecommendations(aqi);
}

// Update weather display
function updateWeatherDisplay(data) {
    if (!data || !data.data) {
        showFallbackWeatherData();
        return;
    }
    
    const weather = data.data;
    
    // Use converted Celsius temperature if available, otherwise convert from Fahrenheit
    let tempC;
    if (weather.temperatureC) {
        tempC = weather.temperatureC;
    } else if (weather.temperature) {
        // Convert from Fahrenheit to Celsius
        tempC = (weather.temperature - 32) * 5/9;
    } else {
        tempC = null;
    }
    
    document.getElementById('temperature').textContent = 
        tempC ? `${Math.round(tempC)}°C` : '--°C';
    document.getElementById('humidity').textContent = 
        weather.humidity ? `${Math.round(weather.humidity)}%` : '--%';
    document.getElementById('wind-speed').textContent = 
        weather.windSpeed ? `${Math.round(weather.windSpeed * 3.6)} км/ч` : '-- км/ч';
    document.getElementById('visibility').textContent = 
        weather.visibility ? `${Math.round(weather.visibility / 1000)} км` : '-- км';
}

// Get AQI status text
function getAQIStatus(aqi) {
    if (aqi <= 50) return 'Добро';
    if (aqi <= 100) return 'Умерено';
    if (aqi <= 150) return 'Нездравословно за чувствителни';
    if (aqi <= 200) return 'Нездравословно';
    if (aqi <= 300) return 'Много нездравословно';
    return 'Опасно';
}

// Get AQI CSS class
function getAQIClass(aqi) {
    if (aqi <= 50) return 'aqi-good';
    if (aqi <= 100) return 'aqi-moderate';
    if (aqi <= 150) return 'aqi-unhealthy-sensitive';
    if (aqi <= 200) return 'aqi-unhealthy';
    if (aqi <= 300) return 'aqi-very-unhealthy';
    return 'aqi-hazardous';
}

// Update health recommendations
function updateHealthRecommendations(aqi) {
    const container = document.getElementById('health-recommendations');
    let recommendations = '';
    
    if (aqi <= 50) {
        recommendations = `
            <p><i class="fas fa-check-circle" style="color: #00b894;"></i> Въздухът е чист и безопасен за всички дейности.</p>
            <p><i class="fas fa-running" style="color: #00b894;"></i> Идеално време за спорт на открито и разходки.</p>
        `;
    } else if (aqi <= 100) {
        recommendations = `
            <p><i class="fas fa-exclamation-triangle" style="color: #fdcb6e;"></i> Умерено замърсяване. Внимание за чувствителни хора.</p>
            <p><i class="fas fa-walking" style="color: #fdcb6e;"></i> Спортът на открито е приемлив за повечето хора.</p>
        `;
    } else if (aqi <= 150) {
        recommendations = `
            <p><i class="fas fa-exclamation-triangle" style="color: #e17055;"></i> Нездравословно за чувствителни групи.</p>
            <p><i class="fas fa-mask" style="color: #e17055;"></i> Препоръчва се намаляване на дейностите на открито.</p>
        `;
    } else {
        recommendations = `
            <p><i class="fas fa-times-circle" style="color: #d63031;"></i> Нездравословно за всички. Избягвайте дейности на открито.</p>
            <p><i class="fas fa-home" style="color: #d63031;"></i> Останете вкъщи и затворете прозорците.</p>
        `;
    }
    
    container.innerHTML = recommendations;
}

// Show fallback data when API fails
function showFallbackAirData() {
    // Use static realistic data for Sofia instead of random
    const sofiaAirData = {
        aqi: 72,
        pm25: 18.5,
        pm10: 32.1,
        no2: 24.7,
        o3: 85.3
    };
    
    document.getElementById('aqi-value').textContent = sofiaAirData.aqi;
    document.getElementById('aqi-status').textContent = getAQIStatus(sofiaAirData.aqi);
    document.getElementById('pm25-value').textContent = sofiaAirData.pm25;
    document.getElementById('pm10-value').textContent = sofiaAirData.pm10;
    document.getElementById('no2-value').textContent = sofiaAirData.no2;
    document.getElementById('o3-value').textContent = sofiaAirData.o3;
    
    const mainCard = document.querySelector('.air-quality-card.main-card');
    mainCard.className = `air-quality-card main-card ${getAQIClass(sofiaAirData.aqi)}`;
    
    document.getElementById('last-updated').textContent = 
        `Последно обновяване: ${new Date().toLocaleTimeString('bg-BG')} (demo data)`;
    
    updateHealthRecommendations(sofiaAirData.aqi);
}

function showFallbackWeatherData() {
    // Realistic data for Sofia in October  
    document.getElementById('temperature').textContent = '5°C';
    document.getElementById('humidity').textContent = '78%';
    document.getElementById('wind-speed').textContent = '8 км/ч';
    document.getElementById('visibility').textContent = '6 км';
}

// Change location handler
async function changeLocation() {
    const locationSelect = document.getElementById('location-select');
    currentAirLocation = locationSelect.value;
    
    const coordinates = LOCATION_COORDINATES[currentAirLocation];
    if (coordinates) {
        await loadAirQualityData(coordinates.lat, coordinates.lon);
    }
}

// Get current location for air quality
function getCurrentLocationAir() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await loadAirQualityData(lat, lon);
                
                // Update location selector to show "Моята локация"
                const locationSelect = document.getElementById('location-select');
                locationSelect.innerHTML = '<option value="current" selected>Моята локация</option>' + 
                    locationSelect.innerHTML;
            },
            (error) => {
                console.error('Geolocation error:', error);
                showNotification('Не можах да получа вашата локация', 'error');
            }
        );
    } else {
        showNotification('Geolocation не се поддържа от браузъра', 'error');
    }
}

// Main function to load air quality data
async function loadAirQualityData(lat = SOFIA_COORDINATES.lat, lon = SOFIA_COORDINATES.lon) {
    try {
        console.log('=== Loading Air Quality Data ===');
        console.log(`Coordinates: ${lat}, ${lon}`);
        
        showNotification('Зареждане на данни за въздушното качество...', 'info');
        
        // Fetch both air quality and weather data
        const [airData, weatherData] = await Promise.all([
            fetchAirQualityData(lat, lon),
            fetchWeatherData(lat, lon)
        ]);
        
        console.log('Received air data:', airData);
        console.log('Received weather data:', weatherData);
        
        // Update displays
        updateAirQualityDisplay(airData);
        updateWeatherDisplay(weatherData);
        
        // Create simple chart
        createSimpleChart();
        
        // Show appropriate notification based on data source
        if (airData && airData.stations && airData.stations.length > 0 && airData.stations[0].AQI) {
            showNotification('Данните от Ambee API са заредени!', 'success');
        } else {
            showNotification('Използвам статични данни за София', 'warning');
        }
        
    } catch (error) {
        console.error('Error loading air quality data:', error);
        showFallbackAirData();
        showFallbackWeatherData();
        showNotification('Използвам локални данни поради проблем с API', 'warning');
    }
}

// Create a simple chart placeholder
function createSimpleChart() {
    const chartContainer = document.getElementById('air-quality-chart');
    const hours = [];
    const values = [];
    
    // Generate demo chart data
    for (let i = 23; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i);
        hours.push(hour.getHours() + ':00');
        values.push(Math.floor(Math.random() * 50) + 30);
    }
    
    chartContainer.innerHTML = `
        <div style="display: flex; align-items: end; gap: 4px; height: 250px; padding: 20px;">
            ${values.map((value, index) => `
                <div style="
                    background: linear-gradient(to top, #74b9ff, #0984e3);
                    width: 20px;
                    height: ${(value / 100) * 200}px;
                    border-radius: 3px 3px 0 0;
                    position: relative;
                    margin: 0 1px;
                " title="${hours[index]}: AQI ${value}">
                    <span style="
                        position: absolute;
                        bottom: -25px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 10px;
                        color: #666;
                        ${index % 4 === 0 ? '' : 'display: none;'}
                    ">${hours[index]}</span>
                </div>
            `).join('')}
        </div>
        <div style="text-align: center; margin-top: 10px; color: #666; font-size: 0.9rem;">
            Тенденция на AQI за последните 24 часа
        </div>
    `;
}

// Initialize air quality section when it's shown
function initializeAirQualitySection() {
    console.log('Initializing Air Quality section...');
    loadAirQualityData();
    
    // Set up auto-refresh every 30 minutes
    setInterval(loadAirQualityData, 30 * 60 * 1000);
}

// Export air quality functions
window.changeLocation = changeLocation;
window.getCurrentLocationAir = getCurrentLocationAir;
window.loadAirQualityData = loadAirQualityData;

// Clear all temporary data when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - clearing all temporary data');
    
    // Clear localStorage data
    localStorage.removeItem('cityBuilderData');
    
    // Clear any other temporary data
    console.log('All temporary data cleared - starting fresh session');
});