// Authentication related functions
// Modal management functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        // Prevent clicks inside modal from closing it
        modal.querySelector('.modal-content').addEventListener('click', function(e) {
            e.stopPropagation();
        });
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Remove event listeners
        modal.querySelector('.modal-content').removeEventListener('click', function(e) {
            e.stopPropagation();
        });
        modal.removeEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    setTimeout(() => {
        showModal(toModalId);
    }, 100); // Small delay to ensure smooth transition
}

async function registerUser(event) {
    event.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        showNotification('Паролите не съвпадат', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        if (!response.ok) {
            await handleAuthError(response);
        }
        
        const data = await response.json();
        showNotification('Регистрацията е успешна!', 'success');
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        closeModal('registerModal');
        updateUIAfterLogin(data.user);
    } catch (error) {
        showNotification('Възникна грешка при свързване със сървъра', 'error');
        console.error('Registration error:', error);
    }
}

async function handleAuthError(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.message || 'Възникна грешка при заявката');
    } else {
        const text = await response.text();
        throw new Error(text || 'Възникна неочаквана грешка');
    }
}

async function loginUser(event) {
    if (event) {
        event.preventDefault();
    }
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            await handleAuthError(response);
        }
        
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showNotification('Успешен вход!', 'success');
        updateUIAfterLogin(data.user);
        closeModal('loginModal');
    } catch (error) {
        showNotification('Възникна грешка при свързване със сървъра', 'error');
        console.error('Login error:', error);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIAfterLogout();
    showNotification('Успешно излязохте от профила си', 'success');
}

function updateUIAfterLogin(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const navMenu = document.querySelector('.nav-menu');
    
    // Hide login/register buttons
    authButtons.innerHTML = `
        <span class="user-welcome">Здравей, ${user.username}!</span>
        <button onclick="logout()" class="btn-login">Изход</button>
    `;
    
    // Add profile link to nav menu if it doesn't exist
    if (!document.querySelector('.nav-link[href="#profile"]')) {
        const profileLink = document.createElement('li');
        profileLink.innerHTML = '<a href="#profile" class="nav-link">Профил</a>';
        navMenu.appendChild(profileLink);
    }
}

function updateUIAfterLogout() {
    const authButtons = document.querySelector('.auth-buttons');
    
    // Restore original login/register buttons
    authButtons.innerHTML = `
        <button onclick="showLoginModal()" class="btn-login">Вход</button>
        <button onclick="showRegisterModal()" class="btn-register">Регистрация</button>
    `;
    
    // Remove profile link from nav menu
    const profileLink = document.querySelector('.nav-link[href="#profile"]');
    if (profileLink) {
        profileLink.parentElement.remove();
    }
    
    // Redirect to home if on profile page and hide profile section
    if (window.location.hash === '#profile') {
        window.location.hash = '#';
        const profileSection = document.getElementById('profile');
        if (profileSection) {
            profileSection.classList.add('hidden');
        }
        showSection('home');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateUIAfterLogin(user);
    }
});