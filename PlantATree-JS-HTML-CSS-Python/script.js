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
let currentLanguage = 'bg'; // Default to Bulgarian

// Language translations object
const translations = {
    'bg': {
        // Navigation
        'nav_home': 'Начало',
        'nav_map': 'Карта',
        'nav_feed': 'Еко действия',
        'nav_air': 'Въздух',
        'nav_leaderboard': 'Класация',
        'nav_sponsors': 'Спонсори',
        'nav_profile': 'Профил',
        'btn_login': 'Вход',
        'btn_register': 'Регистрация',
        'lang_switch': 'EN',
        
        // Home section
        'hero_title': 'Помогни да направим София по-зелена',
        'hero_subtitle': 'Платформа за картиране на зелени зони, еко пътеки и споделяне на еко инициативи в България',
        'btn_explore_map': 'Разгледай картата',
        'btn_eco_actions': 'Еко действия',
        'stat_green_zones': 'Зелени зони',
        'stat_trees_planted': 'Засадени дървета',
        'stat_active_users': 'Активни потребители',
        
        // Map section
        'map_title': 'Карта на зелените зони',
        'map_subtitle': 'Открий паркове, еко пътеки и велоалеи в София',
        'redesign_tools_title': 'Инструменти за преустройване на София',
        'tool_selection': 'Селектиране',
        'tool_park': 'Парк',
        'tool_alley': 'Алея/Улица',
        'tool_green_zone': 'Зелена зона',
        'tool_bike_lane': 'Велоалея',
        'tool_zones': 'Зони',
        'tool_boundaries': 'Граници',
        'tool_clear': 'Изчисти всичко',
        'btn_save': 'Запази',
        'btn_load': 'Зареди',
        'btn_delete_saved': 'Изтрий запазеното',
        'current_tool_info': 'Избран инструмент: Селектиране област',
        'btn_show_map': 'Покажи карта на София',
        'sofia_stats_title': 'София',
        'sidebar_greenery': 'Зеленина',
        'sidebar_parks': 'Паркове',
        'sidebar_population': 'Население',
        'sidebar_area': 'Площ',
        'sidebar_green_zones': 'Зелени зони',
        'sidebar_air_quality': 'Качество въздух',
        
        // Feed section
        'feed_title': 'Еко действия',
        'feed_subtitle': 'Споделете вашите еко инициативи с общността',
        'charity_title': 'Благотворителност',
        'charity_text': 'За всеки 500 събрани точки от общността дарявame 1 лв. за залесяване и опазване на природата!',
        'btn_add_action': 'Добави действие',
        
        // Air Quality section
        'air_title': 'Качество на въздуха',
        'air_subtitle': 'Данни в реално време за въздушното качество в София',
        'aqi_label': 'AQI',
        'last_updated': 'Последно обновяване',
        'weather_conditions': 'Метеорологични условия',
        'health_recommendations': 'Препоръки за здравето',
        'air_chart_title': '24-часова тенденция',
        'location_selector_title': 'Избери локация',
        'btn_my_location': 'Моята локация',
        
        // Leaderboard section
        'leaderboard_title': 'Класация',
        'leaderboard_subtitle': 'Топ еко герои на София',
        'total_users': 'Активни потребители',
        'total_actions': 'Общо действия',
        'total_points': 'Общо точки',
        'filter_all': 'Всички',
        'filter_this_month': 'Този месец',
        'filter_trees': 'Дървета',
        'filter_cleanup': 'Почистване',
        'filter_bike': 'Велосипед',
        'your_position': 'Твоята позиция',
        
        // Profile section
        'profile_title': 'Потребителски профил',
        'profile_points': 'Точки',
        'profile_actions': 'Действия',
        'profile_badges': 'Баджове',
        'actions_history': 'История на действията',
        
        // Sponsors section
        'sponsors_title': 'Нашите спонсори',
        'sponsors_subtitle': 'Компании, които подкрепят зелената мисия на София',
        'gold_partners': 'Златни партньори',
        'silver_partners': 'Сребърни партньори',
        'corporate_partners': 'Корпоративни партньори',
        'become_partner': 'Станете наш партньор',
        'partnership_benefits': 'Станете наш партньор',
        'btn_become_sponsor': 'Станете спонсор',
        'btn_contact_us': 'Свържете се с нас',
        
        // Modals and forms
        'modal_add_location': 'Добави нова локация',
        'modal_add_action': 'Добави еко действие',
        'form_location_name': 'Име на локацията',
        'form_description': 'Описание',
        'form_type': 'Избери тип',
        'form_action_title': 'Заглавие на действието',
        'form_action_description': 'Опиши какво си направил...',
        'form_location': 'Локация',
        'btn_add_location': 'Добави локация',
        'btn_share_action': 'Сподели действието',
        
        // Auth forms
        'login_title': 'Вход',
        'register_title': 'Регистрация',
        'email_label': 'Имейл',
        'password_label': 'Парола',
        'username_label': 'Потребителско име',
        'confirm_password_label': 'Повтори парола',
        'no_account': 'Нямате профил?',
        'register_link': 'Регистрирайте се',
        'have_account': 'Вече имате профил?',
        'login_link': 'Влезте',
        
        // Chat
        'chat_button': 'Чат',
        'chat_title': 'Еко Асистент',
        'chat_placeholder': 'Попитай за еко инициативи...',
        'chat_send': 'Изпрати',
        
        // Map page specific
        'map_filters_title': 'Филтри',
        'filter_parks': 'Паркове',
        'filter_eco_trails': 'Еко пътеки', 
        'filter_bike_lanes': 'Велоалеи',
        'filter_planting_areas': 'Места за засаждане',
        'auto_save_notice': 'Промените се запазват автоматично в базата данни',
        'tool_selection_desc': 'Кликнете и влачете върху картата за да селектирате област за преустройство. Промените са временни.',
        'map_placeholder_text': 'Кликнете "Покажи карта" за да заредите интерактивната карта',
        'facts_title': 'Знаете ли, че...',
        'new_fact_btn': 'нов факт',
        'map_loading_text': 'Зареждане на интересни факти за София...',
        
        // Zone dropdown options
        'zone_residential': 'Жилищна зона',
        'zone_commercial': 'Търговска зона', 
        'zone_industrial': 'Индустриална зона',
        'zone_office': 'Офис зона',
        'zone_mixed': 'Смесена зона',
        'zone_public': 'Обществена зона',
        
        // Air quality details
        'sofia_center': 'София Център',
        'air_quality_good': 'Добро',
        'temperature_label': 'Температура',
        'humidity_label': 'Влажност', 
        'wind_label': 'Вятър',
        'visibility_label': 'Видимост',
        'health_rec_title': 'Препоръки за здравето',
        'air_clean_safe': 'Въздухът е чист и безопасен за всички дейности.',
        'perfect_outdoor': 'Идеално време за спорт на открито и разходки.',
        'aqi_trend_title': 'Тенденция на AQI за последните 24 часа',
        
        // Leaderboard specific  
        'position_header': 'Позиция',
        'user_header': 'Потребител',
        'points_header': 'Точки',
        'actions_header': 'Действия',
        'badges_header': 'Баджове',
        'eco_hero_badge': 'Еко герой',
        'tree_master_badge': 'Майстор дървета', 
        'cyclist_badge': 'Велосипедист',
        'cleaner_badge': 'Почистител',
        'eco_activist_badge': 'Еко активист',
        'eco_enthusiast_badge': 'Еко ентусиаст',
        'eco_newbie_badge': 'Еко новак',
        
        // Sponsors specific
        'eco_technologies': 'Еко технологии',
        'solar_solutions': 'Соларни решения',
        'recycling': 'Рециклиране',
        'urban_mobility': 'Градска мобилност', 
        'water_purification': 'Пречистване на вода',
        'shopping_center': 'Търговски център',
        'organic_food': 'Био храни',
        'electric_vehicles': 'Електромобили',
        'eco_construction': 'Еко строителство',
        'trees_planted': 'Засадени дървета',
        'investment_amount': 'Лева инвестиции',
        'cleaner_air': '% по-чист въздух',
        'new_parks': 'Нови паркове',
        'premium_partner': 'Премиум партньор',
        'verified_badge': 'Верифициран',
        'innovation_badge': 'Иновация',
        'standard_partner': 'Стандартен партньор',
        'bronze_partner': 'Бронзов партньор',
        'visibility_benefit': 'Видимост',
        'social_responsibility': 'Социална отговорност',
        'community_benefit': 'Общност',
        'growth_benefit': 'Растеж',
        'partnership_impact': 'Въздействие на партньорствата',
        'ready_to_make_difference': 'Готови ли сте да направите разликата?',
        
        // Notifications and messages
        'loading': 'Зареждане...',
        'error': 'Грешка',
        'success': 'Успех',
        'info': 'Информация',
        'warning': 'Внимание'
    },
    'en': {
        // Navigation
        'nav_home': 'Home',
        'nav_map': 'Map',
        'nav_feed': 'Eco Actions',
        'nav_air': 'Air Quality',
        'nav_leaderboard': 'Leaderboard',
        'nav_sponsors': 'Sponsors',
        'nav_profile': 'Profile',
        'btn_login': 'Login',
        'btn_register': 'Register',
        'lang_switch': 'БГ',
        
        // Home section
        'hero_title': 'Help Make Sofia Greener',
        'hero_subtitle': 'Platform for mapping green zones, eco trails and sharing eco initiatives in Bulgaria',
        'btn_explore_map': 'Explore Map',
        'btn_eco_actions': 'Eco Actions',
        'stat_green_zones': 'Green Zones',
        'stat_trees_planted': 'Trees Planted',
        'stat_active_users': 'Active Users',
        
        // Map section
        'map_title': 'Green Zones Map',
        'map_subtitle': 'Discover parks, eco trails and bike lanes in Sofia',
        'redesign_tools_title': 'Sofia Redesign Tools',
        'tool_selection': 'Selection',
        'tool_park': 'Park',
        'tool_alley': 'Street/Alley',
        'tool_green_zone': 'Green Zone',
        'tool_bike_lane': 'Bike Lane',
        'tool_zones': 'Zones',
        'tool_boundaries': 'Boundaries',
        'tool_clear': 'Clear All',
        'btn_save': 'Save',
        'btn_load': 'Load',
        'btn_delete_saved': 'Delete Saved',
        'current_tool_info': 'Selected tool: Area Selection',
        'btn_show_map': 'Show Sofia Map',
        'sofia_stats_title': 'Sofia',
        'sidebar_greenery': 'Greenery',
        'sidebar_parks': 'Parks',
        'sidebar_population': 'Population',
        'sidebar_area': 'Area',
        'sidebar_green_zones': 'Green Zones',
        'sidebar_air_quality': 'Air Quality',
        
        // Feed section
        'feed_title': 'Eco Actions',
        'feed_subtitle': 'Share your eco initiatives with the community',
        'charity_title': 'Charity',
        'charity_text': 'For every 500 points collected by the community, we donate 1 BGN for tree planting and nature conservation!',
        'btn_add_action': 'Add Action',
        
        // Air Quality section
        'air_title': 'Air Quality',
        'air_subtitle': 'Real-time air quality data for Sofia',
        'aqi_label': 'AQI',
        'last_updated': 'Last updated',
        'weather_conditions': 'Weather Conditions',
        'health_recommendations': 'Health Recommendations',
        'air_chart_title': '24-hour Trend',
        'location_selector_title': 'Select Location',
        'btn_my_location': 'My Location',
        
        // Leaderboard section
        'leaderboard_title': 'Leaderboard',
        'leaderboard_subtitle': 'Top eco heroes of Sofia',
        'total_users': 'Active Users',
        'total_actions': 'Total Actions',
        'total_points': 'Total Points',
        'filter_all': 'All',
        'filter_this_month': 'This Month',
        'filter_trees': 'Trees',
        'filter_cleanup': 'Cleanup',
        'filter_bike': 'Bicycle',
        'your_position': 'Your Position',
        
        // Profile section
        'profile_title': 'User Profile',
        'profile_points': 'Points',
        'profile_actions': 'Actions',
        'profile_badges': 'Badges',
        'actions_history': 'Actions History',
        
        // Sponsors section
        'sponsors_title': 'Our Sponsors',
        'sponsors_subtitle': 'Companies supporting Sofia\'s green mission',
        'gold_partners': 'Gold Partners',
        'silver_partners': 'Silver Partners',
        'corporate_partners': 'Corporate Partners',
        'become_partner': 'Become Our Partner',
        'partnership_benefits': 'Become Our Partner',
        'btn_become_sponsor': 'Become Sponsor',
        'btn_contact_us': 'Contact Us',
        
        // Modals and forms
        'modal_add_location': 'Add New Location',
        'modal_add_action': 'Add Eco Action',
        'form_location_name': 'Location Name',
        'form_description': 'Description',
        'form_type': 'Select Type',
        'form_action_title': 'Action Title',
        'form_action_description': 'Describe what you did...',
        'form_location': 'Location',
        'btn_add_location': 'Add Location',
        'btn_share_action': 'Share Action',
        
        // Auth forms
        'login_title': 'Login',
        'register_title': 'Register',
        'email_label': 'Email',
        'password_label': 'Password',
        'username_label': 'Username',
        'confirm_password_label': 'Confirm Password',
        'no_account': 'Don\'t have an account?',
        'register_link': 'Register',
        'have_account': 'Already have an account?',
        'login_link': 'Login',
        
        // Chat
        'chat_button': 'Chat',
        'chat_title': 'Eco Assistant',
        'chat_placeholder': 'Ask about eco initiatives...',
        'chat_send': 'Send',
        
        // Map page specific
        'map_filters_title': 'Filters',
        'filter_parks': 'Parks',
        'filter_eco_trails': 'Eco Trails', 
        'filter_bike_lanes': 'Bike Lanes',
        'filter_planting_areas': 'Planting Areas',
        'auto_save_notice': 'Changes are automatically saved to the database',
        'tool_selection_desc': 'Click and drag on the map to select area for redesign. Changes are temporary.',
        'map_placeholder_text': 'Click "Show Map" to load the interactive map',
        'facts_title': 'Did you know...',
        'new_fact_btn': 'new fact',
        'map_loading_text': 'Loading interesting facts about Sofia...',
        
        // Zone dropdown options
        'zone_residential': 'Residential Zone',
        'zone_commercial': 'Commercial Zone', 
        'zone_industrial': 'Industrial Zone',
        'zone_office': 'Office Zone',
        'zone_mixed': 'Mixed Zone',
        'zone_public': 'Public Zone',
        
        // Air quality details
        'sofia_center': 'Sofia Center',
        'air_quality_good': 'Good',
        'temperature_label': 'Temperature',
        'humidity_label': 'Humidity', 
        'wind_label': 'Wind',
        'visibility_label': 'Visibility',
        'health_rec_title': 'Health Recommendations',
        'air_clean_safe': 'The air is clean and safe for all activities.',
        'perfect_outdoor': 'Perfect time for outdoor sports and walks.',
        'aqi_trend_title': 'AQI trend for the last 24 hours',
        
        // Leaderboard specific  
        'position_header': 'Position',
        'user_header': 'User',
        'points_header': 'Points',
        'actions_header': 'Actions',
        'badges_header': 'Badges',
        'eco_hero_badge': 'Eco Hero',
        'tree_master_badge': 'Tree Master', 
        'cyclist_badge': 'Cyclist',
        'cleaner_badge': 'Cleaner',
        'eco_activist_badge': 'Eco Activist',
        'eco_enthusiast_badge': 'Eco Enthusiast',
        'eco_newbie_badge': 'Eco Newbie',
        
        // Sponsors specific
        'eco_technologies': 'Eco Technologies',
        'solar_solutions': 'Solar Solutions',
        'recycling': 'Recycling',
        'urban_mobility': 'Urban Mobility', 
        'water_purification': 'Water Purification',
        'shopping_center': 'Shopping Center',
        'organic_food': 'Organic Food',
        'electric_vehicles': 'Electric Vehicles',
        'eco_construction': 'Eco Construction',
        'trees_planted': 'Trees Planted',
        'investment_amount': 'BGN Investment',
        'cleaner_air': '% Cleaner Air',
        'new_parks': 'New Parks',
        'premium_partner': 'Premium Partner',
        'verified_badge': 'Verified',
        'innovation_badge': 'Innovation',
        'standard_partner': 'Standard Partner',
        'bronze_partner': 'Bronze Partner',
        'visibility_benefit': 'Visibility',
        'social_responsibility': 'Social Responsibility',
        'community_benefit': 'Community',
        'growth_benefit': 'Growth',
        'partnership_impact': 'Partnership Impact',
        'ready_to_make_difference': 'Ready to make a difference?',
        
        // Notifications and messages
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'info': 'Information',
        'warning': 'Warning'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    console.log('Leaflet available:', typeof L !== 'undefined');
    
    initializeApp();
    loadSampleData();
    
    // Initialize video background
    initializeVideoBackground();
    
    // Animate numbers when page loads
    setTimeout(animateNumbers, 1000);
});

// Video Background Handler
function initializeVideoBackground() {
    const video = document.getElementById('hero-video');
    const slideshow = document.getElementById('fallback-slideshow');
    const heroSection = document.querySelector('.hero');
    
    if (video) {
        let videoLoaded = false;
        let canPlayFired = false;
        video.classList.add('loading');
        
        // Error handling for video loading
        video.addEventListener('error', function(e) {
            console.error('Video loading error:', e);
            fallbackToSlideshow();
        });
        
        // Network state monitoring
        video.addEventListener('stalled', function() {
            console.warn('Video stalled, network issues detected');
        });
        
        // Preload and prepare video
        video.addEventListener('loadstart', function() {
            console.log('Video loading started...');
        });
        
        video.addEventListener('loadedmetadata', function() {
            console.log('Video metadata loaded');
        });
        
        video.addEventListener('loadeddata', function() {
            console.log('Video first frame loaded');
        });
        
        video.addEventListener('progress', function() {
            // Calculate loading progress
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const duration = video.duration;
                const progress = (bufferedEnd / duration) * 100;
                console.log(`Video buffered: ${progress.toFixed(1)}%`);
            }
        });
        
        video.addEventListener('canplay', function() {
            if (!canPlayFired) {
                console.log('Video can start playing');
                canPlayFired = true;
                smoothVideoTransition();
            }
        });
        
        video.addEventListener('canplaythrough', function() {
            console.log('Video fully buffered and ready');
            if (!videoLoaded) {
                smoothVideoTransition();
            }
        });
        
        // Fallback function
        function fallbackToSlideshow() {
            if (slideshow) {
                slideshow.style.display = 'block';
                slideshow.style.opacity = '1';
                video.style.display = 'none';
                console.log('Fallback to slideshow activated');
            }
        }
        
        function smoothVideoTransition() {
            if (videoLoaded) return;
            videoLoaded = true;
            
            // Add loading complete class to hero
            heroSection.classList.add('video-loaded');
            
            // Ensure video is ready to play
            video.currentTime = 0;
            
            // Smooth transition to video
            setTimeout(() => {
                video.classList.remove('loading');
                video.classList.add('loaded');
                
                // Play video if not already playing
                video.play().catch(function(error) {
                    console.warn('Video autoplay failed:', error);
                    fallbackToSlideshow();
                });
                
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
        
        // Timeout fallback - if video doesn't load within reasonable time
        setTimeout(() => {
            if (!videoLoaded) {
                console.log('Video loading timeout, falling back to slideshow');
                fallbackToSlideshow();
            }
        }, 8000); // 8 second timeout
        
        // Start loading the video
        video.load();
    } else {
        // No video element, initialize slideshow
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
        // Check if user is logged in when trying to access profile
        if (sectionName === 'profile') {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                showNotification('Моля, влезте в профила си за достъп до тази секция!', 'error');
                showModal('loginModal');
                return;
            }
        }

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
                console.log('Home section shown');
            } else {
                console.error('Hero section not found');
            }
        } else {
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                console.log(`Section ${sectionName} shown`);
            } else {
                console.error(`Section ${sectionName} not found`);
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
        }
        
        // Show success notification (except for home)
        if (sectionName !== 'home') {
            const sectionNames = {
                'map': 'Карта', 
                'feed': 'Еко действия',
                'leaderboard': 'Класация',
                'air-quality': 'Въздушно качество',
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
        console.error('Error in showSection:', error);
    }
}

// Map variables
let map = null;
let drawnItems = null;
let drawControl = null;
let currentRedesignTool = 'select';
let sofiaData = null;
let sofiaBoundaryCircle = null;
let sofiaFutureCircle = null;

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
        
        // Create map with more explicit options and assign to global variable
        map = L.map('geoapify-map', {
            center: [sofiaLat, sofiaLng],
            zoom: 12,
            zoomControl: true,
            attributionControl: true
        });
        
        // Create custom panes for proper layering
        map.createPane('boundaryPane');
        map.getPane('boundaryPane').style.zIndex = 400; // Below overlay pane (500) but above tile pane (200)
        
        map.createPane('designPane');
        map.getPane('designPane').style.zIndex = 600; // Above overlay pane (500) and marker pane (600)
        
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
            showNotification('Geoapify картата е заредена успешно!', 'success');
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
    
    showNotification('Картата е в демо режим', 'info');
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
    showNotification('Благодарим за посещението! Получихте 5 точки!', 'success');
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
        'park': 'Park',
        'trail': 'Trail',
        'bike': 'Bike',
        'plant': 'Plant'
    };
    return icons[type] || 'Location';
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

function handleAddActionClick() {
    console.log('handleAddActionClick called');
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    console.log('Token found:', !!token);
    
    if (!token) {
        // User not logged in - show registration modal
        console.log('User not logged in, showing registration modal');
        if (typeof showModal === 'function') {
            showModal('registerModal');
        } else {
            // Fallback to direct modal show
            const registerModal = document.getElementById('registerModal');
            if (registerModal) {
                registerModal.classList.remove('hidden');
            }
        }
        return;
    }
    
    // User is logged in - show add action modal
    console.log('User is logged in, showing add action modal');
    showAddActionModal();
}

function showAddActionModal() {
    console.log('showAddActionModal called');
    const modal = document.getElementById('addActionModal');
    if (modal) {
        console.log('Modal found, showing modal');
        // Remove hidden class and add show class for consistent behavior
        modal.classList.remove('hidden');
        modal.classList.add('show');
        // Force display flex as backup
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        console.log('Modal classes:', modal.className);
        console.log('Modal style display:', modal.style.display);
    } else {
        console.error('addActionModal not found!');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('show');
        // Also reset inline styles
        modal.style.display = '';
        modal.style.opacity = '';
    }
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
    showNotification('Локацията е добавена успешно!', 'success');
    
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
        // Get authentication token
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
            showNotification('Моля влезте в профила си за да добавите действие', 'error');
            return;
        }
        
        // Send to backend API with authentication
        const response = await fetch('/api/eco-actions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showNotification(result.message, 'success');
            
            // Get current user info
            const currentUser = getCurrentUser();
            const username = currentUser ? currentUser.username : 'Вие';
            
            // Add to feed display
            const actionData = {
                title: title,
                description: description,
                type: type,
                location: location,
                points: result.points,
                timestamp: new Date().toISOString(),
                username: username
            };
            addActionToFeed(actionData);
            
            // Close modal and reset form
            closeModal('addActionModal');
            form.reset();
            
            // Refresh feed from server
            setTimeout(() => loadEcoActions(), 1000);
        } else {
            // Handle specific error cases
            if (response.status === 401) {
                showNotification('Сесията ви е изтекла. Моля влезте отново.', 'error');
                // Redirect to login
                if (typeof showModal === 'function') {
                    showModal('loginModal');
                }
            } else {
                showNotification('Грешка при добавяне на действието: ' + result.error, 'error');
            }
        }
    } catch (error) {
        console.error('Error submitting action:', error);
        showNotification('Грешка при връзката със сървъра', 'error');
    }
}

// Load eco actions from server - Updated for new design
async function loadEcoActionsOld() {
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
        updateCharityProgress();
        
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

// Notification system with language support
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
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
        max-width: 350px;
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Get translated message
function getTranslatedMessage(key, fallback) {
    const langData = translations[currentLanguage];
    return (langData && langData[key]) ? langData[key] : fallback;
}

// Show notification with automatic translation
function showTranslatedNotification(messageKey, fallbackBg, fallbackEn, type = 'info') {
    const message = currentLanguage === 'bg' ? fallbackBg : fallbackEn;
    showNotification(message, type);
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
        showNotification('Благодарим за интереса! Получихте 5 точки!', 'success');
    } catch (error) {
        showNotification('Получихте 5 точки за интереса!', 'success');
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
        park: 'Парк',
        forest: 'Гора',
        garden: 'Градина',
        residential: 'Жилищна сграда',
        commercial: 'Търговска сграда',
        industrial: 'Индустриална сграда',
        road: 'Път',
        'bike-path': 'Велоалея',
        solar: 'Соларни панели',
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
window.handleAddActionClick = handleAddActionClick;

// Load and display eco actions
async function loadEcoActions() {
    try {
        const response = await fetch('/api/eco-actions');
        const actions = await response.json();
        
        const grid = document.getElementById('ecoActionsGrid');
        if (!grid) return;
        
        // Clear existing content
        grid.innerHTML = '';
        
        // Display actions
        actions.forEach(action => {
            const actionCard = createEcoActionCard(action);
            grid.appendChild(actionCard);
        });
        
        // Update charity progress
        updateCharityProgress();
        
    } catch (error) {
        console.error('Error loading eco actions:', error);
    }
}

function createEcoActionCard(action) {
    const card = document.createElement('div');
    card.className = 'eco-action-card';
    
    // Format date
    const date = new Date(action.created_at);
    const timeAgo = getTimeAgo(date);
    
    // Default image if none provided
    const imageUrl = action.image_path ? `/static/${action.image_path}` : 'https://via.placeholder.com/400x200?text=Еко+Действие';
    
    card.innerHTML = `
        <div class="eco-card-header">
            <div class="eco-user-info">
                <img src="https://via.placeholder.com/50?text=${action.username[0]}" alt="user" class="eco-user-avatar">
                <div class="eco-user-details">
                    <h4 class="eco-username">${action.username}</h4>
                    <span class="eco-post-date">${timeAgo}</span>
                </div>
            </div>
            <div class="eco-points-badge">+${action.points} точки</div>
        </div>
        
        <div class="eco-card-content">
            <img src="${imageUrl}" alt="eco action" class="eco-action-image" 
                 onerror="this.src='https://via.placeholder.com/400x200?text=Еко+Действие'">
            <div class="eco-card-body">
                <h3 class="eco-action-title">${action.title}</h3>
                <p class="eco-action-description">${action.description}</p>
                <div class="eco-action-location">
                    <i class="fas fa-map-marker-alt"></i> 
                    <span>${action.location_name || 'София'}</span>
                </div>
            </div>
        </div>
        
        <div class="eco-card-actions">
            <button class="eco-action-btn eco-like-btn" onclick="likeAction(${action.id})">
                <i class="fas fa-heart"></i> 
                <span>0</span>
            </button>
            <button class="eco-action-btn eco-comment-btn" onclick="commentAction(${action.id})">
                <i class="fas fa-comment"></i> 
                <span>0</span>
            </button>
            <button class="eco-action-btn eco-share-btn" onclick="shareAction(${action.id})">
                <i class="fas fa-share"></i> 
                <span>Сподели</span>
            </button>
        </div>
    `;
    
    return card;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'току-що';
    if (diffMins < 60) return `преди ${diffMins} мин`;
    if (diffHours < 24) return `преди ${diffHours} ч`;
    if (diffDays < 7) return `преди ${diffDays} дни`;
    return date.toLocaleDateString('bg-BG');
}

async function updateCharityProgress() {
    try {
        const response = await fetch('/api/charity-stats');
        const data = await response.json();
        
        const totalPoints = data.total_points || 0;
        const targetPoints = 500;
        const percentage = Math.min((totalPoints / targetPoints) * 100, 100);
        
        // Update UI elements
        document.getElementById('charity-total-points').textContent = totalPoints;
        document.getElementById('charity-progress-fill').style.width = `${percentage}%`;
        document.getElementById('charity-percentage').textContent = `${Math.round(percentage)}%`;
        
    } catch (error) {
        console.error('Error updating charity progress:', error);
    }
}

// Action functions (placeholders for future implementation)
function likeAction(actionId) {
    console.log('Like action:', actionId);
    // TODO: Implement like functionality
}

function commentAction(actionId) {
    console.log('Comment action:', actionId);
    // TODO: Implement comment functionality
}

function shareAction(actionId) {
    console.log('Share action:', actionId);
    // TODO: Implement share functionality
}
window.closeModal = closeModal;
window.showLocationInfo = showLocationInfo;
window.visitLocation = visitLocation;
window.filterLocationsByType = filterLocationsByType;
window.getCurrentLocationOnMap = getCurrentLocationOnMap;
window.loadMap = loadMap;
window.selectTool = selectTool;
window.initializeCityBuilder = initializeCityBuilder;

// Sofia Redesign Map Functions

// Toggle zone dropdown
function toggleZoneDropdown() {
    const dropdown = document.getElementById('zone-dropdown');
    const toggleBtn = document.getElementById('zone-tool');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        toggleBtn.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        toggleBtn.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('zone-dropdown');
    const toggleBtn = document.getElementById('zone-tool');
    
    if (dropdown && toggleBtn && 
        !dropdown.contains(event.target) && 
        !toggleBtn.contains(event.target)) {
        dropdown.classList.remove('show');
        toggleBtn.classList.remove('active');
    }
});

function setRedesignTool(toolType) {
    console.log('Setting redesign tool:', toolType);
    
    // Update active tool
    currentRedesignTool = toolType;
    
    // Update UI
    document.querySelectorAll('.redesign-tool').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Special handling for zone tools
    if (toolType.startsWith('zone-')) {
        document.getElementById('zone-tool').classList.add('active');
        // Close dropdown after selection
        document.getElementById('zone-dropdown').classList.remove('show');
        
        // Hide boundary circle popups when zone tool is selected
        if (sofiaBoundaryCircle) {
            sofiaBoundaryCircle.closePopup();
        }
        if (sofiaFutureCircle) {
            sofiaFutureCircle.closePopup();
        }
    } else {
        document.getElementById(`${toolType}-tool`).classList.add('active');
    }
    
    // Update tool info
    const toolNames = {
        'select': 'Селектиране област',
        'park': 'Парк',
        'alley': 'Алея/Улица', 
        'greenzone': 'Зелена зона',
        'bikelane': 'Велоалея',
        'boundary': 'Граници (сега + бъдеще)',
        'zone-residential': 'Жилищна зона',
        'zone-commercial': 'Търговска зона',
        'zone-industrial': 'Индустриална зона',
        'zone-office': 'Офис зона',
        'zone-mixed': 'Смесена зона',
        'zone-public': 'Обществена зона '
    };
    
    document.getElementById('current-redesign-tool').textContent = 
        `Избран инструмент: ${toolNames[toolType]}`;
    
    // Handle special tools
    if (toolType === 'boundary') {
        toggleBothBoundaryCircles();
        return;
    }
    
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
                        fillOpacity: 0.6,
                        pane: 'designPane'
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
                        opacity: 0.8,
                        pane: 'designPane'
                    }
                }
            };
        case 'zone-residential':
            return {
                ...baseOptions,
                polygon: {
                    shapeOptions: {
                        color: '#FF6B35',
                        fillColor: '#FF6B35',
                        fillOpacity: 0.6,
                        pane: 'designPane'
                    }
                }
            };
        case 'zone-commercial':
            return {
                ...baseOptions,
                polygon: {
                    shapeOptions: {
                        color: '#1E88E5',
                        fillColor: '#1E88E5',
                        fillOpacity: 0.6,
                        pane: 'designPane'
                    }
                }
            };
        case 'zone-industrial':
            return {
                ...baseOptions,
                polygon: {
                    shapeOptions: {
                        color: '#D32F2F',
                        fillColor: '#D32F2F',
                        fillOpacity: 0.6,
                        pane: 'designPane'
                    }
                }
            };
        case 'zone-office':
            return {
                ...baseOptions,
                polygon: {
                    shapeOptions: {
                        color: '#8E24AA',
                        fillColor: '#8E24AA',
                        fillOpacity: 0.6,
                        pane: 'designPane'
                    }
                }
            };
        case 'zone-mixed':
            return {
                ...baseOptions,
                polygon: {
                    shapeOptions: {
                        color: '#00ACC1',
                        fillColor: '#00ACC1',
                        fillOpacity: 0.6,
                        pane: 'designPane'
                    }
                }
            };
        case 'zone-public':
            return {
                ...baseOptions,
                polygon: {
                    shapeOptions: {
                        color: '#43A047',
                        fillColor: '#43A047',
                        fillOpacity: 0.6,
                        pane: 'designPane'
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

    console.log(' Area drawn:', type, 'Tool:', currentRedesignTool);
    console.log(' Layer object:', layer);
    
    // Explicitly set layer pane BEFORE adding to map
    if (layer.options) {
        layer.options.pane = 'designPane';
    }
    
    // Add the layer to the map
    drawnItems.addLayer(layer);
    console.log('Layer added to drawnItems');
    
    // Style the layer based on tool type
    styleRedesignLayer(layer, currentRedesignTool);
    
    // Store tool type for future reference
    layer.toolType = currentRedesignTool;
    
    // Add popup with redesign info
    addRedesignPopup(layer, currentRedesignTool);
    
    // Save to database automatically
    saveDrawnItem(layer);
    
    // If this is a park, calculate area and check if within Sofia bounds
    if (currentRedesignTool === 'park') {
        const parkAreaKm2 = calculateLayerAreaKm2(layer);
        if (parkAreaKm2 > 0) {
            console.log(`New park area: ${parkAreaKm2.toFixed(6)} km² (${(parkAreaKm2 * 100).toFixed(2)} hectares)`);
            
            // Only update Sofia stats if park is within current Sofia boundaries (blue circle)
            if (isWithinSofiaBounds(layer)) {
                updateSofiaStatsWithNewPark(parkAreaKm2);
                showNotification(` Парк добавен в границите на София! Статистиките са актуализирани.`, 'success');
            } else {
                showNotification(` Парк добавен извън София. Статистиките остават непроменени.`, 'info');
            }
        }
    } else {
        // Don't save to backend - keep only in memory for this session
        showNotification(`${getToolDisplayName(currentRedesignTool)} добавен! (временно за тази сесия)`, 'success');
    }
}

function onAreaEdited(e) {
    console.log('Areas edited - changes are temporary for this session');
    // Save changes to localStorage
    saveDrawnItems();
    showNotification('Промените са направени и запазени! ✏️', 'info');
}

function onAreaDeleted(e) {
    console.log('Areas deleted - removing from database');
    
    // Delete each removed layer from database
    e.layers.eachLayer(async (layer) => {
        if (layer.databaseId) {
            await deleteDrawnItem(layer);
        }
    });
    
    showNotification('Обектите са изтрити от базата данни! 🗑️', 'info');
}

function isWithinSofiaBounds(layer) {
    // Check if the layer (park) is within current Sofia boundaries (blue circle)
    if (!layer.getLatLngs) {
        return false; // Not a polygon
    }
    
    // Get the center point of the drawn layer
    const bounds = layer.getBounds();
    const center = bounds.getCenter();
    
    // Calculate distance from Sofia center to layer center
    const sofiaCenter = L.latLng(SOFIA_CENTER[0], SOFIA_CENTER[1]);
    const distance = sofiaCenter.distanceTo(center); // Distance in meters
    
    // Sofia current boundary radius (same as blue circle)
    const sofiaAreaKm2 = 492;
    const sofiaRadiusKm = Math.sqrt(sofiaAreaKm2 / Math.PI) * 0.75;
    const sofiaRadiusMeters = sofiaRadiusKm * 1000;
    
    console.log(`🔍 Park center distance from Sofia: ${(distance/1000).toFixed(2)}km, Sofia radius: ${sofiaRadiusKm.toFixed(2)}km`);
    
    return distance <= sofiaRadiusMeters;
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
                <h4>${park.name}</h4>
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
        'bikelane': { color: '#FF9800', weight: 6, opacity: 0.8 },
        'zone-residential': { color: '#FF6B35', fillColor: '#FF6B35', fillOpacity: 0.6 },
        'zone-commercial': { color: '#1E88E5', fillColor: '#1E88E5', fillOpacity: 0.6 },
        'zone-industrial': { color: '#D32F2F', fillColor: '#D32F2F', fillOpacity: 0.6 },
        'zone-office': { color: '#8E24AA', fillColor: '#8E24AA', fillOpacity: 0.6 },
        'zone-mixed': { color: '#00ACC1', fillColor: '#00ACC1', fillOpacity: 0.6 },
        'zone-public': { color: '#43A047', fillColor: '#43A047', fillOpacity: 0.6 }
    };
    
    if (styles[toolType]) {
        layer.setStyle(styles[toolType]);
        
        // Explicitly set layer to design pane after creation
        if (layer.options) {
            layer.options.pane = 'designPane';
        }
        
        // Force layer to be visible and on top
        if (layer._path) {
            layer._path.style.zIndex = 1000;
        }
        
        console.log('Styled layer:', toolType, 'Layer visible:', layer._path ? 'Yes' : 'No');
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
        'park': 'Парк',
        'alley': 'Алея',
        'greenzone': 'Зелена зона',
        'bikelane': 'Велоалея',
        'boundary': 'Граници (сега + бъдеще)',
        'zone-residential': 'Жилищна зона',
        'zone-commercial': 'Търговска зона',
        'zone-industrial': 'Индустриална зона',
        'zone-office': 'Офис зона',
        'zone-mixed': 'Смесена зона 🏘️',
        'zone-public': 'Обществена зона 🏛️'
    };
    return names[toolType] || toolType;
}

// Select zone from dropdown
function selectZone(zoneType) {
    console.log('Selecting zone:', zoneType);
    setRedesignTool('zone-' + zoneType);
}

// Store original Sofia data for restoration
let originalSofiaData = null;

// =================== PERSISTENT STORAGE FUNCTIONS ===================

// Save single drawn item to database
async function saveDrawnItem(layer) {
    console.log(' Attempting to save item to database:', layer.toolType);
    if (!layer || !layer.toolType) {
        console.warn('Cannot save: missing layer or toolType');
        return;
    }
    
    try {
        const geoJson = layer.toGeoJSON();
        const coordinates = geoJson.geometry.coordinates;
        
        const response = await fetch('/api/redesigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: layer.toolType,
                geometry: geoJson.geometry,
                coordinates: coordinates,
                description: `${getToolDisplayName(layer.toolType)} създаден на ${new Date().toLocaleString('bg-BG')}`
            })
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            layer.databaseId = result.id; // Store database ID on layer
            console.log(` Saved ${layer.toolType} to database with ID: ${result.id}`);
            return result.id;
        } else {
            console.error('Error saving item:', result.message);
            showNotification('Грешка при запазване!', 'error');
        }
    } catch (error) {
        console.error('Error saving drawn item:', error);
        showNotification('Грешка при запазване в базата данни!', 'error');
    }
}

// Save all drawn items to database (for manual save button)
async function saveDrawnItems() {
    if (!drawnItems) return;
    
    let savedCount = 0;
    const promises = [];
    
    drawnItems.eachLayer((layer) => {
        if (!layer.databaseId && layer.toolType) { // Only save unsaved items
            promises.push(saveDrawnItem(layer));
            savedCount++;
        }
    });
    
    if (promises.length > 0) {
        await Promise.all(promises);
        console.log(` Saved ${savedCount} new items to database`);
        showNotification(`Запазени са ${savedCount} нови елемента в базата данни! `, 'success');
    } else {
        showNotification('Всички елементи са вече запазени!', 'info');
    }
}

// Load drawn items from database
async function loadDrawnItems() {
    console.log('🔄 Loading items from database...');
    if (!drawnItems) {
        console.error('drawnItems not initialized');
        return;
    }
    
    try {
        console.log('📡 Fetching from /api/redesigns...');
        const response = await fetch('/api/redesigns');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const savedItems = await response.json();
        console.log('📥 Received items:', savedItems);
        
        if (!Array.isArray(savedItems)) {
            console.log('No saved items found in database');
            return;
        }
        
        let loadedCount = 0;
        
        // Clear existing items first
        drawnItems.clearLayers();
        
        savedItems.forEach(item => {
            try {
                // Create layer from GeoJSON geometry
                const geoJson = {
                    type: 'Feature',
                    geometry: item.geometry,
                    properties: {}
                };
                
                const layer = L.geoJSON(geoJson, {
                    pane: 'designPane'
                }).getLayers()[0];
                
                if (layer) {
                    // Store the tool type and database ID for future reference
                    layer.toolType = item.type;
                    layer.databaseId = item.id;
                    
                    // Add to drawn items
                    drawnItems.addLayer(layer);
                    
                    // Apply correct styling
                    styleRedesignLayer(layer, item.type);
                    addRedesignPopup(layer, item.type);
                    
                    loadedCount++;
                }
            } catch (itemError) {
                console.error('Error loading individual item:', itemError, item);
            }
        });
        
        console.log(` Successfully loaded ${loadedCount} drawn items from database`);
        if (loadedCount > 0) {
            showNotification(`Заредени са ${loadedCount} запазени елемента от базата данни! `, 'success');
        } else {
            console.log(' No items found in database');
        }
    } catch (error) {
        console.error('Error loading drawn items:', error);
        showNotification('Грешка при зареждане от базата данни!', 'error');
    }
}

// Delete single item from database
async function deleteDrawnItem(layer) {
    if (!layer.databaseId) return;
    
    try {
        const response = await fetch(`/api/redesigns/${layer.databaseId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            console.log(`Deleted item ${layer.databaseId} from database`);
            return true;
        } else {
            console.error('Error deleting item:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        return false;
    }
}

// Clear all saved items from database
async function clearSavedItems() {
    try {
        const response = await fetch('/api/redesigns', {
            method: 'DELETE'
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            console.log('🗑️ Cleared all saved items from database');
            showNotification('Всички запазени елементи са изтрити от базата данни! 🗑️', 'success');
            
            // Clear from map as well
            if (drawnItems) {
                drawnItems.clearLayers();
            }
        } else {
            console.error('Error clearing items:', result.message);
            showNotification('Грешка при изтриване!', 'error');
        }
    } catch (error) {
        console.error('Error clearing saved items:', error);
        showNotification('Грешка при изтриване от базата данни!', 'error');
    }
}

function clearAllRedesigns() {
    if (drawnItems) {
        drawnItems.clearLayers();
        
        // Also remove boundary circle if it exists
        if (sofiaBoundaryCircle) {
            map.removeLayer(sofiaBoundaryCircle);
            sofiaBoundaryCircle = null;
        }
        
        // Also remove future development circle if it exists
        if (sofiaFutureCircle) {
            map.removeLayer(sofiaFutureCircle);
            sofiaFutureCircle = null;
        }
        
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
        
        showNotification('Всички слоеве са изчистени от картата. За изтриване от базата данни използвайте "Изтрий запазеното"', 'info');
        console.log('All redesigns and boundary circle cleared from current session');
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

// Toggle Sofia boundary circle
function toggleSofiaBoundaryCircle() {
    if (!map) {
        showNotification('Картата не е заредена', 'error');
        return;
    }
    
    if (sofiaBoundaryCircle) {
        // Remove existing boundary circle
        map.removeLayer(sofiaBoundaryCircle);
        sofiaBoundaryCircle = null;
        showNotification('Границите на София са скрити', 'info');
        return;
    }
    
    // Calculate approximate radius for Sofia (smaller visualization)
    // Using a reduced radius for better visual representation
    const sofiaAreaKm2 = 492;
    const radiusKm = Math.sqrt(sofiaAreaKm2 / Math.PI) * 0.75; // 25% smaller
    const radiusMeters = radiusKm * 1000;
    
    console.log(`Sofia boundary circle: radius = ${radiusKm.toFixed(1)} km (reduced for better visualization)`);
    
    // Create boundary circle
    sofiaBoundaryCircle = L.circle(SOFIA_CENTER, {
        radius: radiusMeters,
        color: '#e74c3c',
        weight: 3,
        opacity: 0.8,
        fillColor: '#e74c3c',
        fillOpacity: 0.1,
        dashArray: '15, 10'
    }).addTo(map);
    
    // Add popup with information
    sofiaBoundaryCircle.bindPopup(`
        <div style="text-align: center; min-width: 200px;">
            <h4>Граници на София</h4>
            <p>Компактна визуализация на столицата</p>
            <p><strong>Площ:</strong> ~492 км²</p>
            <p><strong>Радиус:</strong> ~${radiusKm.toFixed(1)} км</p>
            <p><strong>Население:</strong> 1.4М жители</p>
            <small>Намален размер за по-добра видимост</small>
        </div>
    `, { autoPan: false });
    
    showNotification(`Границите на София са показани! Радиус: ${radiusKm.toFixed(1)} км `, 'success');
}

// Toggle both boundary circles (current + future development)
function toggleBothBoundaryCircles() {
    if (!map) {
        showNotification('Картата не е заредена', 'error');
        return;
    }
    
    // Check if both circles exist
    const bothExist = sofiaBoundaryCircle && sofiaFutureCircle;
    
    if (bothExist) {
        // Remove both circles
        if (sofiaBoundaryCircle) {
            map.removeLayer(sofiaBoundaryCircle);
            sofiaBoundaryCircle = null;
        }
        if (sofiaFutureCircle) {
            map.removeLayer(sofiaFutureCircle);
            sofiaFutureCircle = null;
        }
        showNotification('Границите на София са скрити', 'info');
        return;
    }
    
    // Show both circles
    
    // 1. Create future development circle FIRST (lowest layer - RED)
    if (!sofiaFutureCircle) {
        const futureAreaKm2 = 800;
        const futureRadiusKm = Math.sqrt(futureAreaKm2 / Math.PI) * 0.85;
        const futureRadiusMeters = futureRadiusKm * 1000;
        
        sofiaFutureCircle = L.circle(SOFIA_CENTER, {
            radius: futureRadiusMeters,
            color: '#e74c3c',
            weight: 3,
            opacity: 0.7,
            fillColor: '#e74c3c',
            fillOpacity: 0.08,
            dashArray: '20, 15',
            pane: 'boundaryPane'
        }).addTo(map);
        
        sofiaFutureCircle.bindPopup(`
            <div style="text-align: center; min-width: 250px;">
                <h4>🚀 Бъдещо развитие на София</h4>
                <p>Планирано разширение до 2030-2040г.</p>
                <p><strong>Проектирана площ:</strong> ~800 км²</p>
                <p><strong>Радиус:</strong> ~${futureRadiusKm.toFixed(1)} км</p>
                <p><strong>Очаквано население:</strong> 1.8М жители</p>
                <div style="margin: 10px 0; padding: 10px; background: #ffeaea; border-radius: 5px; font-size: 0.9em;">
                    <strong>Включва:</strong><br>
                    • Нови жилищни комплекси<br>
                    • Разширени зелени зони<br>
                    • Подобрена инфраструктура<br>
                    • Интеграция със съседни градове
                </div>
                <small>Червен кръг - проектна визия</small>
            </div>
        `, { autoPan: false });
    }
    
    // 2. Create current boundary circle SECOND (higher layer - BLUE)
    if (!sofiaBoundaryCircle) {
        const sofiaAreaKm2 = 492;
        const radiusKm = Math.sqrt(sofiaAreaKm2 / Math.PI) * 0.75;
        const radiusMeters = radiusKm * 1000;
        
        sofiaBoundaryCircle = L.circle(SOFIA_CENTER, {
            radius: radiusMeters,
            color: '#3498db',
            weight: 3,
            opacity: 0.8,
            fillColor: '#3498db',
            fillOpacity: 0.1,
            dashArray: '15, 10',
            pane: 'boundaryPane'
        }).addTo(map);
        
        sofiaBoundaryCircle.bindPopup(`
            <div style="text-align: center; min-width: 250px;">
                <h4>🏙️ Настоящи граници на София</h4>
                <p>Текущата административна зона</p>
                <p><strong>Площ:</strong> ~492 км²</p>
                <p><strong>Радиус:</strong> ~${radiusKm.toFixed(1)} км</p>
                <p><strong>Население:</strong> 1.4М жители</p>
                <div style="margin: 10px 0; padding: 10px; background: #e3f2fd; border-radius: 5px; font-size: 0.9em; border-left: 4px solid #2196F3;">
                    <strong>Важно за статистики:</strong><br>
                    Само паркове добавени в този син кръг ще променят<br>
                    процентите зеленина и качеството на въздуха!
                </div>
                <small>Син кръг - настоящо състояние</small>
            </div>
        `, { autoPan: false });
    }
    
    showNotification('Показани са настоящите и бъдещите граници на София! ', 'success');
}

// Toggle Sofia future development circle
function toggleSofiaFutureCircle() {
    if (!map) {
        showNotification('Картата не е заредена', 'error');
        return;
    }
    
    if (sofiaFutureCircle) {
        // Remove existing future circle
        map.removeLayer(sofiaFutureCircle);
        sofiaFutureCircle = null;
        showNotification('Бъдещото развитие на София е скрито', 'info');
        return;
    }
    
    // Calculate larger radius for future development (projected growth to 2030-2040)
    // Estimated future area ~800 km² (expansion towards suburbs and satellite towns)
    const futureAreaKm2 = 800;
    const futureRadiusKm = Math.sqrt(futureAreaKm2 / Math.PI) * 0.85; // Slightly reduced for visualization
    const futureRadiusMeters = futureRadiusKm * 1000;
    
    console.log(`Sofia future development circle: radius = ${futureRadiusKm.toFixed(1)} km`);
    
    // Create future development circle
    sofiaFutureCircle = L.circle(SOFIA_CENTER, {
        radius: futureRadiusMeters,
        color: '#3498db',
        weight: 3,
        opacity: 0.7,
        fillColor: '#3498db',
        fillOpacity: 0.08,
        dashArray: '20, 15'
    }).addTo(map);
    
    // Add popup with future development information
    sofiaFutureCircle.bindPopup(`
        <div style="text-align: center; min-width: 250px;">
            <h4>Бъдещо развитие на София</h4>
            <p>Планирано разширение до 2030-2040г.</p>
            <p><strong>Проектирана площ:</strong> ~800 км²</p>
            <p><strong>Радиус:</strong> ~${futureRadiusKm.toFixed(1)} км</p>
            <p><strong>Очаквано население:</strong> 1.8М жители</p>
            <div style="margin: 10px 0; padding: 10px; background: #f0f8ff; border-radius: 5px; font-size: 0.9em;">
                <strong>Включва:</strong><br>
                • Нови жилищни комплекси<br>
                • Разширени зелени зони<br>
                • Подобрена инфраструктура<br>
                • Интеграция със съседни градове
            </div>
            <small>Проектна визия за развитие</small>
        </div>
    `, { autoPan: false });
    
    showNotification(`Бъдещото развитие на София е показано! Радиус: ${futureRadiusKm.toFixed(1)} км 🚀`, 'success');
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
        
        // Create map focused on Sofia with proper zoom and bounds
        map = L.map('map-canvas', {
            center: SOFIA_CENTER,
            zoom: 11,
            minZoom: 9,
            maxZoom: 15,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true
        });
        
        // Create custom panes for proper layering
        map.createPane('boundaryPane');
        map.getPane('boundaryPane').style.zIndex = 400; // Below overlay pane (500) but above tile pane (200)
        
        map.createPane('designPane');
        map.getPane('designPane').style.zIndex = 600; // Above overlay pane (500) and marker pane (600)
        
        // Set maximum bounds to restrict panning
        const sofiaRegionBounds = [
            [42.4, 22.8], // Southwest corner
            [42.9, 23.8]  // Northeast corner
        ];
        map.setMaxBounds(sofiaRegionBounds);
        map.fitBounds(sofiaRegionBounds);
        
        // Add tile layer (using Geoapify)
        const geoapifyKey = 'd67057512d7a41409604421a2e3e3411';
        L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${geoapifyKey}`, {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Initialize drawing functionality for Sofia redesign
        await initializeSofiaRedesign();
        
        // Automatically show boundary circles when map loads
        setTimeout(() => {
            toggleBothBoundaryCircles();
        }, 1000);
        
        // Update Sofia sidebar stats
        updateSofiaSidebarStats();
        
        // Show Sofia facts panel
        showSofiaFactsPanel();
        
        // Hide placeholder
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        console.log('Sofia redesign map loaded successfully');
        showNotification('Картата на София е заредена с реални данни!', 'success');
        
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
    
    // Create layer group for drawn items in design pane
    drawnItems = new L.FeatureGroup();
    drawnItems.options = { pane: 'designPane' };
    map.addLayer(drawnItems);
    
    console.log('DrawnItems initialized for design pane');
    
    // Add existing parks and green zones
    addExistingGreenZones();
    
    // Setup drawing controls
    setupDrawingControls();
    
    // Load previously saved items from localStorage
    setTimeout(() => {
        loadDrawnItems();
    }, 500); // Wait a bit for everything to initialize
    
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
    
    // Hide boundary circle popups when drawing zones
    map.on('draw:drawstart', function() {
        if (currentRedesignTool && currentRedesignTool.startsWith('zone-')) {
            if (sofiaBoundaryCircle) {
                sofiaBoundaryCircle.closePopup();
            }
            if (sofiaFutureCircle) {
                sofiaFutureCircle.closePopup();
            }
        }
    });
}

// Export new functions
window.setRedesignTool = setRedesignTool;
window.clearAllRedesigns = clearAllRedesigns;
window.loadMapWithRedesign = loadMapWithRedesign;
window.showRandomFact = showRandomFact;
window.toggleSofiaBoundaryCircle = toggleSofiaBoundaryCircle;
window.toggleSofiaFutureCircle = toggleSofiaFutureCircle;
window.toggleBothBoundaryCircles = toggleBothBoundaryCircles;
window.saveDrawnItems = saveDrawnItems;
window.loadDrawnItems = loadDrawnItems;
window.clearSavedItems = clearSavedItems;
window.selectZone = selectZone;
window.toggleZoneDropdown = toggleZoneDropdown;

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
        badges: ["Залесител"],
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
        badges: ["Велосипедист"],
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
        badges: ["Залесител"],
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
        badges: ["Рециклиращ"],
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
        badges: ["Залесител"],
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
    
    showNotification('Класацията е заредена!', 'success');
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
    
    // Initialize sponsors animations
    initializeSponsorsAnimations();
});

// ===============================================
// SPONSORS SECTION FUNCTIONALITY
// ===============================================

// Initialize sponsor animations and interactions
function initializeSponsorsAnimations() {
    console.log('Initializing sponsors animations...');
    
    // Animate stats numbers when sponsors section becomes visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('impact-stats')) {
                    animateImpactStats();
                }
                if (entry.target.classList.contains('sponsors-tier')) {
                    entry.target.style.animationPlayState = 'running';
                }
            }
        });
    }, { threshold: 0.3 });
    
    // Observe impact stats section
    const impactStats = document.querySelector('.impact-stats');
    if (impactStats) {
        observer.observe(impactStats);
    }
    
    // Observe sponsor tiers for staggered animation
    const sponsorTiers = document.querySelectorAll('.sponsors-tier');
    sponsorTiers.forEach(tier => {
        observer.observe(tier);
    });
    
    // Add hover effects to sponsor cards
    addSponsorCardEffects();
    
    // Initialize sponsor badge interactions
    initializeSponsorBadges();
}

// Animate impact statistics numbers
function animateImpactStats() {
    const statNumbers = document.querySelectorAll('.impact-stats .stat-number');
    
    statNumbers.forEach(statNumber => {
        const target = parseInt(statNumber.getAttribute('data-target')) || 0;
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        
        function updateNumber() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeOutCubic);
            
            // Format numbers with commas for large numbers
            if (target >= 1000) {
                statNumber.textContent = current.toLocaleString();
            } else {
                statNumber.textContent = current;
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                statNumber.textContent = target >= 1000 ? target.toLocaleString() : target;
            }
        }
        
        updateNumber();
    });
}

// Add interactive effects to sponsor cards
function addSponsorCardEffects() {
    const sponsorCards = document.querySelectorAll('.sponsor-card');
    
    sponsorCards.forEach(card => {
        // Add mouseenter effect
        card.addEventListener('mouseenter', function() {
            // Add subtle pulse animation to the logo
            const logo = this.querySelector('.sponsor-logo i');
            if (logo) {
                logo.style.animation = 'pulse 0.6s ease-in-out';
            }
            
            // Slightly increase brightness of contribution items
            const contributions = this.querySelectorAll('.contribution-item');
            contributions.forEach(item => {
                item.style.transform = 'translateX(5px)';
                item.style.transition = 'transform 0.3s ease';
            });
        });
        
        // Add mouseleave effect
        card.addEventListener('mouseleave', function() {
            const logo = this.querySelector('.sponsor-logo i');
            if (logo) {
                logo.style.animation = '';
            }
            
            const contributions = this.querySelectorAll('.contribution-item');
            contributions.forEach(item => {
                item.style.transform = '';
            });
        });
        
        // Add click effect for mobile
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Initialize sponsor badge interactions
function initializeSponsorBadges() {
    const badges = document.querySelectorAll('.sponsor-badges .badge');
    
    badges.forEach(badge => {
        badge.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Create ripple effect
            createRippleEffect(this, e);
            
            // Show badge info (you can customize this)
            showBadgeInfo(this);
        });
    });
}

// Create ripple effect for badge clicks
function createRippleEffect(element, event) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    // Add ripple animation keyframes if not already added
    if (!document.getElementById('ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Show badge information
function showBadgeInfo(badge) {
    const badgeText = badge.textContent;
    let message = '';
    
    switch(badgeText.toLowerCase()) {
        case 'премиум партньор':
            message = 'Премиум партньорите са най-големите поддръжници на нашата мисия';
            break;
        case 'верифициран':
            message = 'Верифицирани партньори с доказан принос към околната среда';
            break;
        case 'иновация':
            message = 'Партньори, които внасят иновативни еко решения';
            break;
        case 'стандартен партньор':
            message = 'Надеждни партньори с постоянен принос';
            break;
        case 'бронзов партньор':
            message = 'Нови партньори, които започват своето еко пътуване';
            break;
        default:
            message = 'Благодарим за подкрепата на еко инициативите';
    }
    
    // Create and show tooltip
    showTooltip(badge, message);
}

// Show tooltip function
function showTooltip(element, message) {
    // Remove existing tooltips
    document.querySelectorAll('.badge-tooltip').forEach(tooltip => tooltip.remove());
    
    const tooltip = document.createElement('div');
    tooltip.className = 'badge-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(45, 90, 39, 0.95);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 0.8rem;
        white-space: nowrap;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        max-width: 250px;
        white-space: normal;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (rect.bottom + 10) + 'px';
    
    // Animate in
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
        setTimeout(() => tooltip.remove(), 300);
    }, 3000);
}

// Functions for sponsor modal interactions
function showBecomeSponsorModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h3 style="color: #2d5a27; margin-bottom: 1.5rem;">Станете наш партньор</h3>
            <form id="sponsorForm">
                <div class="form-group">
                    <label>Име на компанията:</label>
                    <input type="text" name="company" required>
                </div>
                <div class="form-group">
                    <label>Контактен имейл:</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Телефон:</label>
                    <input type="tel" name="phone" required>
                </div>
                <div class="form-group">
                    <label>Тип партньорство:</label>
                    <select name="sponsorship-type" required>
                        <option value="">Изберете тип</option>
                        <option value="gold">Златно партньорство</option>
                        <option value="silver">Сре��ърно партньорство</option>
                        <option value="bronze">Бронзово партньорство</option>
                        <option value="custom">Персонализирано</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Съобщение:</label>
                    <textarea name="message" placeholder="Разкажете ни за вашата компания и как искате да подкрепите еко инициативите..." rows="4"></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                    <i class="fas fa-paper-plane"></i>
                    Изпрати заявка
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    modal.querySelector('#sponsorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show success message
        showSuccessMessage('Благодарим за интереса! Ще се свържем с вас скоро.');
        modal.remove();
    });
}

function showContactModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h3 style="color: #2d5a27; margin-bottom: 1.5rem;">Свържете се с нас</h3>
            <div style="text-align: center;">
                <div style="margin-bottom: 2rem;">
                    <i class="fas fa-envelope" style="font-size: 3rem; color: #7bc142; margin-bottom: 1rem;"></i>
                    <h4>Имейл</h4>
                    <p>partnerships@plantatree.bg</p>
                </div>
                <div style="margin-bottom: 2rem;">
                    <i class="fas fa-phone" style="font-size: 3rem; color: #7bc142; margin-bottom: 1rem;"></i>
                    <h4>Телефон</h4>
                    <p>+359 2 123 456</p>
                </div>
                <div style="margin-bottom: 2rem;">
                    <i class="fas fa-map-marker-alt" style="font-size: 3rem; color: #7bc142; margin-bottom: 1rem;"></i>
                    <h4>Адрес</h4>
                    <p>ул. "Витоша" 15, София 1000</p>
                </div>
                <button onclick="showBecomeSponsorModal(); this.closest('.modal').remove();" class="btn-primary">
                    <i class="fas fa-handshake"></i>
                    Станете партньор
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #7bc142, #8ed655);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(123, 193, 66, 0.3);
        z-index: 10000;
        font-weight: 600;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    successDiv.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
        ${message}
    `;
    
    document.body.appendChild(successDiv);
    
    // Animate in
    setTimeout(() => {
        successDiv.style.opacity = '1';
        successDiv.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transform = 'translateX(100px)';
        setTimeout(() => successDiv.remove(), 300);
    }, 5000);
}

// Add pulse animation keyframes for logos
if (!document.getElementById('pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'pulse-animation';
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.showBecomeSponsorModal = showBecomeSponsorModal;
window.showContactModal = showContactModal;

// ===============================================
// LANGUAGE SWITCHING FUNCTIONALITY
// ===============================================

// Initialize language on page load
function initializeLanguage() {
    // Get saved language from localStorage or default to Bulgarian
    const savedLanguage = localStorage.getItem('plantATreeLanguage') || 'bg';
    
    // Validate saved language
    if (savedLanguage !== 'bg' && savedLanguage !== 'en') {
        localStorage.setItem('plantATreeLanguage', 'bg');
        currentLanguage = 'bg';
    } else {
        currentLanguage = savedLanguage;
    }
    
    // Update language button text
    updateLanguageButton();
    
    // Set page language attribute
    document.documentElement.lang = currentLanguage;
    
    // Apply translations if not Bulgarian (default)
    if (currentLanguage !== 'bg') {
        setTimeout(() => {
            translatePage(currentLanguage);
        }, 100);
    }
    
    // Update page title
    updatePageTitle(currentLanguage);
    
    console.log('Language initialized:', currentLanguage);
}

// Detect if text is in Bulgarian
function isBulgarianText(text) {
    // Check for Bulgarian Cyrillic characters
    const bulgarianPattern = /[а-яА-Я]/;
    return bulgarianPattern.test(text);
}

// Smart language detection for mixed content
function detectContentLanguage(text) {
    if (!text || text.trim().length < 3) return 'unknown';
    
    const cleanText = text.trim();
    
    // Check for Cyrillic characters (Bulgarian)
    if (/[а-яА-Я]/.test(cleanText)) {
        return 'bg';
    }
    
    // Check for English patterns
    if (/^[a-zA-Z\s\d\.,!?'-]+$/.test(cleanText)) {
        return 'en';
    }
    
    return 'unknown';
}

// Update language preference and persist
function updateLanguagePreference(lang) {
    if (lang !== 'bg' && lang !== 'en') {
        console.warn('Invalid language:', lang);
        return false;
    }
    
    localStorage.setItem('plantATreeLanguage', lang);
    currentLanguage = lang;
    
    // Update page metadata
    document.documentElement.lang = lang;
    updatePageTitle(lang);
    
    return true;
}

// Get browser language preference as fallback
function getBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    if (browserLang) {
        const langCode = browserLang.substring(0, 2).toLowerCase();
        if (langCode === 'bg' || langCode === 'en') {
            return langCode;
        }
    }
    
    // Default to Bulgarian for Bulgarian users, English for others
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone && timezone.includes('Sofia')) {
        return 'bg';
    }
    
    return 'bg'; // Default to Bulgarian
}

// Toggle between Bulgarian and English
function toggleLanguage() {
    const newLanguage = currentLanguage === 'bg' ? 'en' : 'bg';
    switchLanguage(newLanguage);
}

// Switch to specific language
async function switchLanguage(targetLang) {
    if (targetLang === currentLanguage) return;
    
    console.log(`Switching language from ${currentLanguage} to ${targetLang}`);
    
    // Add loading class to language button
    const languageButton = document.getElementById('language-toggle');
    if (languageButton) {
        languageButton.classList.add('loading');
    }
    
    // Add translating class to body
    document.body.classList.add('language-switching');
    
    // Show loading notification
    const loadingMessage = targetLang === 'en' ? 
        'Switching to English...' : 
        'Превключване на български...';
    showNotification(loadingMessage, 'info');
    
    try {
        // Store language preference
        localStorage.setItem('plantATreeLanguage', targetLang);
        currentLanguage = targetLang;
        
        // Update language button
        updateLanguageButton();
        
        // Apply translations
        await translatePage(targetLang);
        
        // Remove loading states
        if (languageButton) {
            languageButton.classList.remove('loading');
        }
        document.body.classList.remove('language-switching');
        
        // Show success notification
        const successMessage = targetLang === 'en' ? 
            'Language switched to English! 🇺🇸' : 
            'Езикът е сменен на български! 🇧🇬';
        showNotification(successMessage, 'success');
        
        // Update page title based on language
        updatePageTitle(targetLang);
        
        // Update any chat system language
        updateChatLanguage(targetLang);
        
    } catch (error) {
        console.error('Language switch error:', error);
        
        // Remove loading states
        if (languageButton) {
            languageButton.classList.remove('loading');
        }
        document.body.classList.remove('language-switching');
        
        // Revert language preference
        currentLanguage = currentLanguage === 'bg' ? 'en' : 'bg';
        localStorage.setItem('plantATreeLanguage', currentLanguage);
        updateLanguageButton();
        
        showNotification('Error switching language', 'error');
    }
}

// Update page title based on language
function updatePageTitle(lang) {
    const titles = {
        'bg': 'PlantATree - Еко инициативи София | Засади дърво, опази природата',
        'en': 'PlantATree - Eco Initiatives Sofia | Plant a Tree, Preserve Nature'
    };
    
    if (titles[lang]) {
        document.title = titles[lang];
    }
}

// Update chat system language
function updateChatLanguage(lang) {
    const chatTitle = document.getElementById('chat-header');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    
    if (chatTitle) {
        chatTitle.textContent = lang === 'en' ? 'Eco Assistant' : 'Еко Асистент';
    }
    
    if (chatInput) {
        chatInput.placeholder = lang === 'en' ? 
            'Ask about eco initiatives...' : 
            'Попитай за еко инициативи...';
    }
    
    if (chatSend) {
        chatSend.textContent = lang === 'en' ? 'Send' : 'Изпрати';
    }
}

// Update language button appearance
function updateLanguageButton() {
    const languageText = document.getElementById('language-text');
    const languageButton = document.getElementById('language-toggle');
    
    if (languageText) {
        languageText.textContent = currentLanguage === 'bg' ? 'EN' : 'БГ';
    }
    
    if (languageButton) {
        languageButton.title = currentLanguage === 'bg' ? 
            'Switch to English' : 
            'Превключи на български';
    }
}

// Apply translations to the page
async function translatePage(targetLang) {
    console.log('Translating page to:', targetLang);
    
    // If target language is Bulgarian, use built-in translations
    if (targetLang === 'bg') {
        applyStaticTranslations(targetLang);
        return;
    }
    
    const langData = translations[targetLang];
    if (!langData) {
        console.error('Language data not found for:', targetLang);
        // Fallback to Google Translate API for unknown languages
        await translateWithGoogleAPI(targetLang);
        return;
    }
    
    // Update page language attribute
    document.documentElement.lang = targetLang;
    
    // Apply static translations first
    applyStaticTranslations(targetLang);
    
    // For English, also use Google Translate API for dynamic content
    if (targetLang === 'en') {
        await translateDynamicContent(targetLang);
    }
    
    console.log('Page translation completed for:', targetLang);
}

// Apply static translations from the translations object
function applyStaticTranslations(targetLang) {
    const langData = translations[targetLang];
    if (!langData) return;
    
    // PHASE 1: Translate elements with data-translate attributes (the recipe approach)
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    elementsToTranslate.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (langData[key]) {
            // Handle different element types
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = langData[key];
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = langData[key];
            } else {
                element.textContent = langData[key];
            }
        }
    });
    
    // PHASE 2: For elements without data-translate, use more specific selectors
    translateNavigationElements(langData);
    translateSectionTitles(langData);
    translateButtons(langData);
    translateForms(langData);
    translateStaticContent(langData);
    
    // PHASE 3: NUCLEAR OPTION - Universal text scanner (like Google Translate)
    performUniversalTextScan(targetLang);
}

// Translate dynamic content using Google Translate API
async function translateDynamicContent(targetLang) {
    if (targetLang === 'bg') return; // No need for Bulgarian
    
    try {
        // Collect dynamic content that might not be in static translations
        const dynamicElements = collectDynamicContent();
        
        if (dynamicElements.length === 0) return;
        
        console.log('Translating dynamic content with Google Translate API...');
        
        // Extract texts to translate
        const textsToTranslate = dynamicElements.map(item => item.text);
        
        // Call batch translation API
        const response = await fetch('/api/translate/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                texts: textsToTranslate,
                target_lang: targetLang,
                source_lang: 'bg'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.translations) {
            // Apply translations to elements
            result.translations.forEach((translation, index) => {
                if (translation.success && dynamicElements[index]) {
                    const element = dynamicElements[index].element;
                    const property = dynamicElements[index].property;
                    
                    if (property === 'textContent') {
                        element.textContent = translation.translated;
                    } else if (property === 'placeholder') {
                        element.placeholder = translation.translated;
                    } else if (property === 'innerHTML') {
                        // Preserve HTML structure, only replace text
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = element.innerHTML;
                        const textNodes = getTextNodes(tempDiv);
                        if (textNodes.length === 1) {
                            element.innerHTML = element.innerHTML.replace(
                                textNodes[0].textContent, 
                                translation.translated
                            );
                        }
                    }
                }
            });
            
            console.log(`Dynamic content translated: ${result.successful_count}/${result.total_count} items`);
        } else {
            console.warn('Dynamic translation failed:', result.error);
        }
        
    } catch (error) {
        console.error('Dynamic translation error:', error);
    }
}

// Collect dynamic content that needs translation
function collectDynamicContent() {
    const dynamicElements = [];
    
    // Eco actions feed content
    const ecoPostTitles = document.querySelectorAll('.eco-post h3');
    ecoPostTitles.forEach(title => {
        if (title.textContent && title.textContent.trim()) {
            dynamicElements.push({
                element: title,
                text: title.textContent.trim(),
                property: 'textContent'
            });
        }
    });
    
    // Eco actions descriptions
    const ecoPostDescriptions = document.querySelectorAll('.eco-post .post-content p');
    ecoPostDescriptions.forEach(desc => {
        if (desc.textContent && desc.textContent.trim() && desc.textContent.length > 10) {
            dynamicElements.push({
                element: desc,
                text: desc.textContent.trim(),
                property: 'textContent'
            });
        }
    });
    
    // Location names and descriptions from map markers
    const mapPopups = document.querySelectorAll('.leaflet-popup-content h4, .leaflet-popup-content p');
    mapPopups.forEach(popup => {
        if (popup.textContent && popup.textContent.trim() && !popup.textContent.includes('км') && !popup.textContent.includes('хектар')) {
            dynamicElements.push({
                element: popup,
                text: popup.textContent.trim(),
                property: 'textContent'
            });
        }
    });
    
    // Sponsor content
    const sponsorDescriptions = document.querySelectorAll('.sponsor-description');
    sponsorDescriptions.forEach(desc => {
        if (desc.textContent && desc.textContent.trim()) {
            dynamicElements.push({
                element: desc,
                text: desc.textContent.trim(),
                property: 'textContent'
            });
        }
    });
    
    // Leaderboard user names (only if they look like Bulgarian names)
    const userNames = document.querySelectorAll('.podium-info h4, .ranking-info h5');
    userNames.forEach(name => {
        const nameText = name.textContent.trim();
        if (nameText && nameText.includes('ова') || nameText.includes('ев') || nameText.includes('ски')) {
            // Skip translating names - they should remain as is
        }
    });
    
    return dynamicElements;
}

// Get all text nodes from an element
function getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim()) {
            textNodes.push(node);
        }
    }
    
    return textNodes;
}

// Fallback translation using Google Translate API for any language
async function translateWithGoogleAPI(targetLang) {
    try {
        console.log('Using Google Translate API for language:', targetLang);
        
        // Collect all translatable content
        const pageContent = collectAllPageContent();
        
        if (pageContent.length === 0) return;
        
        // Show loading notification
        showNotification('Translating page content...', 'info');
        
        // Call batch translation API
        const response = await fetch('/api/translate/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                texts: pageContent.map(item => item.text),
                target_lang: targetLang,
                source_lang: 'bg'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.translations) {
            // Apply translations
            result.translations.forEach((translation, index) => {
                if (translation.success && pageContent[index]) {
                    const element = pageContent[index].element;
                    const property = pageContent[index].property;
                    
                    if (property === 'textContent') {
                        element.textContent = translation.translated;
                    } else if (property === 'placeholder') {
                        element.placeholder = translation.translated;
                    }
                }
            });
            
            showNotification(`Page translated! ${result.successful_count}/${result.total_count} items`, 'success');
        } else {
            throw new Error(result.error || 'Translation failed');
        }
        
    } catch (error) {
        console.error('Google Translate API error:', error);
        showNotification('Translation failed. Using fallback.', 'warning');
    }
}

// Collect all page content for translation
function collectAllPageContent() {
    const content = [];
    
    // Collect various text elements
    const selectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p:not(.skip-translate)',
        '.nav-link',
        '.btn-login', '.btn-register',
        '.stat-label',
        'button:not(.skip-translate)',
        'label',
        '.section-header p',
        '.hero-content p'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const text = element.textContent ? element.textContent.trim() : '';
            if (text && text.length > 2 && !text.match(/^\d+$/) && !text.match(/^\d+[%км²]+$/)) {
                content.push({
                    element: element,
                    text: text,
                    property: 'textContent'
                });
            }
        });
    });
    
    // Collect placeholders
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
        if (input.placeholder && input.placeholder.trim()) {
            content.push({
                element: input,
                text: input.placeholder.trim(),
                property: 'placeholder'
            });
        }
    });
    
    return content;
}

// Translate navigation elements
function translateNavigationElements(langData) {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const navTranslations = [
        'nav_home', 'nav_map', 'nav_feed', 'nav_air', 
        'nav_leaderboard', 'nav_sponsors', 'nav_profile'
    ];
    
    navLinks.forEach((link, index) => {
        if (navTranslations[index] && langData[navTranslations[index]]) {
            link.textContent = langData[navTranslations[index]];
        }
    });
    
    // Auth buttons
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    
    if (loginBtn && langData.btn_login) {
        loginBtn.textContent = langData.btn_login;
    }
    if (registerBtn && langData.btn_register) {
        registerBtn.textContent = langData.btn_register;
    }
}

// Translate section titles and subtitles
function translateSectionTitles(langData) {
    // Hero section
    const heroTitle = document.querySelector('.hero-content h1');
    const heroSubtitle = document.querySelector('.hero-content p');
    
    if (heroTitle && langData.hero_title) {
        heroTitle.textContent = langData.hero_title;
    }
    if (heroSubtitle && langData.hero_subtitle) {
        heroSubtitle.textContent = langData.hero_subtitle;
    }
    
    // Section headers
    const sectionHeaders = document.querySelectorAll('.section-header h2');
    const sectionTitleKeys = [
        'map_title', 'feed_title', 'air_title', 
        'leaderboard_title', 'profile_title'
    ];
    
    sectionHeaders.forEach((header, index) => {
        const icon = header.querySelector('i');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        const key = sectionTitleKeys[index];
        
        if (key && langData[key]) {
            header.innerHTML = iconHTML + langData[key];
        }
    });
    
    // Section subtitles
    const sectionSubtitles = document.querySelectorAll('.section-header p');
    const subtitleKeys = [
        'map_subtitle', 'feed_subtitle', 'air_subtitle', 'leaderboard_subtitle'
    ];
    
    sectionSubtitles.forEach((subtitle, index) => {
        const key = subtitleKeys[index];
        if (key && langData[key]) {
            subtitle.textContent = langData[key];
        }
    });
}

// Translate buttons
function translateButtons(langData) {
    // Hero buttons
    const exploreMapBtn = document.querySelector('.hero-buttons .btn-primary:first-child');
    const ecoActionsBtn = document.querySelector('.hero-buttons .btn-primary:last-child');
    
    if (exploreMapBtn && langData.btn_explore_map) {
        const icon = exploreMapBtn.querySelector('i');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        exploreMapBtn.innerHTML = iconHTML + langData.btn_explore_map;
    }
    
    if (ecoActionsBtn && langData.btn_eco_actions) {
        const icon = ecoActionsBtn.querySelector('i');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        ecoActionsBtn.innerHTML = iconHTML + langData.btn_eco_actions;
    }
    
    // Add Action button
    const addActionBtn = document.querySelector('button[onclick*="showAddActionModal"]');
    if (addActionBtn && langData.btn_add_action) {
        const icon = addActionBtn.querySelector('i');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        addActionBtn.innerHTML = iconHTML + langData.btn_add_action;
    }
    
    // Chat button
    const chatButton = document.getElementById('chat-button');
    if (chatButton && langData.chat_button) {
        chatButton.textContent = langData.chat_button;
    }
}

// Translate forms
function translateForms(langData) {
    // Modal titles
    const modalTitles = document.querySelectorAll('.modal-content h3');
    modalTitles.forEach(title => {
        const text = title.textContent.trim();
        if (text.includes('Добави нова локация') && langData.modal_add_location) {
            title.textContent = langData.modal_add_location;
        } else if (text.includes('Добави еко действие') && langData.modal_add_action) {
            title.textContent = langData.modal_add_action;
        } else if (text.includes('Вход') && langData.login_title) {
            title.textContent = langData.login_title;
        } else if (text.includes('Регистрация') && langData.register_title) {
            title.textContent = langData.register_title;
        }
    });
    
    // Form labels and placeholders
    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        const text = label.textContent.trim();
        if (text.includes('Имейл') && langData.email_label) {
            label.textContent = langData.email_label;
        } else if (text.includes('Парола') && !text.includes('Повтори') && langData.password_label) {
            label.textContent = langData.password_label;
        } else if (text.includes('Потребителско име') && langData.username_label) {
            label.textContent = langData.username_label;
        } else if (text.includes('Повтори парола') && langData.confirm_password_label) {
            label.textContent = langData.confirm_password_label;
        }
    });
    
    // Placeholders
    const placeholders = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    placeholders.forEach(input => {
        const placeholder = input.placeholder;
        if (placeholder.includes('локация') && langData.form_location_name) {
            input.placeholder = langData.form_location_name;
        } else if (placeholder.includes('Описание') && langData.form_description) {
            input.placeholder = langData.form_description;
        } else if (placeholder.includes('Заглавие') && langData.form_action_title) {
            input.placeholder = langData.form_action_title;
        } else if (placeholder.includes('Опиши') && langData.form_action_description) {
            input.placeholder = langData.form_action_description;
        } else if (placeholder.includes('Локация') && langData.form_location) {
            input.placeholder = langData.form_location;
        } else if (placeholder.includes('еко инициативи') && langData.chat_placeholder) {
            input.placeholder = langData.chat_placeholder;
        }
    });
    
    // Translate select options
    translateSelectOptions(langData);
}

// Translate select dropdown options
function translateSelectOptions(langData) {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        const options = select.querySelectorAll('option');
        
        options.forEach(option => {
            const text = option.textContent.trim();
            
            // Location type options
            if (text === 'Избери тип' && langData.form_type) {
                option.textContent = langData.form_type;
            } else if (text === 'Парк') {
                option.textContent = currentLanguage === 'en' ? 'Park' : 'Парк';
            } else if (text === 'Еко пътека') {
                option.textContent = currentLanguage === 'en' ? 'Eco Trail' : 'Еко пътека';
            } else if (text === 'Велоалея') {
                option.textContent = currentLanguage === 'en' ? 'Bike Lane' : 'Велоалея';
            } else if (text === 'Място за засаждане') {
                option.textContent = currentLanguage === 'en' ? 'Planting Area' : 'Място за засаждане';
            }
            
            // Action type options
            else if (text === 'Засаждане на дърво') {
                option.textContent = currentLanguage === 'en' ? 'Tree Planting' : 'Засаждане на дърво';
            } else if (text === 'Почистване') {
                option.textContent = currentLanguage === 'en' ? 'Cleanup' : 'Почистване';
            } else if (text === 'Каране на колело') {
                option.textContent = currentLanguage === 'en' ? 'Cycling' : 'Каране на колело';
            } else if (text === 'Рециклиране') {
                option.textContent = currentLanguage === 'en' ? 'Recycling' : 'Рециклиране';
            }
            
            // Location selector options
            else if (text === 'София Център') {
                option.textContent = currentLanguage === 'en' ? 'Sofia Center' : 'София Център';
            } else if (text === 'София Лозенец') {
                option.textContent = currentLanguage === 'en' ? 'Sofia Lozenets' : 'София Лозенец';
            } else if (text === 'София Студентски град') {
                option.textContent = currentLanguage === 'en' ? 'Sofia Studentski Grad' : 'София Студентски град';
            } else if (text === 'София Дружба') {
                option.textContent = currentLanguage === 'en' ? 'Sofia Druzhba' : 'София Дружба';
            } else if (text === 'София Люлин') {
                option.textContent = currentLanguage === 'en' ? 'Sofia Lyulin' : 'София Люлин';
            }
        });
    });
}

// Translate static content
function translateStaticContent(langData) {
    // Stats labels
    const statLabels = document.querySelectorAll('.stat-label');
    const statKeys = ['stat_green_zones', 'stat_trees_planted', 'stat_active_users'];
    
    statLabels.forEach((label, index) => {
        if (statKeys[index] && langData[statKeys[index]]) {
            label.textContent = langData[statKeys[index]];
        }
    });
    
    // Sofia sidebar stats
    const sidebarLabels = document.querySelectorAll('.sidebar-stat-item .stat-label');
    const sidebarKeys = [
        'sidebar_greenery', 'sidebar_parks', 'sidebar_population', 
        'sidebar_area', 'sidebar_green_zones', 'sidebar_air_quality'
    ];
    
    sidebarLabels.forEach((label, index) => {
        if (sidebarKeys[index] && langData[sidebarKeys[index]]) {
            label.textContent = langData[sidebarKeys[index]];
        }
    });
    
    // Charity section
    const charityTitle = document.querySelector('.charity-content h4');
    const charityText = document.querySelector('.charity-content p');
    
    if (charityTitle && langData.charity_title) {
        charityTitle.textContent = langData.charity_title;
    }
    if (charityText && langData.charity_text) {
        charityText.textContent = langData.charity_text;
    }
    
    // Weather conditions
    const weatherTitle = document.querySelector('.weather-card h3');
    if (weatherTitle && langData.weather_conditions) {
        const icon = weatherTitle.querySelector('i');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        weatherTitle.innerHTML = iconHTML + langData.weather_conditions;
    }
    
    // Health recommendations
    const healthTitle = document.querySelector('.health-recommendations h3');
    if (healthTitle && langData.health_recommendations) {
        const icon = healthTitle.querySelector('i');
        const iconHTML = icon ? icon.outerHTML + ' ' : '';
        healthTitle.innerHTML = iconHTML + langData.health_recommendations;
    }
    
    // Translate tool names in redesign panel
    translateRedesignTools(langData);
    
    // Translate leaderboard content
    translateLeaderboardContent(langData);
    
    // Update air quality status text
    updateAirQualityTexts(langData);
    
    // Update leaderboard dynamic content
    updateLeaderboardTexts(langData);
    
    // Update sponsors content
    updateSponsorsTexts(langData);
}

// Translate redesign tools
function translateRedesignTools(langData) {
    const toolButtons = document.querySelectorAll('.redesign-tool');
    
    toolButtons.forEach(button => {
        const text = button.textContent.trim();
        
        if (text.includes('Селектиране')) {
            button.innerHTML = button.innerHTML.replace('Селектиране', langData.tool_selection || 'Selection');
        } else if (text.includes('Парк')) {
            button.innerHTML = button.innerHTML.replace('Парк', langData.tool_park || 'Park');
        } else if (text.includes('Алея/Улица')) {
            button.innerHTML = button.innerHTML.replace('Алея/Улица', langData.tool_alley || 'Street/Alley');
        } else if (text.includes('Зелена зона')) {
            button.innerHTML = button.innerHTML.replace('Зелена зона', langData.tool_green_zone || 'Green Zone');
        } else if (text.includes('Велоалея')) {
            button.innerHTML = button.innerHTML.replace('Велоалея', langData.tool_bike_lane || 'Bike Lane');
        } else if (text.includes('Зони')) {
            button.innerHTML = button.innerHTML.replace('Зони', langData.tool_zones || 'Zones');
        } else if (text.includes('Граници')) {
            button.innerHTML = button.innerHTML.replace('Граници', langData.tool_boundaries || 'Boundaries');
        } else if (text.includes('Изчисти всичко')) {
            button.innerHTML = button.innerHTML.replace('Изчисти всичко', langData.tool_clear || 'Clear All');
        }
    });
    
    // Translate zone dropdown options
    const zoneOptions = document.querySelectorAll('.zone-option');
    zoneOptions.forEach(option => {
        const text = option.textContent.trim();
        
        if (text.includes('Жилищна зона')) {
            option.innerHTML = option.innerHTML.replace('Жилищна зона', currentLanguage === 'en' ? 'Residential Zone' : 'Жилищна зона');
        } else if (text.includes('Търговска зона')) {
            option.innerHTML = option.innerHTML.replace('Търговска зона', currentLanguage === 'en' ? 'Commercial Zone' : 'Търговска зона');
        } else if (text.includes('Индустриална зона')) {
            option.innerHTML = option.innerHTML.replace('Индустриална зона', currentLanguage === 'en' ? 'Industrial Zone' : 'Индустриална зона');
        } else if (text.includes('Офис зона')) {
            option.innerHTML = option.innerHTML.replace('Офис зона', currentLanguage === 'en' ? 'Office Zone' : 'Офис зона');
        } else if (text.includes('Смесена зона')) {
            option.innerHTML = option.innerHTML.replace('Смесена зона', currentLanguage === 'en' ? 'Mixed Zone' : 'Смесена зона');
        } else if (text.includes('Обществена зона')) {
            option.innerHTML = option.innerHTML.replace('Обществена зона', currentLanguage === 'en' ? 'Public Zone' : 'Обществена зона');
        }
    });
    
    // Translate save controls
    const saveControls = document.querySelectorAll('.save-controls button');
    saveControls.forEach(button => {
        const text = button.textContent.trim();
        
        if (text.includes('Запази')) {
            button.innerHTML = button.innerHTML.replace('Запази', langData.btn_save || 'Save');
        } else if (text.includes('Зареди')) {
            button.innerHTML = button.innerHTML.replace('Зареди', langData.btn_load || 'Load');
        } else if (text.includes('Изтрий запазеното')) {
            button.innerHTML = button.innerHTML.replace('Изтрий запазеното', langData.btn_delete_saved || 'Delete Saved');
        }
    });
}

// Translate leaderboard content
function translateLeaderboardContent(langData) {
    // Translate filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        const text = button.textContent.trim();
        
        if (text === 'Всички') {
            button.textContent = langData.filter_all || 'All';
        } else if (text === 'Този месец') {
            button.textContent = langData.filter_this_month || 'This Month';
        } else if (text === 'Дървета') {
            button.innerHTML = (currentLanguage === 'en' ? '🌳 Trees' : '🌳 Дървета');
        } else if (text === 'Почистване') {
            button.innerHTML = (currentLanguage === 'en' ? '🧹 Cleanup' : '🧹 Почистване');
        } else if (text === 'Велосипед') {
            button.innerHTML = (currentLanguage === 'en' ? '🚴 Bicycle' : '🚴 Велосипед');
        }
    });
    
    // Translate stat labels in leaderboard
    const statLabels = document.querySelectorAll('.stat-label');
    statLabels.forEach(label => {
        const text = label.textContent.trim();
        
        if (text === 'Активни потребители') {
            label.textContent = langData.total_users || 'Active Users';
        } else if (text === 'Общо действия') {
            label.textContent = langData.total_actions || 'Total Actions';
        } else if (text === 'Общо точки') {
            label.textContent = langData.total_points || 'Total Points';
        } else if (text === 'Точки') {
            label.textContent = langData.profile_points || 'Points';
        } else if (text === 'Действия') {
            label.textContent = langData.profile_actions || 'Actions';
        } else if (text === 'Баджове') {
            label.textContent = langData.profile_badges || 'Badges';
        }
    });
}

// Translate error messages and validation
function translateErrorMessages(langData) {
    // Common error message translations
    const errorMessages = {
        'bg': {
            'required_field': 'Това поле е задължително',
            'invalid_email': 'Невалиден имейл адрес',
            'password_mismatch': 'Паролите не съвпадат',
            'connection_error': 'Грешка при връзката със сървъра',
            'file_too_large': 'Файлът е твърде голям',
            'invalid_file_type': 'Невалиден тип файл'
        },
        'en': {
            'required_field': 'This field is required',
            'invalid_email': 'Invalid email address',
            'password_mismatch': 'Passwords do not match',
            'connection_error': 'Server connection error',
            'file_too_large': 'File is too large',
            'invalid_file_type': 'Invalid file type'
        }
    };
    
    return errorMessages[currentLanguage] || errorMessages['bg'];
}

// Update air quality specific texts
function updateAirQualityTexts(langData) {
    // Update AQI status if it shows "Good"
    const aqiStatus = document.getElementById('aqi-status');
    if (aqiStatus && aqiStatus.textContent.includes('Добро')) {
        aqiStatus.textContent = langData.air_quality_good || 'Good';
    }
    
    // Update last updated time format
    const lastUpdated = document.getElementById('last-updated');
    if (lastUpdated && langData.last_updated) {
        const timeMatch = lastUpdated.textContent.match(/(\d{2}:\d{2}:\d{2})/);
        if (timeMatch) {
            lastUpdated.innerHTML = `<span>${langData.last_updated}</span>: ${timeMatch[1]}`;
        }
    }
    
    // Update health recommendations content
    const healthRec = document.getElementById('health-recommendations');
    if (healthRec) {
        const currentText = healthRec.textContent;
        if (currentText.includes('Въздухът е чист')) {
            healthRec.innerHTML = `
                <p>${langData.air_clean_safe || 'The air is clean and safe for all activities.'}</p>
                <p>${langData.perfect_outdoor || 'Perfect time for outdoor sports and walks.'}</p>
            `;
        }
    }
}

// Update leaderboard specific texts
function updateLeaderboardTexts(langData) {
    // Update badge texts in leaderboard that don't have data-translate attributes
    const badges = document.querySelectorAll('.badge:not([data-translate])');
    badges.forEach(badge => {
        const text = badge.textContent.trim();
        switch(text) {
            case 'Еко герой':
                badge.textContent = langData.eco_hero_badge || 'Eco Hero';
                break;
            case 'Майстор дървета':
                badge.textContent = langData.tree_master_badge || 'Tree Master';
                break;
            case 'Велосипедист':
                badge.textContent = langData.cyclist_badge || 'Cyclist';
                break;
            case 'Почистител':
                badge.textContent = langData.cleaner_badge || 'Cleaner';
                break;
            case 'Еко активист':
                badge.textContent = langData.eco_activist_badge || 'Eco Activist';
                break;
            case 'Еко ентусиаст':
                badge.textContent = langData.eco_enthusiast_badge || 'Eco Enthusiast';
                break;
            case 'Еко новак':
                badge.textContent = langData.eco_newbie_badge || 'Eco Newbie';
                break;
        }
    });
}

// Update sponsors specific texts
function updateSponsorsTexts(langData) {
    // Update sponsor type texts that don't have data-translate attributes
    const sponsorTypes = document.querySelectorAll('.sponsor-type:not([data-translate])');
    sponsorTypes.forEach(type => {
        const text = type.textContent.trim();
        switch(text) {
            case 'Еко технологии':
                type.textContent = langData.eco_technologies || 'Eco Technologies';
                break;
            case 'Соларни решения':
                type.textContent = langData.solar_solutions || 'Solar Solutions';
                break;
            case 'Рециклиране':
                type.textContent = langData.recycling || 'Recycling';
                break;
            case 'Градска мобилност':
                type.textContent = langData.urban_mobility || 'Urban Mobility';
                break;
            case 'Пречистване на вода':
                type.textContent = langData.water_purification || 'Water Purification';
                break;
            case 'Търговски център':
                type.textContent = langData.shopping_center || 'Shopping Center';
                break;
            case 'Био храни':
                type.textContent = langData.organic_food || 'Organic Food';
                break;
            case 'Електромобили':
                type.textContent = langData.electric_vehicles || 'Electric Vehicles';
                break;
            case 'Еко строителство':
                type.textContent = langData.eco_construction || 'Eco Construction';
                break;
        }
    });
    
    // Update partnership badges that don't have data-translate attributes
    const partnerBadges = document.querySelectorAll('.sponsor-badges .badge:not([data-translate])');
    partnerBadges.forEach(badge => {
        const text = badge.textContent.trim();
        switch(text) {
            case 'Премиум партньор':
                badge.textContent = langData.premium_partner || 'Premium Partner';
                break;
            case 'Верифициран':
                badge.textContent = langData.verified_badge || 'Verified';
                break;
            case 'Иновация':
                badge.textContent = langData.innovation_badge || 'Innovation';
                break;
            case 'Стандартен партньор':
                badge.textContent = langData.standard_partner || 'Standard Partner';
                break;
            case 'Бронзов партньор':
                badge.textContent = langData.bronze_partner || 'Bronze Partner';
                break;
        }
    });
}

// 🚀 UNIVERSAL TEXT SCANNER - The Google Translate Extension Approach
// This function scans ALL text on the page like a browser extension would
function performUniversalTextScan(targetLang) {
    console.log('🔍 Starting Universal Text Scan - Finding ALL text like Google Translate...');
    
    // Create comprehensive Bulgarian -> English mapping
    const universalTranslations = createUniversalTranslationMap();
    
    if (targetLang !== 'en') {
        console.log('Universal scan only works for EN translation currently');
        return;
    }
    
    // Find ALL text nodes in the document (like Google Translate does)
    const textNodes = getAllTextNodes(document.body);
    
    let translationsApplied = 0;
    
    textNodes.forEach(node => {
        const originalText = node.textContent.trim();
        
        // Skip if:
        // - Empty text
        // - Already processed
        // - Only numbers/symbols
        // - Script or style tags
        if (!originalText || 
            originalText.length < 2 || 
            /^[\d\s\.\,\-\+\%\(\)]*$/.test(originalText) ||
            node.parentElement.tagName === 'SCRIPT' ||
            node.parentElement.tagName === 'STYLE' ||
            node.parentElement.classList.contains('skip-translate')) {
            return;
        }
        
        // Check if we have a translation for this text
        const translation = universalTranslations[originalText];
        if (translation) {
            node.textContent = translation;
            translationsApplied++;
            console.log(`✅ Translated: "${originalText}" → "${translation}"`);
        } else {
            // Log untranslated text for debugging
            console.log(`❌ Missing translation for: "${originalText}"`);
        }
    });
    
    console.log(`🎯 Universal scan complete! Applied ${translationsApplied} translations`);
}

// Get all text nodes in the document (like browser extensions do)
function getAllTextNodes(element) {
    const textNodes = [];
    
    // Use TreeWalker to efficiently traverse all text nodes
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip whitespace-only nodes
                if (/^\s*$/.test(node.textContent)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    return textNodes;
}

// Create comprehensive translation mapping for universal scanner
function createUniversalTranslationMap() {
    return {
        // Navigation and main sections
        'Начало': 'Home',
        'Карта': 'Map',
        'Еко действия': 'Eco Actions',
        'Въздух': 'Air Quality',
        'Класация': 'Leaderboard',
        'Спонсори': 'Sponsors',
        'Профил': 'Profile',
        'Вход': 'Login',
        'Регистрация': 'Register',
        
        // Hero section
        'Помогни да направим София по-зелена': 'Help Make Sofia Greener',
        'Платформа за картиране на зелени зони, еко пътеки и споделяне на еко инициативи в България': 'Platform for mapping green zones, eco trails and sharing eco initiatives in Bulgaria',
        'Разгледай картата': 'Explore Map',
        'Зелени зони': 'Green Zones',
        'Засадени дървета': 'Trees Planted',
        'Активни потребители': 'Active Users',
        
        // Map section
        'Карта на зелените зони': 'Green Zones Map',
        'Открий паркове, еко пътеки и велоалеи в София': 'Discover parks, eco trails and bike lanes in Sofia',
        'Инструменти за преустройване на София': 'Sofia Redesign Tools',
        'Промените се запазват автоматично в базата данни': 'Changes are automatically saved to the database',
        'Селектиране': 'Selection',
        'Парк': 'Park',
        'Алея/Улица': 'Street/Alley',
        'Зелена зона': 'Green Zone',
        'Велоалея': 'Bike Lane',
        'Зони': 'Zones',
        'Граници': 'Boundaries',
        'Изчисти всичко': 'Clear All',
        'Запази': 'Save',
        'Зареди': 'Load',
        'Изтрий запазеното': 'Delete Saved',
        'Избран инструмент: Селектиране област': 'Selected tool: Area Selection',
        'Кликнете и влачете върху картата за да селектирате област за преустройство. Промените са временни.': 'Click and drag on the map to select area for redesign. Changes are temporary.',
        'Кликнете "Покажи карта" за да заредите интерактивната карта': 'Click "Show Map" to load the interactive map',
        'Покажи карта на София': 'Show Sofia Map',
        
        // Zone options
        'Жилищна зона': 'Residential Zone',
        'Търговска зона': 'Commercial Zone',
        'Индустриална зона': 'Industrial Zone',
        'Офис зона': 'Office Zone',
        'Смесена зона': 'Mixed Zone',
        'Обществена зона': 'Public Zone',
        
        // Filters and sidebar
        'Филтри': 'Filters',
        'Паркове': 'Parks',
        'Еко пътеки': 'Eco Trails',
        'Велоалеи': 'Bike Lanes',
        'Места за засаждане': 'Planting Areas',
        'София': 'Sofia',
        'Зеленина': 'Greenery',
        'Население': 'Population',
        'Площ': 'Area',
        'Качество въздух': 'Air Quality',
        
        // Facts panel
        'Знаете ли, че...': 'Did you know...',
        'нов факт': 'new fact',
        'Зареждане на интересни факти за София...': 'Loading interesting facts about Sofia...',
        'Градът има най-много минерални извори в Европа': 'The city has the most mineral springs in Europe',
        
        // Air Quality section
        'Качество на въздуха': 'Air Quality',
        'Данни в реално време за въздушното качество в София': 'Real-time air quality data for Sofia',
        'София Център': 'Sofia Center',
        'Последно обновяване': 'Last updated',
        'Добро': 'Good',
        'Метеорологични условия': 'Weather Conditions',
        'Температура': 'Temperature',
        'Влажност': 'Humidity',
        'Вятър': 'Wind',
        'Видимост': 'Visibility',
        'Препоръки за здравето': 'Health Recommendations',
        'Въздухът е чист и безопасен за всички дейности.': 'The air is clean and safe for all activities.',
        'Идеално време за спорт на открито и разходки.': 'Perfect time for outdoor sports and walks.',
        '24-часова тенденция': '24-hour Trend',
        'Тенденция на AQI за последните 24 часа': 'AQI trend for the last 24 hours',
        'Избери локация': 'Select Location',
        'Моята локация': 'My Location',
        
        // Leaderboard
        'Топ еко герои на София': 'Top eco heroes of Sofia',
        'Общо действия': 'Total Actions',
        'Общо точки': 'Total Points',
        'Позиция': 'Position',
        'Потребител': 'User',
        'Точки': 'Points',
        'Действия': 'Actions',
        'Баджове': 'Badges',
        'Еко герой': 'Eco Hero',
        'Майстор дървета': 'Tree Master',
        'Велосипедист': 'Cyclist',
        'Почистител': 'Cleaner',
        'Еко активист': 'Eco Activist',
        'Еко ентусиаст': 'Eco Enthusiast',
        'Еко новак': 'Eco Newbie',
        'Всички': 'All',
        'Този месец': 'This Month',
        'Дървета': 'Trees',
        'Почистване': 'Cleanup',
        'Велосипед': 'Bicycle',
        'Твоята позиция': 'Your Position',
        
        // Feed section
        'Споделете вашите еко инициативи с общността': 'Share your eco initiatives with the community',
        'Благотворителност': 'Charity',
        'За всеки 500 събрани точки от общността дарявame 1 лв. за залесяване и опазване на природата!': 'For every 500 points collected by the community, we donate 1 BGN for tree planting and nature conservation!',
        'Добави действие': 'Add Action',
        
        // Sponsors section
        'Нашите спонсори': 'Our Sponsors',
        'Компании, които подкрепят зелената мисия на София': 'Companies supporting Sofia\'s green mission',
        'Златни партньори': 'Gold Partners',
        'Сребърни партньори': 'Silver Partners',
        'Корпоративни партньори': 'Corporate Partners',
        'Еко технологии': 'Eco Technologies',
        'Соларни решения': 'Solar Solutions',
        'Рециклиране': 'Recycling',
        'Градска мобилност': 'Urban Mobility',
        'Пречистване на вода': 'Water Purification',
        'Търговски център': 'Shopping Center',
        'Био храни': 'Organic Food',
        'Електромобили': 'Electric Vehicles',
        'Еко строителство': 'Eco Construction',
        'Премиум партньор': 'Premium Partner',
        'Верифициран': 'Verified',
        'Иновация': 'Innovation',
        'Стандартен партньор': 'Standard Partner',
        'Бронзов партньор': 'Bronze Partner',
        'Станете наш партньор': 'Become Our Partner',
        'Присъединете се към нашата мисия за по-зелена София': 'Join our mission for a greener Sofia',
        'Видимост': 'Visibility',
        'Вашият бранд ще бъде видян от хиляди екологично съзнателни граждани': 'Your brand will be seen by thousands of environmentally conscious citizens',
        'Социална отговорност': 'Social Responsibility',
        'Покажете своята ангажираност към устойчивото развитие на града': 'Show your commitment to sustainable city development',
        'Общност': 'Community',
        'Станете част от активна общност, която се грижи за околната среда': 'Become part of an active community that cares about the environment',
        'Растеж': 'Growth',
        'Достигнете до нови клиенти, които ценят екологичните инициативи': 'Reach new customers who value environmental initiatives',
        'Готови ли сте да направите разликата?': 'Ready to make a difference?',
        'Станете спонсор': 'Become Sponsor',
        'Свържете се с нас': 'Contact Us',
        'Въздействие на партньорствата': 'Partnership Impact',
        'Лева инвестиции': 'BGN Investment',
        '% по-чист въздух': '% Cleaner Air',
        'Нови паркове': 'New Parks',
        
        // Profile section
        'Потребителски профил': 'User Profile',
        'История на действията': 'Actions History',
        
        // Forms and modals
        'Добави нова локация': 'Add New Location',
        'Добави еко действие': 'Add Eco Action',
        'Име на локацията': 'Location Name',
        'Описание': 'Description',
        'Избери тип': 'Select Type',
        'Заглавие на действието': 'Action Title',
        'Опиши какво си направил...': 'Describe what you did...',
        'Локация': 'Location',
        'Добави локация': 'Add Location',
        'Сподели действието': 'Share Action',
        'Имейл': 'Email',
        'Парола': 'Password',
        'Потребителско име': 'Username',
        'Повтори парола': 'Confirm Password',
        'Нямате профил?': 'Don\'t have an account?',
        'Регистрирайте се': 'Register',
        'Вече имате профил?': 'Already have an account?',
        'Влезте': 'Login',
        
        // Chat
        'Чат': 'Chat',
        'Еко Асистент': 'Eco Assistant',
        'Попитай за еко инициативи...': 'Ask about eco initiatives...',
        'Изпрати': 'Send',
        
        // Common states
        'Зареждане...': 'Loading...',
        'Грешка': 'Error',
        'Успех': 'Success',
        'Информация': 'Information',
        'Внимание': 'Warning'
    };
}

// Get localized date format
function formatLocalizedDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const locale = currentLanguage === 'bg' ? 'bg-BG' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
}

// Get localized number format
function formatLocalizedNumber(number) {
    const locale = currentLanguage === 'bg' ? 'bg-BG' : 'en-US';
    return new Intl.NumberFormat(locale).format(number);
}

// Add data-translate attributes to key elements for easier translation
function addTranslationAttributes() {
    // This function can be called to add data-translate attributes
    // to elements that need dynamic translation
    console.log('Adding translation attributes...');
    
    // Example: Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const navKeys = ['nav_home', 'nav_map', 'nav_feed', 'nav_air', 'nav_leaderboard', 'nav_sponsors', 'nav_profile'];
    
    navLinks.forEach((link, index) => {
        if (navKeys[index]) {
            link.setAttribute('data-translate', navKeys[index]);
        }
    });
}

// Initialize language system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language system
    initializeLanguage();
    
    // Add translation attributes
    addTranslationAttributes();
    
    console.log('Language system initialized');
});

// Export language functions globally
window.toggleLanguage = toggleLanguage;
window.switchLanguage = switchLanguage;
window.translatePage = translatePage;