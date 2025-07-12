// Main page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
});

function initializeHomePage() {
    loadProfiles();
    setupSearch();
    setupFilters();
    setupPagination();
    setupModals();
}

// Global variables for pagination and filtering
let currentPage = 1;
let profilesPerPage = 6;
let filteredProfiles = [];
let allProfiles = [];

function loadProfiles() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // Only show public profiles
    allProfiles = users.filter(user => user.isPublic);
    filteredProfiles = [...allProfiles];
    
    renderProfiles();
    renderPagination();
}

function renderProfiles() {
    const profilesGrid = document.getElementById('profilesGrid');
    if (!profilesGrid) return;

    const startIndex = (currentPage - 1) * profilesPerPage;
    const endIndex = startIndex + profilesPerPage;
    const profilesToShow = filteredProfiles.slice(startIndex, endIndex);

    if (profilesToShow.length === 0) {
        profilesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No profiles found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    profilesGrid.innerHTML = profilesToShow.map(user => `
        <div class="profile-card" onclick="openProfileModal('${user.id}')">
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${user.profilePhoto}" alt="${user.name}">
                </div>
                <div class="profile-info">
                    <h3>${user.name}</h3>
                    <p class="location">${user.location || 'Location not specified'}</p>
                    <div class="rating">
                        <div class="stars">${generateStars(user.rating)}</div>
                        <span class="rating-text">${user.rating}/5 (${user.totalRatings} reviews)</span>
                    </div>
                </div>
            </div>
            
            <div class="skills-section">
                <h4>Skills Offered</h4>
                <div class="skills-tags">
                    ${user.skillsOffered.slice(0, 3).map(skill => 
                        `<span class="skill-tag offered">${skill}</span>`
                    ).join('')}
                    ${user.skillsOffered.length > 3 ? `<span class="skill-tag">+${user.skillsOffered.length - 3} more</span>` : ''}
                </div>
            </div>
            
            <div class="skills-section">
                <h4>Skills Wanted</h4>
                <div class="skills-tags">
                    ${user.skillsWanted.slice(0, 3).map(skill => 
                        `<span class="skill-tag wanted">${skill}</span>`
                    ).join('')}
                    ${user.skillsWanted.length > 3 ? `<span class="skill-tag">+${user.skillsWanted.length - 3} more</span>` : ''}
                </div>
            </div>
            
            <div class="profile-actions">
                ${isAuthenticated() ? 
                    `<button class="btn btn-primary" onclick="event.stopPropagation(); openSwapRequestModal('${user.id}')">
                        <i class="fas fa-handshake"></i> Request Swap
                    </button>` : 
                    `<button class="btn btn-primary" onclick="event.stopPropagation(); redirectToLogin()">
                        <i class="fas fa-sign-in-alt"></i> Login to Request
                    </button>`
                }
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star filled"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt filled"></i>';
        } else {
            stars += '<i class="fas fa-star"></i>';
        }
    }
    
    return stars;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterProfiles();
    });
}

function setupFilters() {
    const availabilityFilter = document.getElementById('availabilityFilter');
    if (!availabilityFilter) return;

    availabilityFilter.addEventListener('change', function() {
        filterProfiles();
    });
}

function filterProfiles() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const availabilityFilter = document.getElementById('availabilityFilter')?.value || '';

    filteredProfiles = allProfiles.filter(user => {
        // Search in skills offered and wanted
        const matchesSearch = searchTerm === '' || 
            user.skillsOffered.some(skill => skill.toLowerCase().includes(searchTerm)) ||
            user.skillsWanted.some(skill => skill.toLowerCase().includes(searchTerm)) ||
            user.name.toLowerCase().includes(searchTerm);

        // Filter by availability
        const matchesAvailability = availabilityFilter === '' || 
            user.availability.includes(availabilityFilter);

        return matchesSearch && matchesAvailability;
    });

    currentPage = 1; // Reset to first page
    renderProfiles();
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProfiles();
    renderPagination();
    
    // Scroll to top of profiles section
    document.querySelector('.profiles-section')?.scrollIntoView({ behavior: 'smooth' });
}

function setupModals() {
    // Profile modal
    const profileModal = document.getElementById('profileModal');
    const closeModal = document.getElementById('closeModal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            profileModal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside
    if (profileModal) {
        profileModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // Swap request modal
    const swapRequestModal = document.getElementById('swapRequestModal');
    const closeSwapModal = document.getElementById('closeSwapModal');
    const cancelSwapRequest = document.getElementById('cancelSwapRequest');
    
    if (closeSwapModal) {
        closeSwapModal.addEventListener('click', () => {
            swapRequestModal.classList.remove('active');
        });
    }
    
    if (cancelSwapRequest) {
        cancelSwapRequest.addEventListener('click', () => {
            swapRequestModal.classList.remove('active');
        });
    }
    
    if (swapRequestModal) {
        swapRequestModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // Swap request form
    const swapRequestForm = document.getElementById('swapRequestForm');
    if (swapRequestForm) {
        swapRequestForm.addEventListener('submit', handleSwapRequestSubmit);
    }
}

function openProfileModal(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    // Populate modal with user data
    document.getElementById('modalUserName').textContent = user.name;
    document.getElementById('modalUserAvatar').src = user.profilePhoto;
    document.getElementById('modalUserRating').innerHTML = generateStars(user.rating);
    document.getElementById('modalRatingText').textContent = `${user.rating}/5 (${user.totalRatings} reviews)`;
    document.getElementById('modalUserLocation').textContent = user.location || 'Location not specified';
    
    // Skills offered
    const skillsOffered = document.getElementById('modalSkillsOffered');
    skillsOffered.innerHTML = user.skillsOffered.map(skill => 
        `<span class="skill-tag offered">${skill}</span>`
    ).join('');
    
    // Skills wanted
    const skillsWanted = document.getElementById('modalSkillsWanted');
    skillsWanted.innerHTML = user.skillsWanted.map(skill => 
        `<span class="skill-tag wanted">${skill}</span>`
    ).join('');
    
    // Availability
    const availability = document.getElementById('modalAvailability');
    availability.innerHTML = user.availability.map(time => 
        `<span class="skill-tag">${time}</span>`
    ).join('');
    
    // Feedback
    const feedback = getFeedbackForUser(userId);
    const modalFeedback = document.getElementById('modalFeedback');
    
    if (feedback.length === 0) {
        modalFeedback.innerHTML = '<p class="text-center">No feedback yet</p>';
    } else {
        modalFeedback.innerHTML = feedback.slice(0, 3).map(f => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const fromUser = users.find(u => u.id === f.fromUserId);
            return `
                <div class="feedback-item">
                    <div class="feedback-header">
                        <span class="feedback-user">${fromUser?.name || 'Anonymous'}</span>
                        <div class="stars">${generateStars(f.rating)}</div>
                    </div>
                    <p class="feedback-comment">${f.comment}</p>
                </div>
            `;
        }).join('');
    }
    
    // Request button
    const requestBtn = document.getElementById('requestSwapBtn');
    if (isAuthenticated()) {
        requestBtn.style.display = 'block';
        requestBtn.onclick = () => openSwapRequestModal(userId);
    } else {
        requestBtn.style.display = 'none';
    }
    
    // Show modal
    document.getElementById('profileModal').classList.add('active');
}

function openSwapRequestModal(toUserId) {
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const toUser = users.find(u => u.id === toUserId);
    
    if (!toUser) return;
    
    // Populate offered skills dropdown
    const offeredSkillSelect = document.getElementById('offeredSkill');
    offeredSkillSelect.innerHTML = '<option value="">Select a skill you offer</option>' +
        currentUser.skillsOffered.map(skill => 
            `<option value="${skill}">${skill}</option>`
        ).join('');
    
    // Populate requested skills dropdown
    const requestedSkillSelect = document.getElementById('requestedSkill');
    requestedSkillSelect.innerHTML = '<option value="">Select a skill you want</option>' +
        toUser.skillsWanted.map(skill => 
            `<option value="${skill}">${skill}</option>`
        ).join('');
    
    // Store target user ID
    document.getElementById('swapRequestForm').dataset.toUserId = toUserId;
    
    // Show modal
    document.getElementById('swapRequestModal').classList.add('active');
}

function handleSwapRequestSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const toUserId = form.dataset.toUserId;
    const currentUser = getCurrentUser();
    
    const requestData = {
        fromUserId: currentUser.id,
        toUserId: toUserId,
        offeredSkill: document.getElementById('offeredSkill').value,
        requestedSkill: document.getElementById('requestedSkill').value,
        message: document.getElementById('swapMessage').value
    };
    
    // Validation
    if (!requestData.offeredSkill || !requestData.requestedSkill) {
        alert('Please select both skills');
        return;
    }
    
    // Create swap request
    createSwapRequest(requestData);
    
    // Close modal and show success message
    document.getElementById('swapRequestModal').classList.remove('active');
    alert('Swap request sent successfully!');
    
    // Reset form
    form.reset();
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

// Make functions globally accessible
window.openProfileModal = openProfileModal;
window.openSwapRequestModal = openSwapRequestModal;
window.changePage = changePage;
window.redirectToLogin = redirectToLogin;