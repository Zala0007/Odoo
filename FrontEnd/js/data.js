// Data management functionality
class DataManager {
    constructor() {
        this.swapRequests = this.loadSwapRequests();
        this.feedback = this.loadFeedback();
        this.platformMessages = this.loadPlatformMessages();
    }

    loadSwapRequests() {
        const requests = localStorage.getItem('swapRequests');
        if (requests) {
            return JSON.parse(requests);
        }
        
        // Initialize with demo data
        const defaultRequests = [
            {
                id: '1',
                fromUserId: '1',
                toUserId: '2',
                offeredSkill: 'JavaScript',
                requestedSkill: 'Management',
                message: 'Hi! I\'d love to learn about team management in exchange for JavaScript tutoring.',
                status: 'pending',
                createdAt: '2024-01-20T10:00:00Z',
                updatedAt: '2024-01-20T10:00:00Z'
            }
        ];
        
        this.saveSwapRequests(defaultRequests);
        return defaultRequests;
    }

    loadFeedback() {
        const feedback = localStorage.getItem('feedback');
        if (feedback) {
            return JSON.parse(feedback);
        }
        
        const defaultFeedback = [
            {
                id: '1',
                swapRequestId: '1',
                fromUserId: '1',
                toUserId: '2',
                rating: 5,
                comment: 'Great experience! Learned a lot about management principles.',
                createdAt: '2024-01-22T15:30:00Z'
            }
        ];
        
        this.saveFeedback(defaultFeedback);
        return defaultFeedback;
    }

    loadPlatformMessages() {
        const messages = localStorage.getItem('platformMessages');
        if (messages) {
            return JSON.parse(messages);
        }
        
        const defaultMessages = [
            {
                id: '1',
                title: 'Welcome to SkillSwap!',
                content: 'Thank you for joining our community. Start exploring and connecting with other learners.',
                type: 'info',
                createdAt: '2024-01-15T09:00:00Z',
                createdBy: 'admin@demo.com'
            }
        ];
        
        this.savePlatformMessages(defaultMessages);
        return defaultMessages;
    }

    saveSwapRequests(requests) {
        localStorage.setItem('swapRequests', JSON.stringify(requests));
        this.swapRequests = requests;
    }

    saveFeedback(feedback) {
        localStorage.setItem('feedback', JSON.stringify(feedback));
        this.feedback = feedback;
    }

    savePlatformMessages(messages) {
        localStorage.setItem('platformMessages', JSON.stringify(messages));
        this.platformMessages = messages;
    }

    // Swap Request methods
    createSwapRequest(requestData) {
        const newRequest = {
            id: Date.now().toString(),
            fromUserId: requestData.fromUserId,
            toUserId: requestData.toUserId,
            offeredSkill: requestData.offeredSkill,
            requestedSkill: requestData.requestedSkill,
            message: requestData.message,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.swapRequests.push(newRequest);
        this.saveSwapRequests(this.swapRequests);
        return newRequest;
    }

    updateSwapRequest(requestId, updates) {
        const index = this.swapRequests.findIndex(r => r.id === requestId);
        if (index !== -1) {
            this.swapRequests[index] = {
                ...this.swapRequests[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveSwapRequests(this.swapRequests);
            return this.swapRequests[index];
        }
        return null;
    }

    deleteSwapRequest(requestId) {
        this.swapRequests = this.swapRequests.filter(r => r.id !== requestId);
        this.saveSwapRequests(this.swapRequests);
    }

    getSwapRequestsForUser(userId) {
        return this.swapRequests.filter(r => r.fromUserId === userId || r.toUserId === userId);
    }

    getSwapRequestsByStatus(status) {
        return this.swapRequests.filter(r => r.status === status);
    }

    // Feedback methods
    createFeedback(feedbackData) {
        const newFeedback = {
            id: Date.now().toString(),
            swapRequestId: feedbackData.swapRequestId,
            fromUserId: feedbackData.fromUserId,
            toUserId: feedbackData.toUserId,
            rating: feedbackData.rating,
            comment: feedbackData.comment,
            createdAt: new Date().toISOString()
        };

        this.feedback.push(newFeedback);
        this.saveFeedback(this.feedback);

        // Update user ratings
        this.updateUserRating(feedbackData.toUserId, feedbackData.rating);
        
        return newFeedback;
    }

    getFeedbackForUser(userId) {
        return this.feedback.filter(f => f.toUserId === userId);
    }

    updateUserRating(userId, newRating) {
        const userFeedback = this.getFeedbackForUser(userId);
        const totalRatings = userFeedback.length;
        const averageRating = userFeedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings;

        // Update user in auth system
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].rating = Math.round(averageRating * 10) / 10;
            users[userIndex].totalRatings = totalRatings;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Platform Messages methods
    createPlatformMessage(messageData) {
        const newMessage = {
            id: Date.now().toString(),
            title: messageData.title,
            content: messageData.content,
            type: messageData.type,
            createdAt: new Date().toISOString(),
            createdBy: getCurrentUser()?.email || 'admin'
        };

        this.platformMessages.push(newMessage);
        this.savePlatformMessages(this.platformMessages);
        return newMessage;
    }

    // Analytics methods
    getStats() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const totalUsers = users.length;
        const totalRequests = this.swapRequests.length;
        const completedSwaps = this.swapRequests.filter(r => r.status === 'completed').length;
        const avgRating = this.feedback.length > 0 
            ? Math.round((this.feedback.reduce((sum, f) => sum + f.rating, 0) / this.feedback.length) * 10) / 10
            : 0;

        return {
            totalUsers,
            totalRequests,
            completedSwaps,
            avgRating
        };
    }

    // Report generation
    generateUserActivityReport() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userActivity = users.map(user => {
            const sentRequests = this.swapRequests.filter(r => r.fromUserId === user.id).length;
            const receivedRequests = this.swapRequests.filter(r => r.toUserId === user.id).length;
            const completedSwaps = this.swapRequests.filter(r => 
                (r.fromUserId === user.id || r.toUserId === user.id) && r.status === 'completed'
            ).length;

            return {
                name: user.name,
                email: user.email,
                joinDate: user.joinDate,
                sentRequests,
                receivedRequests,
                completedSwaps,
                rating: user.rating,
                totalRatings: user.totalRatings,
                isPublic: user.isPublic
            };
        });

        return userActivity;
    }

    generateFeedbackReport() {
        return this.feedback.map(f => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const fromUser = users.find(u => u.id === f.fromUserId);
            const toUser = users.find(u => u.id === f.toUserId);
            const request = this.swapRequests.find(r => r.id === f.swapRequestId);

            return {
                fromUser: fromUser?.name || 'Unknown',
                toUser: toUser?.name || 'Unknown',
                rating: f.rating,
                comment: f.comment,
                createdAt: f.createdAt,
                skillsSwapped: request ? `${request.offeredSkill} ↔ ${request.requestedSkill}` : 'Unknown'
            };
        });
    }

    generateSwapStatsReport() {
        const statusCounts = this.swapRequests.reduce((acc, request) => {
            acc[request.status] = (acc[request.status] || 0) + 1;
            return acc;
        }, {});

        const skillPopularity = {};
        this.swapRequests.forEach(request => {
            skillPopularity[request.offeredSkill] = (skillPopularity[request.offeredSkill] || 0) + 1;
            skillPopularity[request.requestedSkill] = (skillPopularity[request.requestedSkill] || 0) + 1;
        });

        const monthlyStats = this.swapRequests.reduce((acc, request) => {
            const month = new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});

        return {
            statusCounts,
            skillPopularity: Object.entries(skillPopularity)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10),
            monthlyStats
        };
    }
}

// Global data instance
const dataManager = new DataManager();

// Global data functions
function createSwapRequest(requestData) {
    return dataManager.createSwapRequest(requestData);
}

function updateSwapRequest(requestId, updates) {
    return dataManager.updateSwapRequest(requestId, updates);
}

function deleteSwapRequest(requestId) {
    return dataManager.deleteSwapRequest(requestId);
}

function getSwapRequestsForUser(userId) {
    return dataManager.getSwapRequestsForUser(userId);
}

function createFeedback(feedbackData) {
    return dataManager.createFeedback(feedbackData);
}

function getFeedbackForUser(userId) {
    return dataManager.getFeedbackForUser(userId);
}

function createPlatformMessage(messageData) {
    return dataManager.createPlatformMessage(messageData);
}

function getStats() {
    return dataManager.getStats();
}

function generateReport(type) {
    switch (type) {
        case 'user-activity':
            return dataManager.generateUserActivityReport();
        case 'feedback':
            return dataManager.generateFeedbackReport();
        case 'swap-stats':
            return dataManager.generateSwapStatsReport();
        default:
            return [];
    }
}

// Helper function to download data as CSV
function downloadReport(type) {
    const data = generateReport(type);
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
}