// Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = this.loadCurrentUser();
        this.users = this.loadUsers();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    loadUsers() {
        const users = localStorage.getItem('users');
        if (users) {
            return JSON.parse(users);
        }
        
        // Initialize with demo users
        const defaultUsers = [
            {
                id: '1',
                name: 'Demo User',
                email: 'user@demo.com',
                password: 'password',
                location: 'New York, NY',
                profilePhoto: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
                skillsOffered: ['JavaScript', 'React', 'Node.js'],
                skillsWanted: ['Python', 'Machine Learning'],
                availability: ['weekends', 'evenings'],
                isPublic: true,
                rating: 4.5,
                totalRatings: 12,
                joinDate: '2024-01-15',
                isAdmin: false
            },
            {
                id: '2',
                name: 'Admin User',
                email: 'admin@demo.com',
                password: 'password',
                location: 'San Francisco, CA',
                profilePhoto: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
                skillsOffered: ['Management', 'Strategy', 'Leadership'],
                skillsWanted: ['Design', 'UX Research'],
                availability: ['weekdays', 'flexible'],
                isPublic: true,
                rating: 5.0,
                totalRatings: 8,
                joinDate: '2023-12-01',
                isAdmin: true
            }
        ];
        
        this.saveUsers(defaultUsers);
        return defaultUsers;
    }

    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
        this.users = users;
    }

    saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            this.saveCurrentUser(userWithoutPassword);
            this.updateNavigation();
            return true;
        }
        return false;
    }

    signup(userData) {
        // Check if email already exists
        if (this.users.find(u => u.email === userData.email)) {
            return false;
        }

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            location: userData.location || '',
            profilePhoto: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
            skillsOffered: [],
            skillsWanted: [],
            availability: [],
            isPublic: true,
            rating: 0,
            totalRatings: 0,
            joinDate: new Date().toISOString().split('T')[0],
            isAdmin: false
        };

        this.users.push(newUser);
        this.saveUsers(this.users);
        return true;
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateNavigation();
    }

    updateUser(updatedUser) {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser };
            this.saveUsers(this.users);
            
            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === updatedUser.id) {
                this.saveCurrentUser(this.users[index]);
            }
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    updateNavigation() {
        const loginLink = document.getElementById('loginLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const requestsLink = document.getElementById('requestsLink');
        const profileLink = document.getElementById('profileLink');
        const adminLink = document.getElementById('adminLink');

        if (this.isAuthenticated()) {
            if (loginLink) loginLink.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (requestsLink) requestsLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'block';
            
            if (this.isAdmin() && adminLink) {
                adminLink.style.display = 'block';
            }
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (requestsLink) requestsLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
        }
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAdmin()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
}

// Global auth instance
const auth = new AuthManager();

// Global auth functions
function login(email, password) {
    return auth.login(email, password);
}

function signup(userData) {
    return auth.signup(userData);
}

function logout() {
    auth.logout();
    window.location.href = 'index.html';
}

function getCurrentUser() {
    return auth.currentUser;
}

function isAuthenticated() {
    return auth.isAuthenticated();
}

function isAdmin() {
    return auth.isAdmin();
}

function updateUser(userData) {
    auth.updateUser(userData);
}

function requireAuth() {
    return auth.requireAuth();
}

function requireAdmin() {
    return auth.requireAdmin();
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', function() {
    auth.updateNavigation();
    
    // Add logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
});