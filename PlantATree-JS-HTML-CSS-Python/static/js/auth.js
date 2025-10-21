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
        console.log('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        console.log('Password must be at least 6 characters');
        return;
    }

    if (username.length < 3) {
        console.log('Username must be at least 3 characters');
        return;
    }

    // Validate profile picture if uploaded
    if (profilePicture && profilePicture.size > 0) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (profilePicture.size > maxSize) {
            console.log('Image is too large. Maximum size is 5MB');
            return;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(profilePicture.type)) {
            console.log('Invalid image format. Please use PNG, JPG, JPEG, GIF or WebP');
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
            console.log(data.message || 'Registration error');
            return;
        }
        
        console.log('Registration successful!');
        
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        closeModal('registerModal');
        updateUIAfterLogin(data.user);
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.log('An error occurred while connecting to the server');
        console.error('Registration error:', error);
    }
}

async function handleAuthError(response) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
    throw new Error(data.message || 'An error occurred with the request');
    } else {
        const text = await response.text();
    throw new Error(text || 'An unexpected error occurred');
    }
}

async function loginUser(event) {
    if (event) {
        event.preventDefault();
    }
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        console.log('Please enter email and password');
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
            console.log(data.message || 'Login error');
            return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Login successful!');
        updateUIAfterLogin(data.user);
        closeModal('loginModal');
        
        // Reset form
        document.getElementById('loginForm').reset();
        
    } catch (error) {
        console.log('An error occurred while connecting to the server');
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
            console.log('Error while logging out');
        }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIAfterLogout();
    console.log('Successfully logged out');
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
            <span class="user-welcome" style="margin-right: 10px;">Hello, ${user.username}!</span>
            ${user.role === 'admin' ? '<span class="admin-badge" style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px;">ADMIN</span>' : ''}
        </div>
        <button onclick="logout()" class="btn-login">Logout</button>
    `;
}

function updateUIAfterLogout() {
    const authButtons = document.querySelector('.auth-buttons');
    
    // Restore original login/register buttons with proper modal functions
    authButtons.innerHTML = `
        <button class="btn-login" onclick="showModal('loginModal')">Sign In</button>
        <button class="btn-register" onclick="showModal('registerModal')">Register</button>
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