// Admin page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth() || !requireAdmin()) return;
    
    initializeAdminPage();
});

function initializeAdminPage() {
    loadAdminStats();
    setupAdminTabs();
    setupAdminModals();
    loadUsersTab();
}

function loadAdminStats() {
    const stats = getStats();
    
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('totalRequests').textContent = stats.totalRequests;
    document.getElementById('completedSwaps').textContent = stats.completedSwaps;
    document.getElementById('avgRating').textContent = stats.avgRating.toFixed(1);
}

function setupAdminTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab panel
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${tabName}Tab`) {
                    panel.classList.add('active');
                }
            });
            
            // Load tab content
            loadTabContent(tabName);
        });
    });
}

function loadTabContent(tabName) {
    switch (tabName) {
        case 'users':
            loadUsersTab();
            break;
        case 'swaps':
            loadSwapsTab();
            break;
        case 'feedback':
            loadFeedbackTab();
            break;
        case 'messages':
            loadMessagesTab();
            break;
        case 'reports':
            // Reports tab is static
            break;
    }
}

function loadUsersTab() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersTableBody = document.getElementById('usersTableBody');
    
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="${user.profilePhoto}" alt="${user.name}">
                    <div class="user-cell-info">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${formatDate(user.joinDate)}</td>
            <td>
                <span class="status-badge ${user.isPublic ? 'status-accepted' : 'status-pending'}">
                    ${user.isPublic ? 'Public' : 'Private'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="banUser('${user.id}')">
                        <i class="fas fa-ban"></i> Ban
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="viewUserDetails('${user.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Setup user search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            filterUsers(this.value);
        });
    }
}

function loadSwapsTab() {
    const swapRequests = JSON.parse(localStorage.getItem('swapRequests') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const swapsTableBody = document.getElementById('swapsTableBody');
    
    if (!swapsTableBody) return;
    
    swapsTableBody.innerHTML = swapRequests.map(request => {
        const fromUser = users.find(u => u.id === request.fromUserId);
        const toUser = users.find(u => u.id === request.toUserId);
        
        return `
            <tr>
                <td>${fromUser?.name || 'Unknown'}</td>
                <td>${toUser?.name || 'Unknown'}</td>
                <td>${request.offeredSkill} ↔ ${request.requestedSkill}</td>
                <td>
                    <span class="status-badge status-${request.status}">${request.status}</span>
                </td>
                <td>${formatDate(request.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-danger btn-sm" onclick="deleteSwapFromAdmin('${request.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Setup status filter
    const swapStatusFilter = document.getElementById('swapStatusFilter');
    if (swapStatusFilter) {
        swapStatusFilter.addEventListener('change', function() {
            filterSwaps(this.value);
        });
    }
}

function loadFeedbackTab() {
    const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminFeedbackList = document.getElementById('adminFeedbackList');
    
    if (!adminFeedbackList) return;
    
    if (feedback.length === 0) {
        adminFeedbackList.innerHTML = '<div class="empty-state"><h3>No feedback yet</h3></div>';
        return;
    }
    
    adminFeedbackList.innerHTML = feedback.map(f => {
        const fromUser = users.find(u => u.id === f.fromUserId);
        const toUser = users.find(u => u.id === f.toUserId);
        
        return `
            <div class="feedback-item">
                <div class="feedback-header">
                    <span class="feedback-user">${fromUser?.name || 'Unknown'} → ${toUser?.name || 'Unknown'}</span>
                    <div class="feedback-rating">
                        <div class="stars">${generateStars(f.rating)}</div>
                    </div>
                    <span class="feedback-date">${formatDate(f.createdAt)}</span>
                </div>
                <div class="feedback-comment">${f.comment}</div>
            </div>
        `;
    }).join('');
}

function loadMessagesTab() {
    const messages = JSON.parse(localStorage.getItem('platformMessages') || '[]');
    const messagesList = document.getElementById('messagesList');
    
    if (!messagesList) return;
    
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="empty-state"><h3>No messages sent</h3></div>';
        return;
    }
    
    messagesList.innerHTML = messages.map(message => `
        <div class="feedback-item">
            <div class="feedback-header">
                <span class="feedback-user">${message.title}</span>
                <span class="status-badge status-${message.type}">${message.type}</span>
                <span class="feedback-date">${formatDate(message.createdAt)}</span>
            </div>
            <div class="feedback-comment">${message.content}</div>
        </div>
    `).join('');
}

function setupAdminModals() {
    // New message modal
    const newMessageModal = document.getElementById('newMessageModal');
    const newMessageBtn = document.getElementById('newMessageBtn');
    const closeMessageModal = document.getElementById('closeMessageModal');
    const cancelMessage = document.getElementById('cancelMessage');
    const messageForm = document.getElementById('messageForm');
    
    if (newMessageBtn) {
        newMessageBtn.addEventListener('click', () => {
            newMessageModal.classList.add('active');
        });
    }
    
    if (closeMessageModal) {
        closeMessageModal.addEventListener('click', () => {
            newMessageModal.classList.remove('active');
        });
    }
    
    if (cancelMessage) {
        cancelMessage.addEventListener('click', () => {
            newMessageModal.classList.remove('active');
        });
    }
    
    if (newMessageModal) {
        newMessageModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendPlatformMessage();
        });
    }
}

function sendPlatformMessage() {
    const title = document.getElementById('messageTitle').value.trim();
    const content = document.getElementById('messageContent').value.trim();
    const type = document.getElementById('messageType').value;
    
    if (!title || !content) {
        alert('Please fill in all fields');
        return;
    }
    
    const messageData = { title, content, type };
    createPlatformMessage(messageData);
    
    // Close modal and reload
    document.getElementById('newMessageModal').classList.remove('active');
    document.getElementById('messageForm').reset();
    loadMessagesTab();
    
    alert('Message sent successfully!');
}

function filterUsers(searchTerm) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="${user.profilePhoto}" alt="${user.name}">
                    <div class="user-cell-info">
                        <h4>${user.name}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${formatDate(user.joinDate)}</td>
            <td>
                <span class="status-badge ${user.isPublic ? 'status-accepted' : 'status-pending'}">
                    ${user.isPublic ? 'Public' : 'Private'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="banUser('${user.id}')">
                        <i class="fas fa-ban"></i> Ban
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="viewUserDetails('${user.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterSwaps(status) {
    const swapRequests = JSON.parse(localStorage.getItem('swapRequests') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const filteredRequests = status ? 
        swapRequests.filter(request => request.status === status) : 
        swapRequests;
    
    const swapsTableBody = document.getElementById('swapsTableBody');
    swapsTableBody.innerHTML = filteredRequests.map(request => {
        const fromUser = users.find(u => u.id === request.fromUserId);
        const toUser = users.find(u => u.id === request.toUserId);
        
        return `
            <tr>
                <td>${fromUser?.name || 'Unknown'}</td>
                <td>${toUser?.name || 'Unknown'}</td>
                <td>${request.offeredSkill} ↔ ${request.requestedSkill}</td>
                <td>
                    <span class="status-badge status-${request.status}">${request.status}</span>
                </td>
                <td>${formatDate(request.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-danger btn-sm" onclick="deleteSwapFromAdmin('${request.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function banUser(userId) {
    if (confirm('Are you sure you want to ban this user? This action cannot be undone.')) {
        // In a real app, this would disable the user account
        // For demo purposes, we'll just remove them from public view
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].isPublic = false;
            users[userIndex].banned = true;
            localStorage.setItem('users', JSON.stringify(users));
            loadUsersTab();
            alert('User has been banned.');
        }
    }
}

function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (user) {
        alert(`User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nJoin Date: ${user.joinDate}\nSkills Offered: ${user.skillsOffered.join(', ')}\nSkills Wanted: ${user.skillsWanted.join(', ')}\nRating: ${user.rating}/5 (${user.totalRatings} reviews)`);
    }
}

function deleteSwapFromAdmin(requestId) {
    if (confirm('Are you sure you want to delete this swap request?')) {
        deleteSwapRequest(requestId);
        loadSwapsTab();
        alert('Swap request deleted.');
    }
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Make functions globally accessible
window.banUser = banUser;
window.viewUserDetails = viewUserDetails;
window.deleteSwapFromAdmin = deleteSwapFromAdmin;
window.downloadReport = downloadReport;