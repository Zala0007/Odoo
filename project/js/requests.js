// Requests page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (!requireAuth()) return;
    
    initializeRequestsPage();
});

let currentRequestTab = 'all';
let currentRequestPage = 1;
const requestsPerPage = 5;

function initializeRequestsPage() {
    setupRequestTabs();
    setupFeedbackModal();
    loadRequests();
}

function setupRequestTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update current tab and reload requests
            currentRequestTab = this.dataset.tab;
            currentRequestPage = 1;
            loadRequests();
        });
    });
}

function loadRequests() {
    const currentUser = getCurrentUser();
    const allRequests = getSwapRequestsForUser(currentUser.id);
    
    // Filter requests based on current tab
    let filteredRequests = [];
    
    switch (currentRequestTab) {
        case 'received':
            filteredRequests = allRequests.filter(r => r.toUserId === currentUser.id);
            break;
        case 'sent':
            filteredRequests = allRequests.filter(r => r.fromUserId === currentUser.id);
            break;
        case 'completed':
            filteredRequests = allRequests.filter(r => r.status === 'completed');
            break;
        default:
            filteredRequests = allRequests;
    }
    
    // Sort by most recent
    filteredRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    renderRequests(filteredRequests);
    renderRequestsPagination(filteredRequests);
}

function renderRequests(requests) {
    const requestsList = document.getElementById('requestsList');
    if (!requestsList) return;
    
    if (requests.length === 0) {
        requestsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <h3>No ${currentRequestTab} requests</h3>
                <p>When you ${currentRequestTab === 'sent' ? 'send' : 'receive'} skill swap requests, they'll appear here</p>
            </div>
        `;
        return;
    }
    
    const startIndex = (currentRequestPage - 1) * requestsPerPage;
    const endIndex = startIndex + requestsPerPage;
    const requestsToShow = requests.slice(startIndex, endIndex);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = getCurrentUser();
    
    requestsList.innerHTML = requestsToShow.map(request => {
        const otherUserId = request.fromUserId === currentUser.id ? request.toUserId : request.fromUserId;
        const otherUser = users.find(u => u.id === otherUserId);
        const isReceived = request.toUserId === currentUser.id;
        const isCompleted = request.status === 'completed';
        const canLeaveFeedback = isCompleted && !hasLeftFeedback(request.id, currentUser.id);
        
        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-user">
                        <img src="${otherUser?.profilePhoto || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'}" alt="${otherUser?.name}">
                        <div class="request-user-info">
                            <h4>${otherUser?.name || 'Unknown User'}</h4>
                            <p>${isReceived ? 'Wants to swap with you' : 'You requested a swap'}</p>
                        </div>
                    </div>
                    <span class="status-badge status-${request.status}">${request.status}</span>
                </div>
                
                <div class="request-content">
                    <div class="skill-exchange">
                        <span class="skill-tag offered">${isReceived ? request.offeredSkill : request.requestedSkill}</span>
                        <i class="fas fa-exchange-alt"></i>
                        <span class="skill-tag wanted">${isReceived ? request.requestedSkill : request.offeredSkill}</span>
                    </div>
                    
                    ${request.message ? `
                        <div class="request-message">
                            "${request.message}"
                        </div>
                    ` : ''}
                </div>
                
                <div class="request-actions">
                    ${isReceived && request.status === 'pending' ? `
                        <button class="btn btn-success" onclick="acceptRequest('${request.id}')">
                            <i class="fas fa-check"></i> Accept
                        </button>
                        <button class="btn btn-danger" onclick="rejectRequest('${request.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : ''}
                    
                    ${!isReceived && request.status === 'pending' ? `
                        <button class="btn btn-danger" onclick="deleteRequest('${request.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                    
                    ${canLeaveFeedback ? `
                        <button class="btn btn-primary" onclick="openFeedbackModal('${request.id}', '${otherUserId}')">
                            <i class="fas fa-star"></i> Leave Feedback
                        </button>
                    ` : ''}
                </div>
                
                <div class="request-meta">
                    <span>Created: ${formatDate(request.createdAt)}</span>
                    ${request.updatedAt !== request.createdAt ? 
                        `<span>Updated: ${formatDate(request.updatedAt)}</span>` : ''
                    }
                </div>
            </div>
        `;
    }).join('');
}

function renderRequestsPagination(requests) {
    const pagination = document.getElementById('requestsPagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(requests.length / requestsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button ${currentRequestPage === 1 ? 'disabled' : ''} onclick="changeRequestPage(${currentRequestPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentRequestPage - 1 && i <= currentRequestPage + 1)) {
            paginationHTML += `
                <button class="${i === currentRequestPage ? 'active' : ''}" onclick="changeRequestPage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentRequestPage - 2 || i === currentRequestPage + 2) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button ${currentRequestPage === totalPages ? 'disabled' : ''} onclick="changeRequestPage(${currentRequestPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changeRequestPage(page) {
    currentRequestPage = page;
    loadRequests();
}

function acceptRequest(requestId) {
    if (confirm('Accept this swap request?')) {
        updateSwapRequest(requestId, { status: 'accepted' });
        loadRequests();
        alert('Request accepted! You can now start your skill exchange.');
    }
}

function rejectRequest(requestId) {
    if (confirm('Reject this swap request?')) {
        updateSwapRequest(requestId, { status: 'rejected' });
        loadRequests();
        alert('Request rejected.');
    }
}

function deleteRequest(requestId) {
    if (confirm('Delete this swap request?')) {
        deleteSwapRequest(requestId);
        loadRequests();
        alert('Request deleted.');
    }
}

function setupFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedbackModal = document.getElementById('closeFeedbackModal');
    const cancelFeedback = document.getElementById('cancelFeedback');
    const feedbackForm = document.getElementById('feedbackForm');
    const starRating = document.getElementById('starRating');
    
    // Close modal handlers
    if (closeFeedbackModal) {
        closeFeedbackModal.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });
    }
    
    if (cancelFeedback) {
        cancelFeedback.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });
    }
    
    if (feedbackModal) {
        feedbackModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
    
    // Star rating
    if (starRating) {
        const stars = starRating.querySelectorAll('i');
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const rating = index + 1;
                
                // Update visual state
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                // Store rating
                starRating.dataset.rating = rating;
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = index + 1;
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.style.color = '#F59E0B';
                    } else {
                        s.style.color = '#D1D5DB';
                    }
                });
            });
        });
        
        starRating.addEventListener('mouseleave', function() {
            const currentRating = parseInt(this.dataset.rating) || 0;
            stars.forEach((s, i) => {
                if (i < currentRating) {
                    s.style.color = '#F59E0B';
                } else {
                    s.style.color = '#D1D5DB';
                }
            });
        });
    }
    
    // Form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitFeedback();
        });
    }
}

function openFeedbackModal(requestId, toUserId) {
    const feedbackModal = document.getElementById('feedbackModal');
    const starRating = document.getElementById('starRating');
    
    // Reset form
    document.getElementById('feedbackComment').value = '';
    starRating.dataset.rating = '0';
    starRating.querySelectorAll('i').forEach(star => {
        star.classList.remove('active');
        star.style.color = '#D1D5DB';
    });
    
    // Store data
    feedbackModal.dataset.requestId = requestId;
    feedbackModal.dataset.toUserId = toUserId;
    
    // Show modal
    feedbackModal.classList.add('active');
}

function submitFeedback() {
    const feedbackModal = document.getElementById('feedbackModal');
    const requestId = feedbackModal.dataset.requestId;
    const toUserId = feedbackModal.dataset.toUserId;
    const rating = parseInt(document.getElementById('starRating').dataset.rating);
    const comment = document.getElementById('feedbackComment').value.trim();
    
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    
    if (!comment) {
        alert('Please leave a comment');
        return;
    }
    
    // Create feedback
    const feedbackData = {
        swapRequestId: requestId,
        fromUserId: getCurrentUser().id,
        toUserId: toUserId,
        rating: rating,
        comment: comment
    };
    
    createFeedback(feedbackData);
    
    // Mark request as completed if not already
    updateSwapRequest(requestId, { status: 'completed' });
    
    // Close modal and reload
    feedbackModal.classList.remove('active');
    loadRequests();
    alert('Feedback submitted successfully!');
}

function hasLeftFeedback(requestId, userId) {
    const feedback = JSON.parse(localStorage.getItem('feedback') || '[]');
    return feedback.some(f => f.swapRequestId === requestId && f.fromUserId === userId);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Make functions globally accessible
window.changeRequestPage = changeRequestPage;
window.acceptRequest = acceptRequest;
window.rejectRequest = rejectRequest;
window.deleteRequest = deleteRequest;
window.openFeedbackModal = openFeedbackModal;