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
    
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    const profilePicture = formData.get('profile_picture');

    // Client-side validation
    if (password !== confirmPassword) {
        console.log('Паролите не съвпадат');
        return;
    }

    if (password.length < 6) {
        console.log('Паролата трябва да е поне 6 символа');
        return;
    }

    if (username.length < 3) {
        console.log('Потребителското име трябва да е поне 3 символа');
        return;
    }

    // Validate profile picture if uploaded
    if (profilePicture && profilePicture.size > 0) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (profilePicture.size > maxSize) {
            console.log('Снимката е твърде голяма. Максималният размер е 5MB');
            return;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(profilePicture.type)) {
            console.log('Невалиден формат на снимката. Моля използвайте PNG, JPG, JPEG, GIF или WebP');
            return;
        }
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData // Send form data directly for file upload
        });

        const data = await response.json();
        
        if (!data.success) {
            console.log(data.message || 'Грешка при регистрация');
            return;
        }
        
        console.log('Регистрацията е успешна!');
        
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        closeModal('registerModal');
        updateUIAfterLogin(data.user);
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.log('Възникна грешка при свързване със сървъра');
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

    if (!email || !password) {
        console.log('Моля въведете имейл и парола');
        return;
    }

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

        const data = await response.json();
        
        if (!data.success) {
            console.log(data.message || 'Грешка при вход');
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Успешен вход!');
        updateUIAfterLogin(data.user);
        closeModal('loginModal');
        
        // Reset form
        document.getElementById('loginForm').reset();
        
    } catch (error) {
        console.log('Възникна грешка при свързване със сървъра');
        console.error('Login error:', error);
    }
}

async function logout() {
    const token = localStorage.getItem('token');
    
    if (token) {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.log('Грешка при излизане от профила');
        }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIAfterLogout();
    console.log('Успешно излязохте от профила си');
}

function updateUIAfterLogin(user) {
    const authButtons = document.querySelector('.auth-buttons');
    
    // Create user info display with profile picture
    let profilePicture = '';
    if (user.profile_picture) {
        profilePicture = `<img src="${user.profile_picture}" alt="Profile" class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;">`;
    } else {
        profilePicture = `<div class="user-avatar-placeholder" style="width: 32px; height: 32px; border-radius: 50%; background: #4CAF50; color: white; display: inline-flex; align-items: center; justify-content: center; margin-right: 8px; font-weight: bold;">${user.username.charAt(0).toUpperCase()}</div>`;
    }
    
    // Update auth buttons to show user info
    authButtons.innerHTML = `
        <div class="user-info" style="display: flex; align-items: center; margin-right: 10px;">
            ${profilePicture}
            <span class="user-welcome" style="margin-right: 10px;">Здравей, ${user.username}!</span>
            ${user.role === 'admin' ? '<span class="admin-badge" style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px;">ADMIN</span>' : ''}
        </div>
        <button onclick="logout()" class="btn-login">Изход</button>
    `;
}

function updateUIAfterLogout() {
    const authButtons = document.querySelector('.auth-buttons');
    
    // Restore original login/register buttons with proper modal functions
    authButtons.innerHTML = `
        <button class="btn-login" onclick="showModal('loginModal')">Вход</button>
        <button class="btn-register" onclick="showModal('registerModal')">Регистрация</button>
    `;
}

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateUIAfterLogin(user);
    }
});

// Helper function to get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
}

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Helper function to make authenticated requests
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    return fetch(url, {
        ...options,
        headers
    });
}

// Export functions to global scope
window.showModal = showModal;
window.hideModal = hideModal;
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;